import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import api from '../../api/axiosConfig';
import {
  FaUser, FaLock, FaBell, FaTrash, FaExclamationTriangle, FaCheckCircle,
} from 'react-icons/fa';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  // Delete account flow
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setError('Please type DELETE to confirm.');
      return;
    }
    if (!deletePassword) {
      setError('Please enter your password.');
      return;
    }

    setDeleting(true);
    setError('');
    try {
      await api.post('accounts/delete-account/', { password: deletePassword });
      setSuccess('Account deleted. Redirecting...');
      setTimeout(() => {
        dispatch(logout());
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gold-700 dark:text-gold-300 mb-6">Settings</h1>

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-2">
          <FaCheckCircle /> {success}
        </div>
      )}

      <div className="space-y-4">
        {/* Account Info */}
        <div className="glass p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <FaUser className="text-gold-600 text-xl" />
            <h2 className="text-lg font-semibold text-gold-700 dark:text-gold-300">Account Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Username</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{user?.username || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Email</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{user?.email || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Role</p>
              <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">{user?.role || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Phone</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{user?.phone_number || 'Not set'}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="mt-4 text-sm text-gold-600 hover:underline"
          >
            Edit profile →
          </button>
        </div>

        {/* Notifications */}
        <div className="glass p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <FaBell className="text-gold-600 text-xl" />
            <h2 className="text-lg font-semibold text-gold-700 dark:text-gold-300">Notifications</h2>
          </div>
          <div className="space-y-3">
            <ToggleRow
              label="Push Notifications"
              desc="Get notified about messages and orders"
              value={notifications}
              onChange={() => setNotifications(!notifications)}
            />
            <ToggleRow
              label="Email Updates"
              desc="Receive weekly summaries and tips"
              value={emailUpdates}
              onChange={() => setEmailUpdates(!emailUpdates)}
            />
          </div>
        </div>

        {/* Security */}
        <div className="glass p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <FaLock className="text-gold-600 text-xl" />
            <h2 className="text-lg font-semibold text-gold-700 dark:text-gold-300">Security</h2>
          </div>
          <button
            onClick={() => navigate('/wallet/security')}
            className="w-full text-left p-3 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/20 transition border border-gold-200/50"
          >
            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Wallet PIN</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Set or change your PIN</p>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="glass p-6 rounded-2xl shadow-lg border-2 border-red-200 dark:border-red-900/50">
          <div className="flex items-center gap-3 mb-4">
            <FaExclamationTriangle className="text-red-500 text-xl" />
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Once you delete your account, all your data (gigs, projects, orders, wallet, chats) is permanently removed. This cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm"
          >
            <FaTrash size={12} /> Delete My Account
          </button>
        </div>

        {/* Logout */}
        <div className="glass p-6 rounded-2xl shadow-lg">
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-red-500 text-2xl" />
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Delete Account</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This will permanently delete your account and all associated data. Type <strong>DELETE</strong> to confirm.
            </p>

            {error && (
              <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE"
              className="w-full p-3 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-red-400 outline-none mb-3"
            />
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your password"
              className="w-full p-3 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-red-400 outline-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm !== 'DELETE'}
                className={`flex-1 py-2.5 rounded-lg text-white font-semibold transition ${
                  deleting || deleteConfirm !== 'DELETE'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                  setDeletePassword('');
                  setError('');
                }}
                className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToggleRow = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gold-50/50 dark:hover:bg-gold-900/20 transition">
    <div>
      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{label}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors relative ${
        value ? 'bg-gold-500' : 'bg-gray-300 dark:bg-gray-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          value ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export default Settings;