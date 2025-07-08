import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { supabase } from '@/lib/supabase'; 
import MyButton from '@/components/MyButton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

const Settings = () => {
    const { setAuth } = useAuth();
    const router = useRouter();  // Initialize router
  
    const handleLogout = async () => {
      const { error } = await supabase.auth.signOut();
  
      if (error) {
        Alert.alert('Sign out', "Error signing out");
      } else {
        setAuth(null);
        router.replace('/login'); 
      }
    };
  return (
    <View style={styles.container}>
      <MyButton
                title="Logout"
                variant="outline" 
                width={'80%'}
                onPress={handleLogout}
      />
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 70,
    // padding: 50,
    gap: 20,
  }
})