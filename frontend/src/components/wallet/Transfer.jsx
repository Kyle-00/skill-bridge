import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { FaCheckCircle, FaUserCheck } from 'react-icons/fa';

const Transfer = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [pin, setPin] = useState('');
  const [balance, setBalance] = useState(0);
  const [hasPin, setHasPin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [looking, setLooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await api.get('wallet/balance/');
        setBalance(parseFloat(res.data.balance) || 0);
        setHasPin(res.data.has_pin);
      } catch (err) {
        console.error('Error fetching balance:', err);
      }
    };
    fetchBalance();
  }, []);

  const lookupRecipient = async () => {
    if (!recipient.trim()) return;
    setLooking(true);
    setRecipientInfo(null);
    setError('');
    try {
      const res = await api.get(`wallet/lookup/?wallet_id=${recipient.trim().toUpperCase()}`);
      setRecipientInfo(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Wallet not found.');
    } finally {
      setLooking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasPin) { setError('Please set a wallet PIN first.'); return; }
    if (!recipientInfo) { setError('Please verify the recipient wallet first.'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('Enter a valid amount.'); return; }
    if (amt > balance) { setError('Insufficient balance.'); return; }
    if (!pin) { setError('Enter your wallet PIN.'); return; }

    setLoading(true);
    setError('');
    try {
      await api.post('wallet/transfer/', {
        amount: amt,
        to_wallet_id: recipient.trim().toUpperCase(),
        pin,
      });
      navigate('/wallet');
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <div className="glass p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300 mb-2">Send Money</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Available: <span className="font-bold text-gold-600">${balance.toFixed(2)}</span>
        </p>

        {!hasPin && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
            Set a PIN first. <Link to="/wallet/security" className="underline font-semibold">Go to security</Link>
          </div>
        )}

        {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient Wallet ID</label>
            <div className="flex gap-2">
              <input
                type="text" value={recipient}
                onChange={(e) => { setRecipient(e.target.value.toUpperCase()); setRecipientInfo(null); }}
                className="flex-1 p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none font-mono"
                placeholder="SB-XXXXXXXX"
                required
              />
              <button
                type="button" onClick={lookupRecipient} disabled={looking || !recipient}
                className="px-4 py-3 bg-gold-600 text-white rounded-lg hover:bg-gold-700 text-sm font-semibold disabled:bg-gray-400"
              >
                {looking ? '...' : 'Verify'}
              </button>
            </div>
          </div>

          {recipientInfo && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm">
              <FaUserCheck className="text-green-600" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-200">
                  {recipientInfo.full_name || recipientInfo.username}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">@{recipientInfo.username}</p>
              </div>
              <FaCheckCircle className="text-green-600 ml-auto" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (USD)</label>
            <input
              type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              min="0.01" step="0.01" max={balance} required
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
              placeholder="25.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wallet PIN</label>
            <input
              type="password" inputMode="numeric" value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              maxLength={6} required
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none tracking-widest text-center"
              placeholder="••••"
            />
          </div>

          <button type="submit" disabled={loading || !hasPin || !recipientInfo}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              loading || !hasPin || !recipientInfo ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}>
            {loading ? 'Sending...' : 'Send Money'}
          </button>
        </form>

        <button onClick={() => navigate('/wallet')} className="mt-4 text-sm text-gold-600 hover:underline">
          ← Back to Wallet
        </button>
      </div>
    </div>
  );
};
export default Transfer;