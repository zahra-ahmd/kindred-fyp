import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; 
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import MyButton from '../../components/MyButton';

const NewPost = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState('');
  const [interestOptions, setInterestOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      if (!error) setProfile(data);
      setLoading(false);
    };

    const fetchInterests = async () => {
      const { data, error } = await supabase.from('mbti_types').select('interests');
      if (!error && data) {
        const flatInterests = [...new Set(data.flatMap(item => item.interests || []))];
        setInterestOptions(flatInterests);
      }
    };

    fetchUserProfile();
    fetchInterests();
  }, [user]);

  const handleSelectInterest = (interest) => {
    if (selectedInterests.includes(interest)) return;
    if (selectedInterests.length >= 3) {
      alert('You can only select up to 3 interests');
      return;
    }
    setSelectedInterests([...selectedInterests, interest]);
    setSearchQuery('');
  };

  const handleRemoveInterest = (interest) => {
    setSelectedInterests(selectedInterests.filter(i => i !== interest));
  };

  const handleCreatePost = async () => {
    if (!postText.trim()) {
      alert('Post content cannot be empty.');
      return;
    }

    const formattedTags = selectedInterests.map(tag => tag.trim()).filter(tag => tag !== '');

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            content: postText.trim(),
            tags: formattedTags,
            user_id: user.id,
          },
        ])
        .select();
      if (error) {
        alert('Failed to create post.');
      } else {
        alert('Post created successfully!');
        setPostText('');
        setSelectedInterests([]);
        router.push('/profile');
      }
    } catch (err) {
      alert('Something went wrong.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>New post</Text>
      </View>

      <View style={styles.userRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>SS</Text></View>
        <Text style={styles.username}>@{profile?.username || 'user'}</Text>
      </View>

      <TextInput
        style={styles.textInput}
        multiline
        maxLength={200}
        placeholder="what’s on your mind"
        value={postText}
        onChangeText={setPostText}
      />
      <Text style={styles.charCount}>{postText.length}/200</Text>

      <Text style={styles.tagLabel}>Add Interests (max 3)</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search interests..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {searchQuery.length > 0 && (
        <ScrollView
          style={styles.searchResults}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {interestOptions
            .filter(
              interest =>
                interest.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !selectedInterests.includes(interest)
            )
            .map((interest) => (
              <TouchableOpacity
                key={interest}
                onPress={() => handleSelectInterest(interest)}
                style={styles.searchResultItem}
              >
                <Text>{interest}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      )}


      <View style={styles.tagList}>
        {selectedInterests.map((interest) => (
          <TouchableOpacity
            key={interest}
            onPress={() => handleRemoveInterest(interest)}
            style={styles.tag}
          >
            <Text style={styles.tagText}>× {interest}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <MyButton 
          title="Post"
          variant="primary" 
          width={'50%'}
          onPress={handleCreatePost}
        />
      </View>
    </ScrollView>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '800',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontWeight: 'bold',
  },
  username: {
    fontWeight: 'bold',
  },
  textInput: {
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    marginTop: 5,
    color: '#888',
  },
  tagLabel: {
    marginTop: 20,
    fontWeight: 'bold',
  },
  searchInput: {
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  searchResults: {
    backgroundColor: '#F9F9F9',
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 6,
    maxHeight: 150,
  },
  searchResultItem: {
    padding: 10,
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  tag: {
    backgroundColor: '#EEE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 'auto',

    // padding: 20
  },
});
