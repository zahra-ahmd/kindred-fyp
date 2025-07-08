import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

const ComposeMessageScreen = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [sentMessages, setSentMessages] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .neq('id', user.id);

      if (error) console.error('Error fetching users:', error);
      else setProfiles(data);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id}`,
        },
        (payload) => {
          setSentMessages((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const sendMessage = async () => {
    if (!selectedUserId || !message.trim()) return;

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: user.id,
        receiver_id: selectedUserId,
        content: message,
        sent_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setMessage('');
      router.push('/inbox'); // 👈 Navigate to Inbox after sending
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Compose New Message</Text>

      <Text style={styles.label}>Select a User:</Text>
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.userItem,
              selectedUserId === item.id && styles.selectedUser,
            ]}
            onPress={() => setSelectedUserId(item.id)}
          >
            <Text
              style={[
                styles.username,
                selectedUserId === item.id && { color: '#fff' },
              ]}
            >
              {item.username}
            </Text>
          </TouchableOpacity>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      <Text style={styles.label}>Your Message:</Text>
      <TextInput
        style={styles.input}
        multiline
        value={message}
        onChangeText={setMessage}
        placeholder="Type your message..."
      />

      <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>

      {sentMessages.length > 0 && (
        <View style={{ marginTop: 30 }}>
          <Text style={styles.label}>Sent Messages:</Text>
          {sentMessages.map((msg) => (
            <Text key={msg.message_id} style={{ marginVertical: 2 }}>
              {msg.content} — {new Date(msg.sent_at).toLocaleTimeString()}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  userItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  selectedUser: {
    backgroundColor: '#6200ee',
  },
  username: {
    color: '#333',
    fontWeight: '500',
  },
  input: {
    minHeight: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ComposeMessageScreen;
