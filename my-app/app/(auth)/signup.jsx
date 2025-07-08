import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import MyButton from '../../components/MyButton'; 

const SignupScreen = () => {

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);  // Loading state

  const handleSignup = async () => {
    if (!name || !username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    // Sign up the user using email and password
    const { data: {session}, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
              data : {
                name,
                username,
              }
            }
    });

    console.log('session: ', session)
    console.log('error: ', error)


    if (error) {
      Alert.alert('Signup Error', error.message);
      setLoading(false);
      return;
    }

    router.replace('/filler'); 
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Fill out your details</Text>
      <Text style={styles.subtitle}>Enter your primary details to register account</Text>

      <Image source={require('../../assets/images/login_image.jpg')} style={styles.image} />

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#A0A0A0"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#A0A0A0"
        autoCapitalize="none"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Create a username"
        placeholderTextColor="#A0A0A0"
        value={username}
        onChangeText={setUsername}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Create password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}>
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#A0A0A0"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.eyeIcon}>
          <Ionicons
            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#A0A0A0"
          />
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: 'center', paddingTop: 24 }}>
        <MyButton
          title="Sign Up"
          variant="outline" 
          width={'100%'}
          onPress={handleSignup}
          disabled={loading}  // Disable the button while loading
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBEF',
    paddingHorizontal: 30,
    paddingTop: 70,
  },
  image: {
    width: '100%',
    height: 130,
    borderRadius: 7,
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
});

export default SignupScreen;
