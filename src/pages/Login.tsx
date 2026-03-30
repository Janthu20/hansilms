import { useState } from 'react';
import { auth, signInWithEmailAndPassword } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lock, User } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login for:', username);
      // Map username to a dummy email for Firebase Auth
      // isuru123 -> isuru123@educonnect.com
      const email = username.includes('@') ? username : `${username}@educonnect.com`;
      console.log('Mapped email:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful for:', userCredential.user.email);
      navigate('/');
    } catch (err: any) {
      console.error('Login failed with error:', err.code, err.message);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid username or password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid username format.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in Firebase Console.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase Console. Please add it to Authorized Domains.');
      } else {
        setError(`Login error: ${err.message} (${err.code})`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 p-4 rounded-full">
            <BookOpen className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
        <p className="text-gray-500 mb-8">Enter your credentials to access the LMS dashboard.</p>
        
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="isuru123"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium mt-2 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-blue-100"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Secure admin access for EduConnect LMS.
          </p>
        </div>
      </div>
    </div>
  );
}
