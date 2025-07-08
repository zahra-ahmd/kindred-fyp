import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Adjust the path as needed

const AuthContext = createContext({
  user: null,
  session: null,
  isLoading: true,
  setAuth: () => {},
  setUserData: () => {},
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let authSubscription = null;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error("Error getting session:", error.message);
        } else {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }

        const { data: { subscription }, error: listenerError } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            if (!isMounted) return;
            console.log(`Auth event: ${_event}`);
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setIsLoading(false);
          }
        );

        if (listenerError) {
          console.error("Error setting up auth listener:", listenerError.message);
          setIsLoading(false);
        }

        authSubscription = subscription;
        if (!initialSession) setIsLoading(false);
      } catch (err) {
        console.error("Unexpected error during auth init:", err);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      authSubscription?.unsubscribe();
    };
  }, []);

  // Manual setters (like your original version)
  const setAuth = authUser => {
    setUser(authUser);
  };

  const setUserData = userData => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  // Optional: Login & Logout
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      setAuth,
      setUserData,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
