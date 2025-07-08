import React, { useState, useEffect, useCallback  } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable, RefreshControl,
} from 'react-native';
import { Ionicons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import mbtiInfo from '@/assets/mbti_data';
import mbtiData from '@/constants/mbti_descriptions.json';
import MyButton from '@/components/MyButton';
import PersonalityInsightsSection from '@/components/PersonalityInsightsSection';
import getUpdatedMBTI from '@/helpers/updatePersonality';

import { pingBackend } from "@/utils/pingBackend";


const ProfileScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('Personality Insights');
  const [profile, setProfile] = useState(null);
  const [mbtiDetails, setMbtiDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postCount, setPostCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [posts, setPosts] = useState([]);
  const [userInitial, setUserInitial] = useState('');
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('followers');
  const [simplePosts, setSimplePosts] = useState([]);

  const getInitials = (name, username) => {
    if (!name && !username) return '?';
    const source = name || username;
    const words = source.trim().split(' ');
    return words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : source[0].toUpperCase();
  };

  useEffect(() => {
    if (user?.id) {
      getUpdatedMBTI(user.id);
      fetchUserPosts()
    }
  }, [user]);

  useEffect(() => {
    if (profile && profile.mbti_types?.type && Array.isArray(mbtiInfo)) {
      const mbtiData = mbtiInfo.find(item => item.type === profile.mbti_types.type);
      if (mbtiData) setMbtiDetails(mbtiData);
    }
  }, [profile]);

  const fetchUserProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, name, mbti_type_id, mbti_types (type)')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setProfile(data);
      setUserInitial(getInitials(data.name, data.username));
    }
  };

  const fetchUserPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`*, likes(count), comments(count)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSimplePosts(data);
    }

    if (!error && data) {
      const formattedPosts = data.map(post => ({
        ...post,
        like_count: post.likes?.[0]?.count ?? 0,
        comment_count: post.comments?.[0]?.count ?? 0,
      }));
      setPosts(formattedPosts);
    }

    pingBackend(user.id, simplePosts);
  };

  const fetchCounts = async () => {
    const { count: postCountValue } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    setPostCount(postCountValue ?? 0);

    const { count: followersValue } = await supabase
      .from('follow')
      .select('*', { count: 'exact', head: true })
      .eq('following', user.id);
    setFollowersCount(followersValue ?? 0);

    const { count: followingValue } = await supabase
      .from('follow')
      .select('*', { count: 'exact', head: true })
      .eq('follower', user.id);
    setFollowingCount(followingValue ?? 0);
  };

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    await Promise.all([fetchUserProfile(), fetchUserPosts(), fetchCounts()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [user]);

  const openModal = async (type) => {
    setModalType(type);
    setModalVisible(true);
    const column = type === 'followers' ? 'following' : 'follower';
    const target = type === 'followers' ? 'follower' : 'following';

    const { data, error } = await supabase
      .from('follow')
      .select(`${target}(*, username, name)`)
      .eq(column, user.id);

    if (!error && data) {
      const users = data.map(item => item[target]);
      if (type === 'followers') setFollowersList(users);
      else setFollowingList(users);
    }
  };

  if (loading && !refreshing) return <Text style={styles.loadingText}>Loading...</Text>;

  const mbti_type = profile?.mbti_types?.type;
  const mbti_desc = mbtiData.find((item) => item.type === mbti_type);

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={
         <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>kindred</Text>
        <Ionicons
          name="settings-outline"
          size={27}
          color="black"
          onPress={() => router.push('/settings')}
        />
      </View>

      {/* Profile Picture */}
      <View style={styles.profilePictureContainer}>
        <View style={styles.profilePicture}>
          <Text style={styles.initialText}>{userInitial}</Text>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.username}>@{profile?.username}</Text>

        <View style={styles.followInfo}>
          <View style={styles.followColumn}>
            <Text style={styles.followNumber}>{postCount}</Text>
            <Text style={styles.followLabel}>Posts</Text>
          </View>

          <TouchableOpacity onPress={() => openModal('followers')}>
            <View style={styles.followColumn}>
              <Text style={styles.followNumber}>{followersCount}</Text>
              <Text style={styles.followLabel}>Followers</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openModal('following')}>
            <View style={styles.followColumn}>
              <Text style={styles.followNumber}>{followingCount}</Text>
              <Text style={styles.followLabel}>Following</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('Personality Insights')}>
          <Text style={[styles.tabText, activeTab === 'Personality Insights' && styles.activeTab]}>
            Personality Insights
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Posts')}>
          <Text style={[styles.tabText, activeTab === 'Posts' && styles.activeTab]}>
            Your Posts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Personality Tab */}
      {activeTab === 'Personality Insights' && mbtiDetails && (
        <View style={styles.mbtiDetailsContainer}>

         <PersonalityInsightsSection />
          <View style={styles.listContainer}>
            <Text style={styles.mbtiDetailText}>About your personality: </Text>
            <Text style={styles.mbti}>{profile?.mbti_types?.type}</Text>
            <Text style={styles.description}>{mbti_desc?.description || 'No description available'}</Text>
          </View>
          <View style={styles.listContainer}>
            <Text style={styles.mbtiDetailText}>Traits:</Text>
            <Text style={styles.description}>{mbtiDetails.traits ?? 'No traits available'}</Text>
          </View>
          <View style={styles.listContainer}>
            <Text style={styles.mbtiDetailText}>Strengths:</Text>
            <Text style={styles.description}>{mbtiDetails.strengths ?? 'No strengths available'}</Text>
          </View>
          <View style={styles.listContainer}>
            <Text style={styles.mbtiDetailText}>Weaknesses:</Text>
            <Text style={styles.description}>{mbtiDetails.weaknesses ?? 'No weaknesses available'}</Text>
          </View>
        </View>
      )}

      {/* Posts Tab */}
      {activeTab === 'Posts' && (
        <View style={{ paddingHorizontal: 10 }}>
          {posts.length === 0 ? (
            <View>
            <Text>No posts yet.</Text>
            <MyButton
              title="Create a Post"
              variant="outline" 
              width={'80%'}
              onPress={() => router.push('/add-post')}
            />
            </View>
          ) : (
            posts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.postCard}
                onPress={() => router.push(`/post/${post.post_id}`)}
              >
                <View style={styles.postHeader}>
                  <View style={styles.profilePictureSmall}>
                    <Text style={{ color: 'white' }}>{userInitial}</Text>
                  </View>
                  <Text style={styles.postUsername}>@{profile?.username}</Text>
                </View>
                <Text style={{ marginBottom: 10, marginTop: 15 }}>{post.content}</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Entypo name="heart-outlined" size={24} color="black" />
                    <Text style={{ marginLeft: 4 }}>{post.like_count}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="comment-outline" size={24} color="black" />
                    <Text style={{ marginLeft: 4 }}>{post.comment_count}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {modalType === 'followers' ? 'Followers' : 'Following'}
          </Text>
          <ScrollView>
            {(modalType === 'followers' ? followersList : followingList).map((user) => (
            <TouchableOpacity 
              key={user.id} 
              style={styles.modalItem} 
              onPress={() => {
                setModalVisible(false);
                setTimeout(() => {
                  router.push(`/profile/${user.id}`);
                }, 100);
              }}
            >
                <Text style={styles.modalUserText}>{user.name || user.username}</Text>
                <Text style={styles.modalUserSubText}>@{user.username}</Text>
            
            </TouchableOpacity>
            ))}
            {(modalType === 'followers' ? followersList : followingList).length === 0 && (
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>No users yet.</Text>
            )}
          
          </ScrollView>
          <Pressable onPress={() => setModalVisible(false)} style={styles.modalClose}>
            <Text style={{ color: '#000', fontWeight: 'bold' }}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  headerText: { fontSize: 24, fontWeight: 'bold', color: 'black' },
  profilePictureContainer: { alignItems: 'center', marginBottom: 20 },
  profilePicture: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center'
  },
  initialText: { fontSize: 36, color: 'white' },
  userInfoContainer: { alignItems: 'center', marginBottom: 20 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  username: { fontSize: 16, color: '#666', marginBottom: 10 },
  mbti: { fontSize: 16, color: '#777', marginBottom: 20 },
  followInfo: { flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' },
  followColumn: { alignItems: 'center' },
  followNumber: { fontSize: 20, fontWeight: '600', color: '#333' },
  followLabel: { fontSize: 14, color: '#666' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 20 },
  tabText: { fontSize: 18, fontWeight: '600', color: '#333', padding: 10 },
  activeTab: { borderBottomWidth: 3, borderColor: '#000' },
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
    backgroundColor: '#fff', paddingBottom: 16,
    marginBottom: 10, borderBottomWidth: 0.5
  },
  postHeader: { flexDirection: 'row', alignItems: 'center' },
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
  }, 
  description: {
    fontSize: 16, 
    fontWeight: '500',
    marginVertical: 25,
  },
  postUsername: { marginLeft: 10, fontWeight: '600' },
  modalContainer: { flex: 1, padding: 20, backgroundColor: 'white' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderColor: '#000', borderWidth: 1, marginVertical:5 , borderRadius: 10},
  modalUserText: { fontSize: 16, fontWeight: '600', marginHorizontal:10 },
  modalUserSubText: { fontSize: 14, color: '#777' , marginHorizontal:10 },
  modalClose: {
    marginTop: 20, padding: 10, alignItems: 'center', backgroundColor: '#eee', borderRadius: 10
  },
  mbti: {
    fontSize: 20,
    fontWeight: '600',
    alignSelf: 'center',
    color: '#777',
    marginBottom: 10,
  },
});

export default ProfileScreen;
