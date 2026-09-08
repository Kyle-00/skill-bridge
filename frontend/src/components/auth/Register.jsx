import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import api from '../../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'both' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('accounts/users/', form);
      const res = await api.post('token/', { email: form.email, password: form.password });
      const userRes = await api.get('accounts/users/me/', {
        headers: { Authorization: `Bearer ${res.data.access}` },
      });
      dispatch(setCredentials({ user: userRes.data, token: res.data.access }));
      navigate('/dashboard');
    } catch {
      alert('Registration failed');
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = 'http://localhost:8000/api/v1/accounts/google/';
  };

  return (
    <div className="max-w-md mx-auto mt-20 glass p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-gold-700 dark:text-gold-300 mb-6">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
        >
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
          <option value="both">Both</option>
        </select>
        <button type="submit" className="w-full bg-gold-600 text-white py-3 rounded-lg hover:bg-gold-700 transition">
          Register
        </button>
      </form>

      <div className="mt-4 flex items-center gap-4">
        <hr className="flex-1 border-gold-200 dark:border-gold-700" />
        <span className="text-sm text-gray-500 dark:text-gray-400">OR</span>
        <hr className="flex-1 border-gold-200 dark:border-gold-700" />
      </div>

      <button
        onClick={handleGoogleSignUp}
        className="w-full mt-4 flex items-center justify-center gap-2 border border-gold-600 text-gold-600 py-3 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/30 transition"
      >
        <FaGoogle /> Sign up with Google
      </button>

      <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
        Already have an account? <Link to="/login" className="text-gold-600 hover:underline">Login</Link>
      </p>
    </div>
  );
};
export default Register;