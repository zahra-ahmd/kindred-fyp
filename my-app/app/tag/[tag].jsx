import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function TagPostsScreen() {
  const { tag } = useLocalSearchParams();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostsByTag = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('posts')
        .select('post_id, content, created_at, profiles(username), user_id, tags')
        .contains('tags', [tag]);

      if (error) {
        console.error('Error fetching posts by tag:', error.message);
      } else {
        setPosts(data);
      }

      setLoading(false);
    };

    if (tag) fetchPostsByTag();
  }, [tag]);

  const handleAddToInterests = async () => {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      Alert.alert('Error', 'You must be logged in to follow a tag.');
      return;
    }

    // Step 1: Fetch current interests
    const { data, error } = await supabase
      .from('profiles')
      .select('selected_interests')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Fetch error:', error);
      return;
    }

    const currentInterests = data?.selected_interests || [];

    // Step 2: Add new tag (if not duplicate)
    const updatedInterests = [...new Set([...currentInterests, tag])];

    // Step 3: Update
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ selected_interests: updatedInterests })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      Alert.alert('Success', `#${tag} added to your interests.`);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!posts.length) {
    return (
      <View style={styles.centered}>
        <Text>No posts found for #{tag}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        
        <Ionicons name="arrow-back" size={24} onPress={() => router.back()} />
       
        <TouchableOpacity onPress={handleAddToInterests} style={{flexDirection: 'row'}}>
        <Text style={{ paddingRight: 5, fontSize: 18, fontWeight: '600' }}> Add as Interest</Text>
          <Ionicons name="add-circle-outline" size={27} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>Posts tagged with #{String(tag)}</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.post_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postCard}
            onPress={() => router.push(`/post/${item.post_id}`)}
          >
            <Text style={styles.username}>@{item.profiles?.username ?? 'Unknown user'}</Text>
            <Text style={styles.content}>{item.content}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center'
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  postCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 2,
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  content: {
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
