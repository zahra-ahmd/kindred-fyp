import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const ChooseInterests = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { result } = useLocalSearchParams(); // Get final MBTI result like "ESTJ"

  const [interestOptions, setInterestOptions] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterests = async () => {
      setLoading(true); // Start loading
      const { data, error } = await supabase
        .from('mbti_types')
        .select('interests')
        .eq('type', result); // Use the final MBTI result (e.g., "ESTJ")

      if (error) {
        setError('Failed to load interests');
        console.error('Error fetching interests:', error);
      } else {
        const flatInterests = [...new Set(data.flatMap(item => item.interests || []))];
        setInterestOptions(flatInterests.map(i => i.trim().toLowerCase()));
      }
      setLoading(false); // End loading
    };

    if (result) {
      fetchInterests(); // Only fetch if `result` is available
    }
  }, [result]); // Trigger when the `result` changes

  const handleToggleInterest = (interest) => {
    const alreadySelected = selectedInterests.includes(interest);
    if (alreadySelected) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      if (selectedInterests.length >= 5) {
        Alert.alert('Limit', 'You can only select up to 5 interests');
        return;
      }
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async () => {
    const formattedTags = selectedInterests
      .map(tag => tag.trim().toLowerCase())
      .filter((tag, idx, arr) => tag !== '' && arr.indexOf(tag) === idx);

    if (formattedTags.length < 3) {
      Alert.alert('Minimum Required', 'Please select at least 3 interests');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ selected_interests: formattedTags })
      .eq('id', user.id);

    if (error) {
      Alert.alert('Error', 'Failed to save interests');
    } else {
      router.replace('/home');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Choose your interests</Text>
      <Text style={styles.subtitle}>Select at least 3 to personalize your feed</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#333" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.interestGrid}>
          {interestOptions.map((interest) => {
            const selected = selectedInterests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                onPress={() => handleToggleInterest(interest)}
                style={[styles.interestChip, selected && styles.interestChipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { color: '#666', marginBottom: 20 },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  interestChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EEE',
    borderRadius: 20,
  },
  interestChipSelected: {
    backgroundColor: '#333',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  chipTextSelected: {
    color: '#FFF',
  },
  button: {
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ChooseInterests;
