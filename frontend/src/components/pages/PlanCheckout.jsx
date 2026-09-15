import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  FaCreditCard, FaMobileAlt, FaCheckCircle, FaExclamationCircle,
  FaArrowLeft, FaShieldAlt, FaLock,
} from 'react-icons/fa';
import api from '../../api/axiosConfig';

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
  pro: { name: 'Pro', amount: 9.99 },
};

const PlanCheckout = () => (
  <Elements stripe={stripePromise}>
    <PlanCheckoutInner />
  </Elements>
);

const PlanCheckoutInner = () => {
  const { plan } = useParams();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const planData = PLAN_PRICES[plan];

  const [method, setMethod] = useState('stripe');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form');
  const [error, setError] = useState('');
  const [kesRate] = useState(130);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (method === 'stripe') {
        if (!stripe || !elements) throw new Error('Stripe not ready');

        const intentRes = await api.post('wallet/stripe/create-intent/', {
          amount: planData.amount,
        });
        const card = elements.getElement(CardElement);
        const result = await stripe.confirmCardPayment(
          intentRes.data.client_secret,
          { payment_method: { card } }
        );

        if (result.error) throw new Error(result.error.message);
        if (result.paymentIntent.status === 'succeeded') {
          setStep('success');
        }
      } else if (method === 'mpesa') {
        const msisdn = normalizeMsisdn(phone);
        const res = await api.post('wallet/mpesa/stk-push/', {
          amount: planData.amount,
          phone_number: msisdn,
        });
        if (res.data.error) throw new Error(res.data.error);
        setStep('pending');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto mt-20 p-4">
        <div className="glass p-10 rounded-3xl shadow-2xl text-center">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
            Welcome to {planData.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your plan is active. Enjoy lower fees and priority support.
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
            Enter your PIN on the phone prompt to activate {planData.name}.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 text-sm text-gold-600 hover:underline"
          >
            I'll check later
          </button>
        </div>
      </div>
    );
  }

  const kesAmount = Math.round(planData.amount * kesRate);

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
          <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
            Upgrade to {planData.name}
          </h2>
          <p className="text-3xl font-bold text-gold-600 mt-2">
            ${planData.amount.toFixed(2)}
            <span className="text-sm text-gray-500 ml-1">/ month</span>
          </p>
        </div>

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
                required
                className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 outline-none focus:ring-2 focus:ring-gold-400 font-mono"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                You will be charged approximately KES {kesAmount.toLocaleString()}.
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
            {loading ? 'Processing...' : `Pay $${planData.amount.toFixed(2)}`}
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