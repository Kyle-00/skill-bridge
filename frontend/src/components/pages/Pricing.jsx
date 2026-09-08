import { FaCheck } from 'react-icons/fa';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      desc: 'For freelancers just starting out.',
      features: ['Basic profile', 'Browse gigs', 'Apply to projects', '5% platform fee'],
      recommended: false,
    },
    {
      name: 'Pro',
      price: '$9.99/mo',
      desc: 'For serious freelancers and active clients.',
      features: ['Everything in Free', 'Promoted gigs', 'Priority support', 'Lower fee (3%)', 'Advanced analytics'],
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      desc: 'For teams and large organisations.',
      features: ['All Pro features', 'Dedicated account manager', 'Custom contracts', 'Onboarding & training'],
      recommended: false,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gold-700 dark:text-gold-300 text-center mb-4">Pricing</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
        Transparent, fair pricing – no hidden fees.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`glass p-6 rounded-2xl shadow-lg relative ${
              plan.recommended ? 'border-2 border-gold-500' : ''
            }`}
          >
            {plan.recommended && (
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gold-500 text-white px-4 py-0.5 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            )}
            <h3 className="text-2xl font-bold text-gold-700 dark:text-gold-300">{plan.name}</h3>
            <div className="text-4xl font-bold text-gold-600 dark:text-gold-400 mt-2">{plan.price}</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{plan.desc}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feat, j) => (
                <li key={j} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <FaCheck className="text-green-500 shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
            <button className={`mt-6 w-full py-2 rounded-full transition ${
              plan.recommended
                ? 'bg-gold-600 text-white hover:bg-gold-700'
                : 'border border-gold-600 text-gold-600 hover:bg-gold-50 dark:hover:bg-gold-900/30'
            }`}>
              Choose {plan.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Pricing;