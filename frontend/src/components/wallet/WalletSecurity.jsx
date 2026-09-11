import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { FaLock, FaCheckCircle } from 'react-icons/fa';

const WalletSecurity = () => {
  const navigate = useNavigate();
  const [hasPin, setHasPin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('wallet/balance/');
        setHasPin(res.data.has_pin);
      } catch (err) {
        console.error('Error fetching PIN status:', err);
      }
    };
    fetchStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be 4 to 6 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }
    if (!/^\d+$/.test(pin)) {
      setError('PIN must contain only numbers.');
      return;
    }

    setLoading(true);
    try {
      if (hasPin) {
        await api.post('wallet/change_pin/', { old_pin: oldPin, new_pin: pin });
      } else {
        await api.post('wallet/set_pin/', { pin });
      }
      setSuccess(true);
      setTimeout(() => navigate('/wallet'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save PIN.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-4">
        <div className="glass p-12 rounded-3xl shadow-xl text-center">
          <FaCheckCircle className="text-6xl text-gold-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">PIN Saved</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Redirecting to wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <div className="glass p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <FaLock className="text-gold-500 text-2xl" />
          <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
            {hasPin ? 'Change PIN' : 'Set Wallet PIN'}
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Your PIN protects withdrawals and transfers. Use 4–6 digits.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {hasPin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none tracking-widest text-center"
                placeholder="••••"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {hasPin ? 'New PIN' : 'PIN'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none tracking-widest text-center"
              placeholder="••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none tracking-widest text-center"
              placeholder="••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gold-600 hover:bg-gold-700'
            }`}
          >
            {loading ? 'Saving...' : hasPin ? 'Change PIN' : 'Set PIN'}
          </button>
        </form>

        <button
          onClick={() => navigate('/wallet')}
          className="mt-4 text-sm text-gold-600 hover:underline"
        >
          ← Back to Wallet
        </button>
      </div>
    </div>
  );
};

export default WalletSecurity;