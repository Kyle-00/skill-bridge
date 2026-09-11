import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/axiosConfig';

const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    role: 'both',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('accounts/profile/');
        setProfile(res.data);
      } catch {
        if (user) {
          setProfile({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            username: user.username || '',
            email: user.email || '',
            phone_number: user.phone_number || '',
            role: user.role || 'both',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('accounts/profile/', profile);
      setMessage('Profile updated successfully.');
    } catch {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gold-700 dark:text-gold-300 mb-6">My Profile</h1>
      <div className="glass p-6 rounded-3xl shadow-xl">
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${message.includes('success') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
              <input
                type="text"
                name="first_name"
                value={profile.first_name}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={profile.last_name}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={profile.phone_number}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select
              name="role"
              value={profile.role}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
            >
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
              <option value="both">Both</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gold-600 hover:bg-gold-700'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;