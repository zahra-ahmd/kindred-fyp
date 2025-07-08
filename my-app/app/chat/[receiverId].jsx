import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const ChatScreen = () => {
  const { user } = useAuth();
  const route = useRoute();
  const { receiverId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (user && receiverId) {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('message_id, sender_id, receiver_id, content, sent_at')
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
          )
          .order('sent_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
        } else {
          setMessages(data);
        }
      };

      fetchMessages();

      const channel = supabase
        .channel('realtime-chat')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            const msg = payload.new;
            const isBetweenUsers =
              (msg.sender_id === user.id && msg.receiver_id === receiverId) ||
              (msg.sender_id === receiverId && msg.receiver_id === user.id);

            if (isBetweenUsers) {
              setMessages((prevMessages) => [...prevMessages, msg]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, receiverId]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: user.id,
        receiver_id: receiverId,
        content: newMessage, // use correct column name
        sent_at: new Date(),
      },
    ]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  const renderMessage = ({ item }) => {
    const isSender = item.sender_id === user.id;
    return (
      <View
        style={[
          styles.messageContainer,
          isSender ? styles.senderMessage : styles.receiverMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.sent_at).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.message_id.toString()}
        contentContainerStyle={styles.messageList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    marginVertical: 5,
    borderRadius: 12,
    flexDirection: 'column',
  },
  senderMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  receiverMessage: {
    backgroundColor: '#f1f0f0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#0078D4',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
