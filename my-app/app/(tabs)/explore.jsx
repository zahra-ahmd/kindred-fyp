import React, { useEffect, useState } from 'react';
import { TextInput, FlatList, Text, View, StyleSheet, TouchableOpacity, RefreshControl, } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Search = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('username, selected_interests')
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

  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear search input and results on refresh (optional)
      setSearchQuery('');
      setResults([]);

      // Refetch recommended posts
      await getUnfollowedPosts();

      // Optionally refetch profile (if you want)
      // await fetchUserProfile();
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    setRefreshing(false);
  };
  const search = async (query) => {
    if (!query) {
      setResults([]);
      return;
    }

    if (query.startsWith('#')) {
      const tag = query.slice(1);

      const { data: postResults, error: postError } = await supabase
        .from('posts')
        .select('post_id, content, user_id, profiles(username), tags')
        .contains('tags', [tag]);

      if (postError) {
        console.error('Search error:', postError);
        return;
      }

      setResults(postResults);
    } else {
      const { data: userResults, error: userError } = await supabase
        .from('profiles')
        .select('id, username, name, selected_interests')
        .or(`username.ilike.%${query}%,name.ilike.%${query}%`);

      const { data: postResults, error: postError } = await supabase
        .from('posts')
        .select('post_id, content, user_id, profiles(username), tags')
        .ilike('content', `%${query}%`);

      if (userError || postError) {
        console.error('Search error:', userError || postError);
        return;
      }

      setResults([...userResults, ...postResults]);
    }
  };

  const getUnfollowedPosts = async () => {
    if (!user) return;

    // Step 1: Get followed user IDs
    const { data: followingData, error: followingError } = await supabase
      .from('follow')
      .select('following')
      .eq('follower', user.id);

    if (followingError) {
      console.error('Error fetching follows:', followingError.message);
      return;
    }

    const followedIds = followingData.map((f) => f.following);

    // Step 2: Fetch posts from users NOT followed
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('post_id, content, user_id, profiles(username), tags')
      .not('user_id', 'in', `(${[...followedIds, user.id].join(',')})`);

    if (postsError) {
      console.error('Error fetching posts:', postsError.message);
    } else {
      setRecommendedPosts(posts);
    }
  };

  useEffect(() => {
    getUnfollowedPosts();
  }, [user]);

  const [isFocused, setIsFocused] = useState(false);
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Kindred</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            search(text);
          }}
          placeholder="Search for users or posts"
          style={styles.searchInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearIcon}
            onPress={() => {
              setSearchQuery('');
              setResults([]);
            }}
          >
            <Ionicons name="close-circle" size={24} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, index) => {
          if ('post_id' in item) return `post-${item.post_id}`;
          else if ('id' in item) return `user-${item.id}`;
          return index.toString();
          
        }}
        renderItem={({ item }) => {
          if (item.username && item.name !== undefined) {
            return (
              <TouchableOpacity
                style={styles.resultCard}
                onPress={() => router.push(`/profile/${item.id}`)}
              >
                <Text style={styles.resultTitle}>{item.username}</Text>
                <Text style={styles.resultSubtitle}>{item.name}</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => router.push(`/post/${item.post_id}`)}
            >
              <Text style={styles.resultTitle}>
                @{item.profiles?.username ?? 'Someone'} posted this:
              </Text>
              <Text style={styles.resultSubtitle}>
                {item.content.length > 100 ? `${item.content.slice(0, 100)}...` : item.content}
              </Text>
            </TouchableOpacity>
          );
        }}
          refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      
      {searchQuery === '' && recommendedPosts.length > 0 && (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionSubtitle}>Posts you may like</Text>
          </View>

          <FlatList
            data={recommendedPosts}
            keyExtractor={(item) => `recommended-${item.post_id}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestedPosts}
                onPress={() => router.push(`/post/${item.post_id}`)}
              >
                <Text style={styles.resultTitle}>
                  @{item.profiles?.username ?? 'Someone'}:
                </Text>
                <Text style={styles.resultSubtitle}>
                {item.content}
                </Text>
              </TouchableOpacity>
            )}
              refreshControl={
             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    alignItems: 'center',
    paddingTop: 10,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#000',
  },
  title: {
    paddingHorizontal: 15,
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
    marginTop: 10,
  },
  searchInput: {
    height: 50,
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
  },
  clearIcon: {
    padding: 5,
  },
  resultCard: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    marginHorizontal: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  suggestedPosts: {
    padding: 20,
    // marginBottom: 10,
    borderRadius: 10,
    //height: 60,
    backgroundColor: '#fff',
    //borderWidth: 0.2,
    borderBottomWidth: 0.2,
    borderTopWidth: 0.2,
    marginHorizontal: 10,
  }
});
