import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaCheck, FaCrown } from 'react-icons/fa';

const Pricing = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const user = useSelector((s) => s.auth.user);
  const isPro = user?.is_pro || user?.plan === 'pro';

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for getting started and testing the waters.',
      features: [
        'Basic profile and portfolio',
        'Browse all gigs and projects',
        'Apply to 5 projects per month',
        'Standard email support',
        '5% platform fee on your earnings',
      ],
      recommended: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      desc: 'For serious freelancers who want to win more work.',
      features: [
        'Everything in Free, plus:',
        'PRO badge on your profile and gigs',
        'Unlimited project proposals',
        'Promoted gigs (appear first in search)',
        'Reduced platform fee — only 3% (save on every job)',
        'Advanced earnings analytics',
        'Priority 24/7 support',
        'Cancel anytime, 30-day money-back guarantee',
      ],
      recommended: true,
    },
  ];

  const handleChoose = (planId) => {
    if (planId === 'free') {
      if (!isAuthenticated) {
        navigate('/register');
      } else {
        navigate('/dashboard');
      }
      return;
    }

    if (!isAuthenticated) {
      navigate(`/register?plan=${planId}`);
      return;
    }

    if (isPro) {
      navigate('/dashboard');
      return;
    }

    navigate(`/pricing/${planId}/checkout`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gold-700 dark:text-gold-300 mb-4">
          Pricing
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Transparent, fair pricing. Upgrade to Pro and the platform fee pays for itself
          on your very first project.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan =
            isAuthenticated &&
            ((plan.id === 'free' && !isPro) || (plan.id === 'pro' && isPro));

          return (
            <div
              key={plan.id}
              className={`glass p-6 rounded-2xl shadow-lg relative flex flex-col ${
                plan.recommended ? 'border-2 border-gold-500' : ''
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-white px-4 py-0.5 rounded-full text-sm font-semibold flex items-center gap-1">
                  <FaCrown size={12} /> Most Popular
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

              <ul className="mt-6 space-y-3 flex-1">
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
                disabled={isCurrentPlan}
                className={`mt-6 w-full py-3 rounded-full font-semibold transition ${
                  isCurrentPlan
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : plan.recommended
                    ? 'bg-gold-600 text-white hover:bg-gold-700'
                    : 'border border-gold-600 text-gold-600 hover:bg-gold-50 dark:hover:bg-gold-900/30'
                }`}
              >
                {isCurrentPlan
                  ? 'Current Plan'
                  : plan.id === 'pro' && isPro
                  ? 'Current Plan'
                  : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        Questions? Contact us at{' '}
        <a href="mailto:support@skillbridge.com" className="text-gold-600 hover:underline">
          support@skillbridge.com
        </a>
      </div>
    </div>
  );
};

export default Pricing;