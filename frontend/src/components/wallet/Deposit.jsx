import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  FaCreditCard, FaMobileAlt, FaBitcoin, FaCheckCircle,
  FaExclamationCircle, FaShieldAlt, FaLock, FaTimesCircle,
} from 'react-icons/fa';
import api from '../../api/axiosConfig';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  hidePostalCode: true,
  disableLink: true,
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': { color: '#a0a0a0' },
      iconColor: '#d4a11e',
    },
    invalid: { color: '#e5424d', iconColor: '#e5424d' },
  },
};

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

const MAX_POLL_ATTEMPTS = 20;   // 20 × 3s = 60 seconds
const POLL_INTERVAL_MS = 3000;
const POLL_DURATION_SECONDS = 60;

const Deposit = () => (
  <Elements stripe={stripePromise}>
    <DepositInner />
  </Elements>
);

const DepositInner = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('stripe');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form');
  const [error, setError] = useState('');
  const [txId, setTxId] = useState(null);
  const [kesRate, setKesRate] = useState(130);
  // FIX 1: Removed pollCount state entirely.
  const [secondsLeft, setSecondsLeft] = useState(POLL_DURATION_SECONDS);

  const pollRef = useRef(null);
  const tickRef = useRef(null);
  const initialBalanceRef = useRef(0);

  // Fetch exchange rate once
  useEffect(() => {
    api.get('wallet/exchange-rate/')
      .then((res) => {
        if (res.data?.usd_to_kes) setKesRate(res.data.usd_to_kes);
      })
      .catch(() => {});
  }, []);

  // Snapshot the balance when we enter the pending state
  useEffect(() => {
    if (step !== 'pending') return;

    api.get('wallet/balance/')
      .then((res) => {
        initialBalanceRef.current = parseFloat(res.data.balance) || 0;
      })
      .catch(() => {});
  }, [step]);

  // Polling loop. Only starts the intervals; no synchronous setState here.
  useEffect(() => {
    if (step !== 'pending') {
      if (pollRef.current) clearInterval(pollRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
      pollRef.current = null;
      tickRef.current = null;
      return;
    }

    // Countdown ticker
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);

    let attempts = 0;

    pollRef.current = setInterval(async () => {
      attempts += 1;

      try {
        const balRes = await api.get('wallet/balance/');
        const newBalance = parseFloat(balRes.data.balance) || 0;

        if (newBalance > initialBalanceRef.current) {
          clearInterval(pollRef.current);
          clearInterval(tickRef.current);
          pollRef.current = null;
          tickRef.current = null;
          setStep('success');
          return;
        }

        const txRes = await api.get('wallet/transactions/');
        const txList = Array.isArray(txRes.data) ? txRes.data : [];
        const currentTx = txList.find(
          (t) => t.reference === txId || String(t.id) === String(txId)
        );

        if (currentTx && currentTx.status === 'failed') {
          clearInterval(pollRef.current);
          clearInterval(tickRef.current);
          pollRef.current = null;
          tickRef.current = null;
          setError(
            currentTx.description ||
            'Payment was cancelled or declined. Please try again.'
          );
          setStep('failed');
          return;
        }
      } catch {
        // network hiccup — the next tick will retry
      }

      if (attempts >= MAX_POLL_ATTEMPTS) {
        clearInterval(pollRef.current);
        clearInterval(tickRef.current);
        pollRef.current = null;
        tickRef.current = null;
        setError(
          'Timed out after 60 seconds. Check your phone for an M-Pesa message, then refresh the wallet page.'
        );
        setStep('failed');
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
      pollRef.current = null;
      tickRef.current = null;
    };
  }, [step, txId]);

  const numericAmount = parseFloat(amount) || 0;
  const feeRate = method === 'stripe' ? 0.025 : method === 'mpesa' ? 0.015 : 0;
  const fee = +(numericAmount * feeRate).toFixed(2);
  const total = +(numericAmount + fee).toFixed(2);
  const kesTotal = Math.round(total * kesRate);

  const methods = [
    { id: 'stripe', label: 'Card', icon: FaCreditCard },
    { id: 'mpesa', label: 'M-Pesa', icon: FaMobileAlt },
    { id: 'crypto', label: 'Crypto', icon: FaBitcoin, disabled: true },
  ];

  const validate = () => {
    if (numericAmount < 1) return 'Minimum deposit is $1.00';
    if (numericAmount > 10000) return 'Maximum single deposit is $10,000';
    if (method === 'mpesa') {
      const digits = phone.replace(/\D/g, '');
      if (!/^(?:254|0)?(7\d{8}|1\d{8})$/.test(digits)) {
        return 'Enter a valid Kenyan phone number (e.g., 254712345678)';
      }
    }
    return '';
  };

  const normalizeMsisdn = (input) => {
    const digits = input.replace(/\D/g, '');
    if (digits.startsWith('254')) return digits;
    if (digits.startsWith('0')) return `254${digits.slice(1)}`;
    if (digits.startsWith('7') || digits.startsWith('1')) return `254${digits}`;
    return digits;
  };

  // FIX 2: Reset countdown and step together in the action handler,
  // not inside the effect. This satisfies the react-hooks rule.
  const enterPendingState = (referenceId) => {
    setTxId(referenceId);
    setSecondsLeft(POLL_DURATION_SECONDS);
    setStep('pending');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setError('');
    setLoading(true);

    try {
      if (method === 'stripe') {
        await handleStripeDeposit();
      } else if (method === 'mpesa') {
        await handleMpesaDeposit();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeDeposit = async () => {
    if (!stripe || !elements) throw new Error('Stripe not loaded yet.');

    const { data } = await api.post('wallet/stripe/create-intent/', { amount: total });
    const cardElement = elements.getElement(CardElement);

    const result = await stripe.confirmCardPayment(data.client_secret, {
      payment_method: { card: cardElement },
    });

    if (result.error) throw new Error(result.error.message);

    if (result.paymentIntent.status === 'succeeded') {
      enterPendingState(result.paymentIntent.id);
    }
  };

  const handleMpesaDeposit = async () => {
    const msisdn = normalizeMsisdn(phone);
    const { data } = await api.post('wallet/mpesa/stk-push/', {
      amount: numericAmount,
      phone_number: msisdn,
    });

    if (data.error) throw new Error(data.error);

    enterPendingState(data.checkout_request_id || 'pending');
  };

  // ------------------ SUCCESS ------------------
  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto mt-20 p-4">
        <div className="glass p-10 rounded-3xl shadow-2xl text-center">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
            Deposit Successful
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            <span className="font-semibold text-gold-600">${numericAmount.toFixed(2)}</span> has been added to your wallet.
          </p>
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

  // ------------------ FAILED ------------------
  if (step === 'failed') {
    return (
      <div className="max-w-md mx-auto mt-20 p-4">
        <div className="glass p-10 rounded-3xl shadow-2xl text-center">
          <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Deposit Not Confirmed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{error}</p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => {
                setStep('form');
                setError('');
                setSecondsLeft(POLL_DURATION_SECONDS);
              }}
              className="bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700 transition font-semibold"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/wallet')}
              className="border border-gold-600 text-gold-600 px-6 py-3 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/30 transition"
            >
              Back to Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------ PENDING ------------------
  if (step === 'pending') {
    const progressPercent = ((POLL_DURATION_SECONDS - secondsLeft) / POLL_DURATION_SECONDS) * 100;
    return (
      <div className="max-w-md mx-auto mt-20 p-4">
        <div className="glass p-10 rounded-3xl shadow-2xl text-center">
          <div className="w-16 h-16 border-4 border-gold-300 border-t-gold-600 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
            Waiting for Confirmation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {method === 'mpesa'
              ? 'Check your phone for the M-Pesa prompt and enter your PIN.'
              : 'Confirming your card payment...'}
          </p>

          <div className="mt-6 w-full bg-gold-100 dark:bg-gold-900/30 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gold-600 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-gold-600 dark:text-gold-400 mt-2 font-semibold">
            {secondsLeft}s remaining
          </p>

          <button
            onClick={() => navigate('/wallet')}
            className="mt-6 text-sm text-gold-600 hover:underline"
          >
            I'll check the wallet later
          </button>
        </div>
      </div>
    );
  }

  // ------------------ FORM ------------------
  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <div className="glass p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
            Deposit Funds
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Top up your wallet to pay for gigs and projects.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 text-sm flex items-start gap-2">
            <FaExclamationCircle className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
              required
              placeholder="0.00"
              className="w-full p-4 rounded-xl border-2 border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-2xl font-semibold text-center"
            />
            <div className="grid grid-cols-5 gap-2 mt-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  className={`py-2 text-xs rounded-lg border transition ${
                    amount === String(amt)
                      ? 'bg-gold-600 text-white border-gold-600'
                      : 'border-gold-200 dark:border-gold-700 text-gray-600 dark:text-gray-400 hover:border-gold-400'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
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
                </button>
              ))}
            </div>
          </div>

          {method === 'stripe' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Details
              </label>
              <div className="p-4 rounded-xl border-2 border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                <FaLock size={10} /> Secured by Stripe.
              </p>
            </div>
          )}

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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                You'll receive an STK push. Enter your M-Pesa PIN to confirm.
              </p>
            </div>
          )}

          {numericAmount > 0 && (
            <div className="p-4 bg-gold-50/50 dark:bg-gold-950/20 rounded-xl space-y-2 text-sm border border-gold-200/50 dark:border-gold-800/50">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Deposit</span>
                <span className="font-medium">${numericAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Fee ({(feeRate * 100).toFixed(1)}%)
                </span>
                <span className="font-medium">${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gold-200 dark:border-gold-800 pt-2 mt-2">
                <span className="font-semibold text-gold-700 dark:text-gold-300">Total Charged</span>
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

          <button
            type="submit"
            disabled={loading || numericAmount < 1}
            className={`w-full py-4 rounded-xl font-semibold text-white transition shadow-lg hover:shadow-xl ${
              loading || numericAmount < 1
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gold-600 hover:bg-gold-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : method === 'mpesa' ? (
              `Pay KES ${kesTotal.toLocaleString()}`
            ) : (
              `Deposit $${numericAmount > 0 ? total.toFixed(2) : '0.00'}`
            )}
          </button>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <FaShieldAlt /> 256-bit encrypted · PCI DSS compliant
          </div>
        </form>

        <button
          onClick={() => navigate('/wallet')}
          className="mt-4 text-sm text-gold-600 hover:underline w-full text-center"
        >
          Back to Wallet
        </button>
      </div>
    </div>
  );
};

export default Deposit;