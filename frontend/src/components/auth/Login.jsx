import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import api from '../../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Google Sign-In button
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set in .env');
      return;
    }

    const handleGoogleSuccess = async (response) => {
      setLoading(true);
      try {
        const res = await api.post('accounts/google/verify/', {
          token: response.credential,
          role: 'both',
        });
        dispatch(setCredentials({
          user: res.data.user,
          token: res.data.access,
          refresh: res.data.refresh,
        }));
        navigate(res.data.user?.is_superuser ? '/admin' : '/dashboard');
      } catch {
        setError('Google sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleSuccess,
        cancel_on_tap_outside: false,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'pill',
          logo_alignment: 'center',
        }
      );
    }
  }, [dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const loginRes = await api.post('accounts/login/', { email, password });
      const accessToken = loginRes.data.access;
      const refreshToken = loginRes.data.refresh;

      const userRes = await api.get('accounts/profile/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      dispatch(setCredentials({
        user: userRes.data,
        token: accessToken,
        refresh: refreshToken,
      }));

      // Redirect based on role
      navigate(userRes.data.is_superuser ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 glass p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-gold-700 dark:text-gold-300 mb-6">Sign In</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Email or Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gold-600 hover:bg-gold-700'
          }`}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 flex items-center gap-4">
        <hr className="flex-1 border-gold-200 dark:border-gold-700" />
        <span className="text-sm text-gray-500 dark:text-gray-400">OR</span>
        <hr className="flex-1 border-gold-200 dark:border-gold-700" />
      </div>

      <div id="googleSignInButton" className="mt-4 w-full"></div>

      <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-gold-600 hover:underline">Register</Link>
      </p>
    </div>
  );
};

export default Login;