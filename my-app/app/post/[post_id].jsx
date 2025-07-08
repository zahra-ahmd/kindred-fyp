import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function PostDetails() {
  const router = useRouter();
  const { post_id } = useLocalSearchParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('post_id, content, created_at, user_id, tags, profiles(username)')
        .eq('post_id', post_id)
        .single();

      if (error) console.error(error);
      else setPost(data);

      setLoading(false);
    };

    if (post_id) fetchPost();
  }, [post_id]);

  // Fetch likes and comments
  useEffect(() => {
    const fetchExtras = async () => {
      const { data: likeData } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', post_id);

      const { data: commentData } = await supabase
        .from('comments')
        .select('content, comment_id, user_id, post_id, profiles!id(username)')
        .eq('post_id', post_id);

      setLikes(likeData || []);
      setComments(commentData || []);

      const { data: { user } } = await supabase.auth.getUser();
      setHasLiked(likeData?.some(like => like.user_id === user?.id));
    };

    if (post_id) fetchExtras();
  }, [post_id]);

  // Subscribe to real-time updates
  useEffect(() => {
    const likeChannel = supabase
      .channel('likes-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'likes',
        filter: `post_id=eq.${post_id}`
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setLikes(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'DELETE') {
          setLikes(prev => prev.filter(like => like.user_id !== payload.old.user_id));
        }
      })
      .subscribe();

    const commentChannel = supabase
      .channel('comments-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${post_id}`
      }, payload => {
        setComments(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(likeChannel);
      supabase.removeChannel(commentChannel);
    };
  }, [post_id]);

  const handleLikeToggle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (hasLiked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', post_id)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('likes')
        .insert({ post_id, user_id: user.id });
    }

    setHasLiked(prev => !prev);
  };

  const handleAddComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('comments')
      .insert({ post_id, user_id: user.id, content: trimmed });

    setNewComment('');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text>Post not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} onPress={() => router.back()} />
        <View style={{ width: 24 }} />
      </View>

      <TouchableOpacity onPress={() => router.push(`/profile/${post.user_id}`)}>
        <Text style={styles.author}>
          @{post.profiles?.username ?? 'Unknown user'} posted:
        </Text>
      </TouchableOpacity>

      <Text style={styles.content}>{post.content}</Text>

      {post.tags?.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tag}
              onPress={() => router.push(`/tag/${encodeURIComponent(tag)}`)}
            >
              <Text style={styles.tagText}>#{String(tag)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.timestamp}>Posted on {new Date(post.created_at).toLocaleString()}</Text>

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLikeToggle} style={styles.iconButton}>
          <Ionicons name={hasLiked ? 'heart' : 'heart-outline'} size={24} color="red" />
          <Text>{likes.length}</Text>
        </TouchableOpacity>

        <View style={styles.iconButton}>
          <MaterialCommunityIcons name="comment-outline" size={24} color="gray" />
          <Text>{comments.length}</Text>
        </View>
      </View>

      <View style={styles.commentInputContainer}>
        <TextInput
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          style={styles.commentInput}
        />
        <TouchableOpacity onPress={handleAddComment}>
          <Text style={styles.postButton}>Post</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item, index) => item.comment_id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Text style={styles.commentUser}>@{item.profiles?.username ?? 'user'}</Text>
            <Text>{item.content}</Text>
          </View>
        )}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center'
  },
  author: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  content: {
    fontSize: 18,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  timestamp: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  postButton: {
    color: '#007AFF',
    fontWeight: '600',
  },
  comment: {
    marginBottom: 10,
  },
  commentUser: {
    fontWeight: '600',
    marginBottom: 2,
  },
});
