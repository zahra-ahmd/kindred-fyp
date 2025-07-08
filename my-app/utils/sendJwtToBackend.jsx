import axios from 'axios';
import { supabase } from '@/lib/supabase'; // make sure this path matches your project

const BACKEND_URL = ''// Replace with your actual local IP

export const sendJwtToBackend = (jwtToken) => {
  if (!jwtToken) return;

  axios.post(BACKEND_URL, { token: jwtToken })
    .then(response => {
      console.log('✅ Sent JWT to backend:', response.data);
    })
    .catch(error => {
      console.error('❌ Error sending JWT:', error.message);
    });
};
