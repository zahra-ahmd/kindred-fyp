import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function Results() {
  const { user } = useAuth();
  const { result } = useLocalSearchParams(); // Get final MBTI result like "ESTJ"

  const [loading, setLoading] = useState(true);
  const [mbtiType, setMbtiType] = useState('');

  const saveMBTIToUser = async (mbtiType) => {
    try {
      const { data: mbtiData, error: mbtiError } = await supabase
        .from('mbti_types')
        .select('mbti_id')
        .eq('type', mbtiType)
        .single();

      if (mbtiError || !mbtiData) {
        console.error('Error finding MBTI:', mbtiError || 'MBTI type not found');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          mbti_type_id: mbtiData.mbti_id, 
          mbti_type: mbtiData.mbtiType 
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      } else {
        console.log('MBTI saved successfully!');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  useEffect(() => {
    if (!result || !user) return;

    setMbtiType(result);
    saveMBTIToUser(result).finally(() => setLoading(false));
  }, [result, user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Saving your MBTI...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={100} color="#4CAF50" style={styles.icon} />
      <Text style={styles.title}>Your Personality Type:</Text>
      <Text style={styles.result}>{mbtiType}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push({ pathname: '/choose_interest', params: { result: mbtiType } })}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBEF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  result: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1B2C18',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#1B2C18',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
