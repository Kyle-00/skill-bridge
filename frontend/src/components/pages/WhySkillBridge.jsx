import { FaRocket, FaHandshake, FaShieldAlt, FaGlobe } from 'react-icons/fa';

const WhySkillBridge = () => {
  const values = [
    { icon: FaRocket, title: 'Innovation First', desc: 'We use AI to match talent with opportunities, reducing bias and saving time.' },
    { icon: FaHandshake, title: 'Fairness', desc: 'Transparent fees (5-10% freelancer, 0% client) and a clear dispute process.' },
    { icon: FaShieldAlt, title: 'Trust & Safety', desc: 'Escrow protection, identity verification, and fraud detection.' },
    { icon: FaGlobe, title: 'Global Inclusion', desc: 'M-Pesa, Stripe, crypto - we serve freelancers everywhere, especially in emerging markets.' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gold-700 dark:text-gold-300 text-center mb-4">Why SkillBridge?</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
        We're building the future of freelancing - fair, smart, and accessible to everyone.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {values.map((item, i) => (
          <div key={i} className="glass p-6 rounded-2xl shadow-lg flex gap-4 items-start">
            <div className="text-4xl text-gold-500 shrink-0"><item.icon /></div>
            <div>
              <h3 className="text-xl font-semibold text-gold-800 dark:text-gold-200">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 glass p-8 rounded-3xl shadow-xl text-center">
        <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">Our Mission</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mt-4">
          To bridge the gap between talent and opportunity, creating a world where anyone can work from anywhere, get paid fairly, and build a sustainable career.
        </p>
      </div>
    </div>
  );
};
export default WhySkillBridge;