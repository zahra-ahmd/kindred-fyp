import torch
import torch.nn as nn
import torch.nn.functional as F
import pickle
from nltk.tokenize import word_tokenize
import numpy as np
import pandas as pd
import sklearn

# from app.models import StackedMBTIModel

with open('data/label_encoder.pkl', 'rb') as f:
    label_encoder = pickle.load(f)

with open('data/vocab.pkl', 'rb') as f:
    vocab = pickle.load(f)

MAX_LENGTH = 500

def preprocess_input(text, vocab, max_length=MAX_LENGTH):
    tokens = word_tokenize(text.lower())
    sequence = [vocab[word] for word in tokens if word in vocab]
    padded = sequence[:max_length] + [0] * (max_length - len(sequence))
    return torch.tensor([padded], dtype=torch.long)  # Shape: (1, max_length)

class CNNPersonalityModel(nn.Module):
    def __init__(self, vocab_size, embedding_dim=128, output_dim=16, embedding_matrix=None):
        super(CNNPersonalityModel, self).__init__()
        self.embedding = nn.Embedding.from_pretrained(embedding_matrix, freeze=False) if embedding_matrix is not None else nn.Embedding(vocab_size, embedding_dim)
        self.convs = nn.ModuleList([
            nn.Conv1d(in_channels=embedding_dim, out_channels=128, kernel_size=fs, padding=1)
            for fs in (3, 4, 5)
        ])
        self.fc1 = nn.Linear(128 * len((3, 4, 5)), 256)
        self.fc2 = nn.Linear(256, 128)
        self.fc3 = nn.Linear(128, 64)
        self.fc4 = nn.Linear(64, output_dim)
        self.dropout = nn.Dropout(0.5)
        self.batch_norm1 = nn.BatchNorm1d(128 * len((3, 4, 5)))
        self.batch_norm2 = nn.BatchNorm1d(256)

    def forward(self, x):
        x = self.embedding(x)
        x = x.permute(0, 2, 1)
        x = [torch.relu(conv(x)).max(dim=2)[0] for conv in self.convs]
        x = torch.cat(x, dim=1)
        x = self.batch_norm1(x)
        x = self.dropout(x)
        x = torch.relu(self.fc1(x))
        x = self.batch_norm2(x)
        x = self.dropout(x)
        x = torch.relu(self.fc2(x))
        x = torch.relu(self.fc3(x))
        return self.fc4(x)
    
    def get_features(self, x):
        """Extract features before the final classification layer"""
        x = self.embedding(x)
        x = x.permute(0, 2, 1)
        x = [torch.relu(conv(x)).max(dim=2)[0] for conv in self.convs]
        x = torch.cat(x, dim=1)
        x = self.batch_norm1(x)
        x = self.dropout(x)
        x = torch.relu(self.fc1(x))
        x = self.batch_norm2(x)
        x = self.dropout(x)
        x = torch.relu(self.fc2(x))
        x = torch.relu(self.fc3(x))
        return x  # Return features from the layer before fc4

class GRUPersonalityClassifier(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim, output_dim, pad_idx):
        super().__init__()
        
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=pad_idx)
        
        self.gru1 = nn.GRU(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            batch_first=True,
            bidirectional=True
        )
        
        self.gru2 = nn.GRU(
            input_size=hidden_dim * 2,  # because first GRU is bidirectional
            hidden_size=hidden_dim,
            batch_first=True,
            bidirectional=True
        )
        
        self.fc1 = nn.Linear(hidden_dim * 2, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, output_dim)
        
        self.dropout = nn.Dropout(0.5)
        self.relu = nn.ReLU()
        
    def forward(self, x):
        embedded = self.dropout(self.embedding(x))
        
        outputs, hidden = self.gru1(embedded)
        outputs, hidden = self.gru2(outputs)
        
        # hidden shape: (num_layers * num_directions, batch_size, hidden_dim)
        hidden = self.dropout(torch.cat((hidden[-2,:,:], hidden[-1,:,:]), dim=1))
        
        x = self.fc1(hidden)
        x = self.relu(x)
        x = self.dropout(x)
        x = self.fc2(x)
        return x
    
    def get_features(self, x):
        """Extract features before the final classification layer"""
        embedded = self.dropout(self.embedding(x))
        
        outputs, hidden = self.gru1(embedded)
        outputs, hidden = self.gru2(outputs)
        
        # hidden shape: (num_layers * num_directions, batch_size, hidden_dim)
        hidden = self.dropout(torch.cat((hidden[-2,:,:], hidden[-1,:,:]), dim=1))
        
        x = self.fc1(hidden)
        x = self.relu(x)
        x = self.dropout(x)
        return x  # Return features before the final fc2 layer

class StackedMBTIModel(nn.Module):
    def __init__(self, cnn_model_path, gru_model_path, output_dim):
        super(StackedMBTIModel, self).__init__()

        self.cnn_model = self._load_model(cnn_model_path)
        self.gru_model = self._load_model(gru_model_path)

        self._freeze_model_params(self.cnn_model)
        self._freeze_model_params(self.gru_model)
        
        self.cnn_feature_dim = 64
        self.gru_feature_dim = 256
        
        self.meta_learner = nn.Sequential(
            nn.Linear(self.cnn_feature_dim + self.gru_feature_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, output_dim)
        )
    
    def _load_model(self, model_path):
        try:
            model = torch.load(model_path, weights_only=False)
            model.eval()  # Set to evaluation mode
            return model
        except Exception as e:
            print(f"Error loading model from {model_path}: {e}")
            raise
    
    def _freeze_model_params(self, model):
        """Freeze parameters of a model to prevent them from being updated during training"""
        for param in model.parameters():
            param.requires_grad = False
    
    def forward(self, x):
        """
        Forward pass through the stacked model
        
        Args:
            x: Input data (text sequences)
            
        Returns:
            MBTI class predictions
        """
        # Get features from base models
        with torch.no_grad():  # No need to compute gradients for frozen models
            cnn_features = self.cnn_model.get_features(x)
            gru_features = self.gru_model.get_features(x)
        
        # Concatenate features
        combined_features = torch.cat((cnn_features, gru_features), dim=1)
        
        # Pass through meta-learner
        output = self.meta_learner(combined_features)
        
        return output
    
model = torch.load('models/stacked_mbti_model.pt', map_location=torch.device("cpu"), weights_only=False)
model.eval()

def predict_mbti(text):
    input_tensor = preprocess_input(text, vocab)
    with torch.no_grad():
        output = model(input_tensor)
        predicted_index = torch.argmax(output, dim=1).item()
        predicted_type = label_encoder.classes_[predicted_index]
    return predicted_type


