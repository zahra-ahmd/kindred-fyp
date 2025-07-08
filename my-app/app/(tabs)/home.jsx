import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RecommendationsList from '@/components/RecommendationsList';

const HomeScreen = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followedPosts, setFollowedPosts] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchFollowedPosts = async () => {
      if (!user) return;

      const { data: follows, error: followError } = await supabase
        .from('follow')
        .select('following')
        .eq('follower', user.id);

      if (followError) {
        console.error('Error fetching follows:', followError);
        return;
      }

      const followedIds = follows.map((f) => f.following);
      if (followedIds.length === 0) {
        setFollowedPosts([]);
        return;
      }

      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('post_id, user_id, content, created_at, profiles(username)')
        .in('user_id', followedIds)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
      } else {
        setFollowedPosts(posts);
      }
    };

    fetchFollowedPosts();

    // Set up real-time subscription
    const channel = supabase
      .channel('realtime-followed-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          fetchFollowedPosts(); // Refetch posts on insert/update/delete
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>kindred</Text>

        <Ionicons
          name="settings-outline"
          size={27}
          color="black"
          style={styles.icon}
          onPress={() => router.push('/settings')}
        />
      </View>

      <View style={styles.maincontainer}>
        <Text style={styles.title}>Welcome back, {profile?.name || 'user'}!</Text>

        <Text style={styles.subtitle}>
          Suggested users based on our compatibility scoring:
        </Text>
        <RecommendationsList />

        <View style={styles.postsContainer}>
          <Text style={styles.subtitle}>Posts from people you follow:</Text>
          {followedPosts.map((post) => (
            <TouchableOpacity key={post.id} style={styles.postCard} onPress={() => router.push(`/post/${post.post_id}`)}>
              <Text style={styles.postUser}>@{post.profiles.username}</Text>
              <Text style={styles.postContent}>{post.content}</Text>
              <Text style={styles.postTime}>
                {new Date(post.created_at).toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  maincontainer: {
    marginVertical: 20,
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '800',
  },
  icon: {
    marginTop: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginVertical: 10,
  },
  postsContainer: {
    marginTop: 20,
  },
  postCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderColor: '#000',
    borderTopWidth: 0.2,
    
  },
  postUser: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  postContent: {
    fontSize: 14,
    marginBottom: 4,
  },
  postTime: {
    fontSize: 12,
    color: '#888',
  },
});

export default HomeScreen;
