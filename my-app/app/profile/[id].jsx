import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import mbtiInfo from '@/assets/mbti_data';
import mbtiData from '@/constants/mbti_descriptions.json';

import { useAuth } from '@/contexts/AuthContext';
import MyButton from '@/components/MyButton';


const UserProfileScreen = () => {
  const [compatibility, setCompatibility] = useState(null);
  const { id } = useLocalSearchParams(); // The user ID from URL
  const { user, loading: authLoading } = useAuth(); // Current logged-in user
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [mbtiDetails, setMbtiDetails] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Show loading screen if auth is loading or user is not logged in
  if (authLoading || !user) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  // Get the initials from a name or username
  const getInitials = (name, username) => {
    if (!name && !username) return '?';
    const source = name || username;
    const words = source.trim().split(' ');
    return words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : source[0].toUpperCase();
  };

  // Check if the current user is following the profile
  const checkFollowing = async () => {
    const { data, error } = await supabase
      .from('follow')
      .select('*')
      .eq('follower', user.id)
      .eq('following', id)
      .single();

    setIsFollowing(!!data);
  };

  // Toggle follow/unfollow
  const handleFollowToggle = async () => {
    if (isFollowing) {
      // Unfollow: Remove from the followers table
      const { error } = await supabase
        .from('follow')
        .delete()
        .eq('follower', user.id)
        .eq('following', id);

      if (error) console.error('Unfollow error:', error);
      else {
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1); // Decrement follower count
      }
    } else {
      // Follow: Insert into the followers table
      const { error } = await supabase
        .from('follow')
        .insert({ follower: user.id, following: id });

      if (error) console.error('Follow error:', error);
      else {
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1); // Increment follower count
      }
    }
  };

  // Fetch profile data and compatibility score
  useEffect(() => {
    const fetchProfileData = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, name, mbti_type_id, mbti_types ( type)')
        .eq('id', id)
        .single();
    
      if (error) {
        console.error('Profile fetch error:', error);
      } else {
        setProfile(data);
        if (Array.isArray(mbtiInfo)) {
          const mbtiData = mbtiInfo.find(item => item.type === data.mbti_types?.type);
          setMbtiDetails(mbtiData);
          console.log('MBTI Details:', mbtiDetails);

        }
      }
    };

    const fetchCountsAndPosts = async () => {
      const [{ count: postCountValue }, { count: followersValue }, { count: followingValue }] =
        await Promise.all([ 
          supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', id),
          supabase.from('follow').select('*', { count: 'exact', head: true }).eq('following', id),
          supabase.from('follow').select('*', { count: 'exact', head: true }).eq('follower', id)
        ]);
      setPostCount(postCountValue ?? 0);
      setFollowersCount(followersValue ?? 0);
      setFollowingCount(followingValue ?? 0);
    };

    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, likes(count), comments(count)')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (!error) {
        const formatted = data.map(post => ({
          ...post,
          like_count: post.likes?.length ?? 0,
          comment_count: post.comments?.length ?? 0
        }));
        setPosts(formatted);
      }
    };

    const fetchCompatibility = async () => {
      const { data, error } = await supabase
        .from('compatibility')
        .select('score')
        .eq('user_1', user.id)
        .eq('user_2', id)
        .single();

      if (data) setCompatibility(data.score);
      if (error) console.error('Compatibility fetch error:', error);
    };

    const fetchData = async () => {
      await fetchProfileData();
      await fetchCountsAndPosts();
      await fetchPosts();
      await fetchCompatibility();
      await checkFollowing();
      setLoading(false); // Set loading state to false after all data is fetched
    };

    fetchData();
  }, [id, user.id]);

  if (loading || !profile) return <ActivityIndicator style={{ marginTop: 40 }} />;

  const mbti_Type = profile?.mbti_types?.type;
  const mbti_Info = mbtiData.find((item) => item.type === mbti_Type);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} onPress={() => router.back()} />
        <Text style={styles.headerText}>@{profile.username}</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.profilePictureContainer}>
        <View style={styles.profilePicture}>
          <Text style={styles.initialText}>{getInitials(profile.name, profile.username)}</Text>
        </View>
      </View>
      <View style={styles.userInfoContainer}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        

        {user.id !== id && (
          <TouchableOpacity style={styles.followButton} onPress={handleFollowToggle}>
            <Text style={{ color: 'white', fontWeight: '600' }}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.followInfo}>
          <View style={styles.followColumn}>
            <Text style={styles.followNumber}>{postCount}</Text>
            <Text style={styles.followLabel}>Posts</Text>
          </View>
          <View style={styles.followColumn}>
            <Text style={styles.followNumber}>{followersCount}</Text>
            <Text style={styles.followLabel}>Followers</Text>
          </View>
          <View style={styles.followColumn}>
            <Text style={styles.followNumber}>{followingCount}</Text>
            <Text style={styles.followLabel}>Following</Text>
          </View>
        </View>
      </View>

        <View>
          <Text style={styles.name}>Posts made by @{profile.username}</Text>
          {posts.length === 0 ? (
            <View style={styles.postView}>
            <Text style={styles.postText}>No posts yet.</Text>
            </View>
          ) : (
            posts.map(post => (
              <TouchableOpacity 
              key={post.id}
              style={styles.postCard}
              onPress={() => router.push(`/post/${post.post_id}`)}
              >
                <View style={styles.postHeader}>
                  <View style={styles.profilePictureSmall}>
                    <Text style={{ color: 'white' }}>
                      {getInitials(profile.name, profile.username)}
                    </Text>
                  </View>
                  <Text style={styles.postUsername}>@{profile.username}</Text>
                </View>
                <Text>{post.content}</Text>
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Entypo name="heart-outlined" size={20} />
                    <Text style={{ marginLeft: 4 }}>{post.like_count}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="comment-outline" size={20} />
                    <Text style={{ marginLeft: 4 }}>{post.comment_count}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 24,
    color: 'white',
  },
  followButton: {
    backgroundColor: '#06260E',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    // marginVertical: 10,
    marginBottom: 20, 
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  mbti: {
    fontSize: 20,
    fontWeight: '600',
    alignSelf: 'center',
    color: '#777',
    marginBottom: 20,
  },
  followInfo: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  followColumn: {
    alignItems: 'center',
  },
  followNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  followLabel: {
    fontSize: 14,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  tabText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderColor: '#000',
  },
  mbtiDetailsContainer: {
    marginBottom: 20,
  
  },
  mbtiDetailText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginVertical: 5,
    
  },
  listContainer: {
    marginVertical: 10,
    borderColor: '#000',
    borderWidth: 0.5,
    padding: 20,
    borderRadius: 10,
  },
  postCard: {
    backgroundColor: '#fff',padding: 16,
    marginBottom: 10, borderBottomWidth: 0.5
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, },
  profilePictureSmall: {
    backgroundColor: '#aaa', borderRadius: 50,
    width: 30, height: 30, justifyContent: 'center', alignItems: 'center'
  },
  postUsername: { marginLeft: 10, fontWeight: '600' },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  postText:{
    // marginTop: 50,
    alignSelf: 'center',
    fontSize: 20, 
    fontWeight: '600',
    marginVertical: 25,
  }, 
  postView: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  }
});

export default UserProfileScreen;
