import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import api from '../../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('token/', { email, password });
      const userRes = await api.get('accounts/users/me/', {
        headers: { Authorization: `Bearer ${res.data.access}` },
      });
      dispatch(setCredentials({ user: userRes.data, token: res.data.access }));
      navigate('/dashboard');
    } catch {
      alert('Login failed');
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:8000/api/v1/accounts/google/';
  };

  return (
    <div className="max-w-md mx-auto mt-20 glass p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-gold-700 dark:text-gold-300 mb-6">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
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
        <button type="submit" className="w-full bg-gold-600 text-white py-3 rounded-lg hover:bg-gold-700 transition">
          Login
        </button>
      </form>

      <div className="mt-4 flex items-center gap-4">
        <hr className="flex-1 border-gold-200 dark:border-gold-700" />
        <span className="text-sm text-gray-500 dark:text-gray-400">OR</span>
        <hr className="flex-1 border-gold-200 dark:border-gold-700" />
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full mt-4 flex items-center justify-center gap-2 border border-gold-600 text-gold-600 py-3 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/30 transition"
      >
        <FaGoogle /> Sign in with Google
      </button>

      <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
        Don't have an account? <Link to="/register" className="text-gold-600 hover:underline">Register</Link>
      </p>
    </div>
  );
};
export default Login;