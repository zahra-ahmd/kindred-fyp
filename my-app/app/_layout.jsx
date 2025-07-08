import { AuthProvider, useAuth, setUserdata } from '../contexts/AuthContext'
import RootLayout from '@/components/RootLayout'; // Move it here
import '../errorConfig';


export default function Layout() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}
