import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { supabase } from '@/lib/supabase'; // adjust your import
import { Heart, MessageCircle, Mail } from 'lucide-react-native';

dayjs.extend(relativeTime);

const iconMap = {
  like: <Heart color="red" size={20} />,
  comment: <MessageCircle color="orange" size={20} />,
  message: <Mail color="blue" size={20} />,
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    setRefreshing(true);
    const user = supabase.auth.user();
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) console.log('Error loading notifications:', error);
    else setNotifications(data);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();

    const user = supabase.auth.user();
    if (!user) return;

    // Subscribe to real-time new notifications
    const subscription = supabase
      .from(`notifications:receiver_id=eq.${user.id}`)
      .on('INSERT', payload => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.icon}>{iconMap[item.type] || null}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{dayjs(item.created_at).fromNow()}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={notifications}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} />}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No notifications yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  icon: { marginRight: 12, justifyContent: 'center' },
  message: { fontSize: 16, fontWeight: '600' },
  time: { fontSize: 12, color: '#666', marginTop: 4 },
});
