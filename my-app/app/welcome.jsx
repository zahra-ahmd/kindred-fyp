{/** Welcome Screen */}

import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';

import { router } from 'expo-router'
import MyButton from '../components/MyButton'; 

import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';


const WelcomeScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFBEF' }}> 
    <StatusBar style="dark" backgroundColor="#FAFBEF" translucent={false} />
      <View style={styles.container}>
        {/* Logo */}
        <Image source={require('../assets/images/kindred-logo.png')} style={styles.logo} />
        
        {/* Title */}
        <Text style={styles.title}>kindred</Text>
        
        {/* Tagline */}
        <Text style={styles.subtitle}>Understand, Connect, Grow</Text>
        <Text style={styles.description}>Discover Like-Minded People</Text>
        
        {/* Leaf Image */}
        <Image source={require('../assets/images/welcome-image.png')} style={styles.image} />
        
        {/* Get Started Button */}
              {/* Get Started Button */}
              <MyButton
                title="Get Started"
                variant="primary" 
                onPress={() => router.push('/(auth)/signup')}
              />
        <View style={styles.bottomTextContainer}>
          <Text style={styles.bottomText}>
            Already got an account?{' '}
              <Text
                style={styles.loginText}
                onPress={() => router.push('/login')} // example route
              >
                Login
              </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBEF',
    alignItems: 'center',
    //justifyContent: 'center',
    //paddingHorizontal: 20,
    paddingVertical: 130,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
  },
  image: {
    width: 240,
    height: 180,
    borderRadius: 7,
    marginBottom: 24,
  },
  bottomTextContainer: {
    marginTop: 20,
  },
  bottomText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  loginText: {
    color: '#06260E',
    fontWeight: '600',
  },
  
});

export default WelcomeScreen;
