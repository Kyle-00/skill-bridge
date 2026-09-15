import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaCheck } from 'react-icons/fa';

const Pricing = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '',
      desc: 'For freelancers just starting out.',
      features: [
        'Basic profile',
        'Browse gigs and projects',
        'Apply to projects',
        '5% platform fee',
      ],
      recommended: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      desc: 'For serious freelancers and active clients.',
      features: [
        'Everything in Free',
        'Promoted gigs',
        'Priority support',
        'Lower fee (3%)',
        'Advanced analytics',
      ],
      recommended: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      desc: 'For teams and large organisations.',
      features: [
        'All Pro features',
        'Dedicated account manager',
        'Custom contracts',
        'Onboarding and training',
      ],
      recommended: false,
    },
  ];

  const handleChoose = (planId) => {
    if (!isAuthenticated) {
      navigate(`/register?plan=${planId}`);
      return;
    }

    if (planId === 'free') {
      navigate('/dashboard');
      return;
    }

    if (planId === 'enterprise') {
      window.open(
        'mailto:sales@skillbridge.com?subject=Enterprise%20Plan%20Inquiry',
        '_blank'
      );
      return;
    }

    navigate(`/pricing/${planId}/checkout`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gold-700 dark:text-gold-300 text-center mb-4">
        Pricing
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
        Transparent, fair pricing. No hidden fees.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`glass p-6 rounded-2xl shadow-lg relative flex flex-col ${
              plan.recommended ? 'border-2 border-gold-500' : ''
            }`}
          >
            {plan.recommended && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-white px-4 py-0.5 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            )}

            <h3 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
              {plan.name}
            </h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gold-600 dark:text-gold-400">
                {plan.price}
              </span>
              {plan.period && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {plan.period}
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              {plan.desc}
            </p>

            <ul className="mt-6 space-y-2 flex-1">
              {plan.features.map((feat) => (
                <li
                  key={feat}
                  className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <FaCheck className="text-green-500 shrink-0 mt-1" size={12} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleChoose(plan.id)}
              className={`mt-6 w-full py-3 rounded-full font-semibold transition ${
                plan.recommended
                  ? 'bg-gold-600 text-white hover:bg-gold-700'
                  : 'border border-gold-600 text-gold-600 hover:bg-gold-50 dark:hover:bg-gold-900/30'
              }`}
            >
              Choose {plan.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;