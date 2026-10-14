import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements, CardElement, useStripe, useElements,
} from '@stripe/react-stripe-js';
import {
  FaTimes, FaCreditCard, FaMobileAlt, FaLock, FaExclamationCircle,
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

const FundEscrowModal = ({ order, onClose, onSuccess }) => (
  <Elements stripe={stripePromise}>
    <Inner order={order} onClose={onClose} onSuccess={onSuccess} />
  </Elements>
);

const Inner = ({ order, onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [method, setMethod] = useState('stripe');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [rate, setRate] = useState(130);

  const amount = parseFloat(order.total_amount);

  useEffect(() => {
    api.get('wallet/exchange-rate/')
      .then((res) => setRate(res.data.usd_to_kes || 130))
      .catch(() => {});
  }, []);

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
        if (!stripe || !elements) throw new Error('Stripe is still loading.');

        const res = await api.post(`orders/${order.id}/fund-escrow/`, {
          payment_method: 'stripe',
        });
        const card = elements.getElement(CardElement);
        const result = await stripe.confirmCardPayment(res.data.client_secret, {
          payment_method: { card },
        });

        if (result.error) throw new Error(result.error.message);
        if (result.paymentIntent.status === 'succeeded') {
          await api.post(`orders/${order.id}/mark-funded/`);
          onSuccess?.('Payment received. Escrow funded.');
        }
      } else {
        const msisdn = normalizeMsisdn(phone);
        if (msisdn.length !== 12) {
          throw new Error('Enter a valid Kenyan phone number (2547XXXXXXXX).');
        }
        const res = await api.post(`orders/${order.id}/fund-escrow/`, {
          payment_method: 'mpesa',
          phone: msisdn,
        });
        if (res.data.error) throw new Error(res.data.error);
        setPending(true);
      }
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.error || data?.detail || err.message || 'Payment failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (pending) {
    return (
      <ModalShell onClose={onClose}>
        <div className="text-center py-6">
          <div className="w-16 h-16 border-4 border-gold-300 border-t-gold-600 rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gold-700 dark:text-gold-300">
            Waiting for M-Pesa
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Enter your M-Pesa PIN on the prompt sent to your phone. Escrow
            will be marked funded automatically once payment is confirmed.
          </p>
          <button
            onClick={onClose}
            className="mt-6 bg-gold-600 text-white px-6 py-2 rounded-lg hover:bg-gold-700"
          >
            Close
          </button>
        </div>
      </ModalShell>
    );
  }

  const kesAmount = Math.round(amount * rate);

  return (
    <ModalShell onClose={onClose}>
      <h3 className="text-xl font-bold text-gold-700 dark:text-gold-300 mb-1">
        Fund Escrow
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Order #{order.id} — <strong>${amount.toFixed(2)}</strong>
      </p>

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
              You will be charged approximately KES {kesAmount.toLocaleString()} (${amount.toFixed(2)}).
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold transition ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gold-600 hover:bg-gold-700'
          }`}
        >
          {loading ? 'Processing...' : `Fund $${amount.toFixed(2)}`}
        </button>
      </form>
    </ModalShell>
  );
};

const ModalShell = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        aria-label="Close"
      >
        <FaTimes size={16} />
      </button>
      {children}
    </div>
  </div>
);

export default FundEscrowModal;