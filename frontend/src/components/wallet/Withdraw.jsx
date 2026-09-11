import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaMobileAlt, FaUniversity, FaBitcoin, FaCheckCircle,
  FaExclamationCircle, FaLock, FaArrowUp, FaInfoCircle,
} from 'react-icons/fa';
import api from '../../api/axiosConfig';

const PRESET_AMOUNTS = [10, 25, 50, 100];

const Withdraw = () => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mpesa');
  const [phone, setPhone] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [pin, setPin] = useState('');
  const [balance, setBalance] = useState(0);
  const [hasPin, setHasPin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [error, setError] = useState('');
  const [txId, setTxId] = useState(null);
  const [kesRate, setKesRate] = useState(130);

  useEffect(() => {
    let cancelled = false;

    api.get('wallet/balance/')
      .then((res) => {
        if (cancelled) return;
        setBalance(parseFloat(res.data.balance) || 0);
        setHasPin(res.data.has_pin);
      })
      .catch((err) => console.warn('Balance fetch failed:', err))
      .finally(() => { if (!cancelled) setLoading(false); });

    api.get('wallet/exchange-rate/')
      .then((res) => {
        if (!cancelled && res.data?.usd_to_kes) setKesRate(res.data.usd_to_kes);
      })
      .catch((err) => console.warn('Rate fetch failed:', err));

    return () => { cancelled = true; };
  }, []);

  const numericAmount = parseFloat(amount) || 0;
  const feeRate = method === 'mpesa' ? 0.015 : method === 'bank' ? 0.02 : 0.03;
  const fee = +(numericAmount * feeRate).toFixed(2);
  const total = +(numericAmount - fee).toFixed(2);
  const kesTotal = Math.round(total * kesRate);

  const methods = [
    { id: 'mpesa', label: 'M-Pesa', icon: FaMobileAlt, minTime: 'Instant' },
    { id: 'bank', label: 'Bank', icon: FaUniversity, minTime: '1-3 days' },
    { id: 'crypto', label: 'Crypto', icon: FaBitcoin, minTime: 'Coming soon', disabled: true },
  ];

  const normalizeMsisdn = (input) => {
    const digits = input.replace(/\D/g, '');
    if (digits.startsWith('254')) return digits;
    if (digits.startsWith('0')) return `254${digits.slice(1)}`;
    if (digits.startsWith('7') || digits.startsWith('1')) return `254${digits}`;
    return digits;
  };

  const validate = () => {
    if (!hasPin) return 'Please set a wallet PIN first.';
    if (numericAmount < 1) return 'Minimum withdrawal is $1.00';
    if (numericAmount > balance) return `Insufficient balance. Available: $${balance.toFixed(2)}`;
    if (pin.length < 4) return 'PIN must be at least 4 digits';
    if (method === 'mpesa') {
      const digits = phone.replace(/\D/g, '');
      if (!/^(?:254|0)?(7\d{8}|1\d{8})$/.test(digits)) {
        return 'Enter a valid Kenyan phone number';
      }
    }
    if (method === 'bank') {
      if (!bankAccount.trim()) return 'Bank account number is required';
      if (!bankName.trim()) return 'Bank name is required';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setError('');
    setSubmitting(true);

    try {
      const payload = { amount: numericAmount, method, pin };
      if (method === 'mpesa') payload.phone_number = normalizeMsisdn(phone);
      if (method === 'bank') {
        payload.bank_account = bankAccount;
        payload.bank_name = bankName;
      }

      const { data } = await api.post('wallet/withdraw/', payload);
      setTxId(data.transaction_id || 'pending');
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.error || 'Withdrawal failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- Success Screen ----------------
  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto mt-20 p-4">
        <div className="glass p-10 rounded-3xl shadow-2xl text-center">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
            Withdrawal Initiated
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            <span className="font-semibold text-gold-600">${total.toFixed(2)}</span> is on its way to your {method === 'mpesa' ? 'M-Pesa' : 'bank'}.
          </p>
          {method === 'mpesa' && (
            <p className="text-sm text-gold-600 dark:text-gold-400 mt-1 font-semibold">
              ≈ KES {kesTotal.toLocaleString()}
            </p>
          )}
          {method === 'bank' && (
            <p className="text-xs text-gray-500 mt-2">
              Funds usually arrive within 1-3 business days.
            </p>
          )}
          {txId && (
            <p className="text-xs text-gray-400 mt-3 font-mono break-all">Ref: {txId}</p>
          )}
          <button
            onClick={() => navigate('/wallet')}
            className="mt-6 bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700 transition font-semibold"
          >
            Back to Wallet
          </button>
        </div>
      </div>
    );
  }

  // ---------------- Loading Screen ----------------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  // ---------------- Main Form ----------------
  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <div className="glass p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">Withdraw Funds</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Available balance:{' '}
            <span className="font-semibold text-gold-600">${balance.toFixed(2)}</span>
          </p>
        </div>

        {!hasPin && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
            Set a wallet PIN first.{' '}
            <Link to="/wallet/security" className="underline font-semibold">
              Go to security →
            </Link>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 text-sm flex items-start gap-2">
            <FaExclamationCircle className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              max={balance}
              required
              placeholder="0.00"
              className="w-full p-4 rounded-xl border-2 border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-2xl font-semibold text-center"
            />
            <div className="grid grid-cols-4 gap-2 mt-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(Math.min(amt, balance)))}
                  disabled={balance < amt}
                  className={`py-2 text-xs rounded-lg border transition ${
                    amount === String(amt)
                      ? 'bg-gold-600 text-white border-gold-600'
                      : 'border-gold-200 dark:border-gold-700 text-gray-600 dark:text-gray-400 hover:border-gold-400 disabled:opacity-40'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Withdrawal Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  disabled={m.disabled}
                  onClick={() => setMethod(m.id)}
                  className={`p-3 rounded-xl border-2 transition flex flex-col items-center gap-1 ${
                    m.disabled
                      ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-800'
                      : method === m.id
                      ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/30'
                      : 'border-gold-200 dark:border-gold-700 hover:border-gold-400'
                  }`}
                >
                  <m.icon className={`text-xl ${method === m.id ? 'text-gold-600' : 'text-gray-500'}`} />
                  <span className="text-xs font-medium">{m.label}</span>
                  <span className="text-[10px] text-gray-400">{m.minTime}</span>
                </button>
              ))}
            </div>
          </div>

          {/* M-Pesa phone */}
          {method === 'mpesa' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="2547XXXXXXXX"
                className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none font-mono"
                required
              />
            </div>
          )}

          {/* Bank fields */}
          {method === 'bank' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., Equity Bank"
                  className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="0123456789"
                  className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none font-mono"
                  required
                />
              </div>
            </>
          )}

          {/* PIN */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FaLock className="text-gold-500" /> Wallet PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              placeholder="••••"
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none tracking-widest text-center text-lg"
              required
            />
          </div>

          {/* Fee breakdown */}
          {numericAmount > 0 && (
            <div className="p-4 bg-gold-50/50 dark:bg-gold-950/20 rounded-xl space-y-2 text-sm border border-gold-200/50 dark:border-gold-800/50">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Withdrawal</span>
                <span className="font-medium">${numericAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Fee ({(feeRate * 100).toFixed(1)}%)
                </span>
                <span className="font-medium">-${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gold-200 dark:border-gold-800 pt-2 mt-2">
                <span className="font-semibold text-gold-700 dark:text-gold-300">You Receive</span>
                <span className="font-bold text-gold-700 dark:text-gold-300">${total.toFixed(2)}</span>
              </div>
              {method === 'mpesa' && (
                <div className="flex justify-between bg-white/50 dark:bg-gray-900/50 -mx-4 -mb-4 px-4 py-3 mt-2 rounded-b-xl border-t border-gold-200/50">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">
                    ≈ 1 USD = {kesRate.toFixed(2)} KES
                  </span>
                  <span className="font-bold text-gold-600 dark:text-gold-400">
                    KES {kesTotal.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !hasPin || numericAmount < 1 || numericAmount > balance}
            className={`w-full py-4 rounded-xl font-semibold text-white transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
              submitting || !hasPin || numericAmount < 1 || numericAmount > balance
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gold-600 hover:bg-gold-700'
            }`}
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : method === 'mpesa' ? (
              <>
                <FaArrowUp size={14} /> Withdraw KES {kesTotal.toLocaleString()}
              </>
            ) : (
              <>
                <FaArrowUp size={14} /> Withdraw ${numericAmount > 0 ? total.toFixed(2) : '0.00'}
              </>
            )}
          </button>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <FaInfoCircle /> Withdrawals are processed within the stated timeframe.
          </div>
        </form>

        <button
          onClick={() => navigate('/wallet')}
          className="mt-4 text-sm text-gold-600 hover:underline w-full text-center"
        >
          ← Back to Wallet
        </button>
      </div>
    </div>
  );
};

export default Withdraw;