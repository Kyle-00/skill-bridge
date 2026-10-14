import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  FaCreditCard, FaMobileAlt, FaCheckCircle, FaExclamationCircle,
  FaArrowLeft, FaShieldAlt, FaLock, FaCrown,
} from 'react-icons/fa';
import api from '../../api/axiosConfig';
import { setCredentials } from '../../store/authSlice';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_OPTIONS = {
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
    invalid: { color: '#e5424d' },
  },
};

const PLAN_PRICES = {
  pro: { name: 'Pro', amount: 9.99, features: ['Unlimited proposals', '3% platform fee', 'PRO badge', 'Priority support'] },
};

const PlanCheckout = () => (
  <Elements stripe={stripePromise}>
    <PlanCheckoutInner />
  </Elements>
);

const PlanCheckoutInner = () => {
  const { plan } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();
  const auth = useSelector((s) => s.auth);

  const planData = PLAN_PRICES[plan];

  const [method, setMethod] = useState('stripe');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form');
  const [error, setError] = useState('');
  const [exchangeRate, setExchangeRate] = useState(130);

  useEffect(() => {
    api.get('wallet/exchange-rate/')
      .then((res) => setExchangeRate(res.data.usd_to_kes || 130))
      .catch(() => {});
  }, []);

  if (!planData) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p className="text-red-600 mb-4">Unknown plan.</p>
        <Link to="/pricing" className="bg-gold-600 text-white px-6 py-2 rounded-lg">
          Back to Pricing
        </Link>
      </div>
    );
  }

  const normalizeMsisdn = (input) => {
    const digits = input.replace(/\D/g, '');
    if (digits.startsWith('254')) return digits;
    if (digits.startsWith('0')) return `254${digits.slice(1)}`;
    if (digits.startsWith('7') || digits.startsWith('1')) return `254${digits}`;
    return digits;
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('accounts/profile/');
      dispatch(setCredentials({
        user: res.data,
        token: auth.token,
        refresh: auth.refresh,
      }));
    } catch (e) {
      console.warn('Failed to refresh user:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (method === 'stripe') {
        if (!stripe || !elements) throw new Error('Stripe is still loading.');

        const intentRes = await api.post('accounts/subscribe/', { method: 'stripe' });
        const card = elements.getElement(CardElement);
        const result = await stripe.confirmCardPayment(
          intentRes.data.client_secret,
          { payment_method: { card } }
        );

        if (result.error) throw new Error(result.error.message);
        if (result.paymentIntent.status === 'succeeded') {
          await refreshUser();
          setStep('success');
        }
      } else if (method === 'mpesa') {
        const msisdn = normalizeMsisdn(phone);
        if (msisdn.length !== 12) {
          throw new Error('Please enter a valid Kenyan phone number (2547XXXXXXXX).');
        }
        const res = await api.post('accounts/subscribe/', {
          method: 'mpesa',
          phone_number: msisdn,
        });
        if (res.data.error) throw new Error(res.data.error);
        setStep('pending');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        'Payment failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto mt-20 p-4">
        <div className="glass p-10 rounded-3xl shadow-2xl text-center">
          <div className="w-20 h-20 bg-gold-100 dark:bg-gold-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCrown className="text-4xl text-gold-600" />
          </div>
          <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
            Welcome to Pro
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your Pro plan is now active. Enjoy a 3% platform fee, unlimited proposals, and priority support.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700 font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (step === 'pending') {
    return (
      <div className="max-w-md mx-auto mt-20 p-4">
        <div className="glass p-10 rounded-3xl shadow-2xl text-center">
          <div className="w-16 h-16 border-4 border-gold-300 border-t-gold-600 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
            Waiting for M-Pesa
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter your M-Pesa PIN on the prompt sent to your phone. Your Pro plan will activate automatically once payment is confirmed.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700 font-semibold"
          >
            Check Dashboard
          </button>
        </div>
      </div>
    );
  }

  const kesAmount = Math.round(planData.amount * exchangeRate);

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <button
        onClick={() => navigate('/pricing')}
        className="flex items-center gap-2 text-sm text-gold-600 hover:underline mb-4"
      >
        <FaArrowLeft /> Back to Plans
      </button>

      <div className="glass p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaCrown className="text-gold-600" />
            <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
              Upgrade to {planData.name}
            </h2>
          </div>
          <p className="text-3xl font-bold text-gold-600 mt-2">
            ${planData.amount.toFixed(2)}
            <span className="text-sm text-gray-500 ml-1">/ month</span>
          </p>
          {method === 'mpesa' && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ≈ KES {kesAmount.toLocaleString()} @ {exchangeRate.toFixed(2)}
            </p>
          )}
        </div>

        <ul className="mb-6 space-y-1">
          {planData.features.map((f) => (
            <li key={f} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <FaCheckCircle className="text-green-500 shrink-0" size={10} /> {f}
            </li>
          ))}
        </ul>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-start gap-2">
            <FaExclamationCircle className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'stripe', label: 'Card', icon: FaCreditCard },
                { id: 'mpesa', label: 'M-Pesa', icon: FaMobileAlt },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`p-3 rounded-xl border-2 transition flex flex-col items-center gap-1 ${
                    method === m.id
                      ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/30'
                      : 'border-gold-200 dark:border-gold-700 hover:border-gold-400'
                  }`}
                >
                  <m.icon
                    className={`text-xl ${
                      method === m.id ? 'text-gold-600' : 'text-gray-500'
                    }`}
                  />
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
                <CardElement options={CARD_OPTIONS} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                <FaLock size={10} /> Secured by Stripe. We never see your card details.
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
                required
                className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 outline-none focus:ring-2 focus:ring-gold-400 font-mono"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                You will receive an STK push for KES {kesAmount.toLocaleString()}. Enter your M-Pesa PIN to confirm.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold text-white transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gold-600 hover:bg-gold-700'
            }`}
          >
            {loading ? 'Processing...' : method === 'mpesa' ? `Pay KES ${kesAmount.toLocaleString()}` : `Pay $${planData.amount.toFixed(2)}`}
          </button>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <FaShieldAlt /> Cancel anytime. 30-day money-back guarantee.
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanCheckout;