import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase'; 
import MyButton from '../../components/MyButton'; 


const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      Alert.alert('Login Error', loginError.message);
      setLoading(false);
      return;
    }

    router.push('/home');
    setLoading(false);

  };
  return (
    <ScrollView style={styles.container}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <Image source={require('../../assets/images/login_image.jpg')} style={styles.image} />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
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

        <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={{ alignItems: 'center'}}>
          <MyButton
                          title="Login"
                          variant="primary" 
                          width={'100%'}
                          onPress={handleLogin}
                        />
          </View>

        <View style={styles.bottomTextContainer}>
                  <Text style={styles.bottomText}>
                    Don't have an account?{' '}
                      <Text
                        style={styles.signupText}
                        onPress={() => router.push('/(auth)/signup')} // example route
                      >
                        Sign Up
                      </Text>
                  </Text>
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBEF',
    paddingHorizontal: 30,
    paddingTop: 60,
    alignContent: 'center',
  },
  image: {
    width: '100%',
    height: 200,
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
    fontWeight: 600,
    color: '#555',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
  },
  bottomTextContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  bottomText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  signupText: {
    color: '#06260E',
    fontWeight: '600',
  },

});


export default LoginScreen;
