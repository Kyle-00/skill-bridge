import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaArrowUp, FaArrowDown, FaExchangeAlt, FaClock, FaLock, FaCopy, FaCheck } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [walletId, setWalletId] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const balanceRes = await api.get('wallet/balance/');
        setBalance(parseFloat(balanceRes.data.balance) || 0);
        setWalletId(balanceRes.data.wallet_id || 'N/A');
        setHasPin(balanceRes.data.has_pin || false);

        const txRes = await api.get('wallet/transactions/');
        const raw = Array.isArray(txRes.data) ? txRes.data : [];
        setTransactions(raw.map(t => ({
          ...t,
          amount: parseFloat(t.amount) || 0,
        })));
      } catch {
        setBalance(0);
        setWalletId('N/A');
      } finally {
        setLoading(false);
      }
    };
    fetchWalletData();
  }, []);

  const copyWalletId = () => {
    navigator.clipboard.writeText(walletId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    const classes = {
      success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };
    return classes[status] || classes.pending;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try { return new Date(dateStr).toLocaleString(); } catch { return 'N/A'; }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gold-700 dark:text-gold-300 mb-6">My Wallet</h1>

      {/* Balance Card */}
      <div className="glass p-6 rounded-3xl shadow-xl mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Available Balance</p>
        <p className="text-4xl sm:text-5xl font-bold text-gold-600 dark:text-gold-400 mt-1">
          ${balance.toFixed(2)}
        </p>

        {/* Wallet ID with copy */}
        <div className="mt-4 flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 border border-gold-200 dark:border-gold-700 rounded-lg px-3 py-2 max-w-xs">
          <span className="text-xs text-gray-500 dark:text-gray-400">Wallet ID</span>
          <span className="font-mono font-semibold text-gold-700 dark:text-gold-300 text-sm flex-1 truncate">
            {walletId}
          </span>
          <button
            onClick={copyWalletId}
            className="text-gold-600 hover:text-gold-800 transition"
            aria-label="Copy Wallet ID"
          >
            {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Share this ID to receive money from other users.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-6">
          <Link to="/wallet/deposit" className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition flex items-center gap-2 text-sm">
            <FaPlus size={12} /> Deposit
          </Link>
          <Link to="/wallet/withdraw" className="border border-gold-600 text-gold-600 px-4 py-2 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/30 transition flex items-center gap-2 text-sm">
            <FaArrowUp size={12} /> Withdraw
          </Link>
          <Link to="/wallet/transfer" className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition flex items-center gap-2 text-sm">
            <FaExchangeAlt size={12} /> Send
          </Link>
          <Link to="/wallet/security" className="border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition flex items-center gap-2 text-sm">
            <FaLock size={12} /> {hasPin ? 'Change PIN' : 'Set PIN'}
          </Link>
        </div>

        {!hasPin && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
            ⚠ You need to set a wallet PIN before you can withdraw or send money.
            <Link to="/wallet/security" className="ml-1 underline font-semibold">Set PIN now</Link>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <h2 className="text-lg sm:text-xl font-semibold text-gold-700 dark:text-gold-300 mb-4">Recent Transactions</h2>
      <div className="glass p-4 rounded-2xl shadow-lg">
        {transactions.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-gold-100 dark:divide-gold-800/30">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-full shrink-0 ${tx.amount > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {tx.amount > 0 ? <FaArrowUp className="text-green-600" /> : <FaArrowDown className="text-red-600" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">{tx.description || tx.transaction_type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <FaClock size={10} /> {formatDate(tx.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-semibold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(tx.status)}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;