import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { mbtiCompatibility } from '../utils/mbtiCompatibility';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

const getInitials = (name, username) => {
  if (!name && !username) return '?';
  const source = name || username;
  const words = source.trim().split(' ');
  return words.length >= 2
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : source[0].toUpperCase();
};

export default function RecommendationsList() {
  const { user } = useAuth();
  const router = useRouter();
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [debugData, setDebugData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useEffect triggered");
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    setLoading(true);
    console.log("Fetching recommendations...");

    const { data: currentData, error: currentError } = await supabase
      .from('profiles')
      .select('id, mbti_type_id, mbti_types(type), selected_interests')
      .eq('id', user.id)
      .single();

    console.log("Current user profile:", currentData);
    if (currentError) console.error("Error fetching current user:", currentError);

    if (!currentData) {
      console.warn("No current user data found.");
      setLoading(false);
      return;
    }

    const { data: others, error: othersError } = await supabase
      .from('profiles')
      .select('id, username, name, mbti_type_id, mbti_types(type), selected_interests')
      .neq('id', user.id);

    console.log("Other users fetched:", others);
    if (othersError) console.error("Error fetching other users:", othersError);

    if (!others || others.length === 0) {
      console.warn("No other users found.");
      setLoading(false);
      return;
    }

    const scored = others.map((other) => {
      const mbtiScore =
        mbtiCompatibility[currentData.mbti_types.type]?.[other.mbti_types.type] || 0;

      const sharedInterests = other.selected_interests?.filter((interest) =>
        currentData.selected_interests?.includes(interest)
      ) || [];

      const interestScore =
        sharedInterests.length / Math.max(currentData.selected_interests?.length || 1, 1);

      const score = mbtiScore * 0.6 + interestScore * 0.4;

      console.log(`User ${other.username} - MBTI Score: ${mbtiScore}, Interest Score: ${interestScore}, Total Score: ${score}`);

      return {
        ...other,
        score,
        mbtiScore,
        interestScore,
        sharedInterests,
      };
    });

    const sorted = scored.sort((a, b) => b.score - a.score);
    const topFive = sorted.slice(0, 5);

    console.log("Top 5 recommended users:", topFive);

    setRecommendedUsers(topFive);
    setDebugData(scored);
    setLoading(false);

    await supabase
      .from('compatibility')
      .delete()
      .eq('user_1', user.id);
    
    const inserts = scored.map((item) => ({
      user_1: user.id,
      user_2: item.id,
      score: item.score,
    }));
    
    // Insert new compatibility scores
    const { error: insertError } = await supabase
      .from('compatibility')
      .insert(inserts);
    
    if (insertError) {
      console.error('Error inserting into compatibility table:', insertError);
    } else {
      console.log('Compatibility scores successfully stored');
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={recommendedUsers}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/profile/${item.id}`)}
          >
            <View style={styles.cardContent}>
              {/* Circle with initials */}
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>
                  {getInitials(item.full_name, item.username)}
                </Text>
              </View>
              <Text style={styles.fullName}>{item.name}</Text>
              <Text style={styles.username}>@{item.username}</Text>
              <Text style={styles.mbti}>MBTI: {item.mbti_types.type}</Text>
              <Text style={styles.score}>Score: {(item.score * 100).toFixed(1)}%</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginRight: 12,
    borderWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: 200,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flexDirection: 'column',
    alignItems: 'center', // Center-align content inside the card
    justifyContent: 'center', // Center-align content inside the card
    textAlign: 'center',

  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#c4c4c4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    
  },
  avatarInitials: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
  },
  fullName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#555',
  },
  mbti: {
    fontSize: 14,
    color: '#6b6b6b',
  },
  score: {
    fontSize: 14,
    color: '#6b6b6b',
  },
});
