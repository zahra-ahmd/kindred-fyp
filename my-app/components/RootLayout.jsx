import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getUserData } from '../services/userService';
import { sendJwtToBackend } from '@/utils/sendJwtToBackend';

const RootLayout = () => {
  const { setAuth, setUserData } = useAuth();
  const [loading, setLoading] = useState(true);

  const updateUserData = async (user) => {
    if (!user?.id) return;

    const res = await getUserData(user?.id);
    if (res.success) {
      setUserData(res.data);
      console.log('user data:', res.data);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('session user login:', session?.user?.id);

      if (session?.access_token) {
        console.log('JWT Access Token:', session.access_token);
        sendJwtToBackend();

      }
      

      if (session?.user) {
        setAuth(session.user);
        updateUserData(session.user);
        router.replace('/home');
      } else {
        setAuth(null);
        router.replace('/welcome');
      }

      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
};

export default RootLayout;
