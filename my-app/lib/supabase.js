import { createClient } from '@supabase/supabase-js'
//import { createClient } from "jsr:@supabase/supabase-js"

import { AppState, Platform  } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'SUPABASE URL'
const supabaseAnonKey = 'SUPBASE ANON KEY'

const storage = Platform.OS === 'web' ? localStorage : AsyncStorage

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
  
  // Tells Supabase Auth to continuously refresh the session automatically
  // if the app is in the foreground. When this is added, you will continue
  // to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
  // `SIGNED_OUT` event if the user's session is terminated. This should
  // only be registered once.
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })

  