import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import MyButton from '@/components/MyButton';
import { useRouter } from 'expo-router';

const InboxScreen = () => {
  const [chats, setChats] = useState([]);
  const navigation = useNavigation();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('message_id, receiver_id, sender_id, sent_at')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('sent_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
        return;
      }

      const uniqueChats = {};
      messages.forEach((msg) => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!uniqueChats[otherUserId]) {
          uniqueChats[otherUserId] = {
            message_id: msg.message_id,
            other_user_id: otherUserId,
            sent_at: msg.sent_at,
          };
        }
      });

      const chatArray = Object.values(uniqueChats);

      const userIds = chatArray.map(chat => chat.other_user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profileError) {
        console.error('Error fetching usernames:', profileError);
        return;
      }

      const userMap = {};
      profiles.forEach(profile => {
        userMap[profile.id] = profile.username;
      });

      const chatsWithUsernames = chatArray.map(chat => ({
        ...chat,
        username: userMap[chat.other_user_id] || 'Unknown',
      }));

      setChats(chatsWithUsernames);
    };

    fetchChats();

    // Realtime listener
    const channel = supabase
      .channel('realtime-chats')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMessage = payload.new;

          const isRelevant =
            newMessage.sender_id === user.id || newMessage.receiver_id === user.id;
          if (!isRelevant) return;

          const otherUserId =
            newMessage.sender_id === user.id
              ? newMessage.receiver_id
              : newMessage.sender_id;

          setChats((prevChats) => {
            const existingChat = prevChats.find(
              (chat) => chat.other_user_id === otherUserId
            );

            if (existingChat) {
              return prevChats.map((chat) =>
                chat.other_user_id === otherUserId
                  ? {
                      ...chat,
                      sent_at: newMessage.sent_at,
                      message_id: newMessage.message_id,
                    }
                  : chat
              );
            }

            return [
              {
                message_id: newMessage.message_id,
                other_user_id: otherUserId,
                sent_at: newMessage.sent_at,
                username: 'Unknown',
              },
              ...prevChats,
            ];
          });

          // Fetch username for unknown user
          const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', otherUserId)
            .single();

          if (!error && data?.username) {
            setChats((prevChats) =>
              prevChats.map((chat) =>
                chat.other_user_id === otherUserId
                  ? { ...chat, username: data.username }
                  : chat
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleCardPress = (receiverId) => {
    router.push(`/chat/${receiverId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Kindred</Text>
      </View>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.message_id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCardPress(item.other_user_id)} style={styles.chatCard}>
            <View>
              <Text style={styles.username}>@{item.username}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.sent_at).toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No chats yet.</Text>}
      />
      <MyButton
        title="Compose Message"
        variant="outline"
        width={'100%'}
        onPress={() => { router.push('/composeMessage'); }}
      />
    </View>
  );
};

export default InboxScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#000',
  },
  chatCard: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
});
