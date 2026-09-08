import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCheckCircle,
  FaShieldAlt,
  FaGlobe,
  FaRocket,
  FaRegLightbulb,
  FaHandshake,
  FaStar,
} from 'react-icons/fa';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const Landing = () => {
  return (
    <div className="bg-linear-to-br from-white via-gold-50/30 to-white dark:from-gray-900 dark:via-gold-950/20 dark:to-gray-900 min-h-screen overflow-hidden">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-7xl mx-auto px-4 pt-28 pb-16 text-center relative"
      >
        {/* Decorative blob */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-300/20 dark:bg-gold-500/10 rounded-full blur-3xl -z-10" />

        <motion.h1
          variants={fadeInUp}
          className="text-5xl md:text-7xl font-bold leading-tight text-gold-800 dark:text-gold-300"
        >
          Bridge Your Talent to <br />
          <span className="text-gold-600 dark:text-gold-400">Global Opportunities</span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          SkillBridge connects freelancers and clients with lower fees, AI matching, and seamless payments – including M‑Pesa.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="mt-10 flex flex-wrap gap-4 justify-center"
        >
          <Link
            to="/register"
            className="px-8 py-3 bg-gold-600 text-white rounded-full hover:bg-gold-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Get Started – It's Free
          </Link>
          <Link
            to="/find-work"
            className="px-8 py-3 border-2 border-gold-600 text-gold-600 rounded-full hover:bg-gold-50 dark:hover:bg-gold-900/30 transition-all duration-300 transform hover:-translate-y-1"
          >
            Explore Opportunities
          </Link>
        </motion.div>

        {/* Trusted by */}
        <motion.div
          variants={fadeInUp}
          className="mt-20 flex flex-col items-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trusted by freelancers & clients worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 mt-4 opacity-70 grayscale">
            {['Company A', 'Company B', 'Company C', 'Company D', 'Company E'].map((name, i) => (
              <span key={i} className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
        className="max-w-7xl mx-auto px-4 py-20"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gold-700 dark:text-gold-300 mb-16">
          Why SkillBridge?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: FaCheckCircle, title: 'Lowest Fees', desc: '5-10% freelancer fee, 0% client fee – unmatched in the industry.' },
            { icon: FaShieldAlt, title: 'Secure Escrow', desc: 'Funds held safely until work is approved, with fair dispute resolution.' },
            { icon: FaGlobe, title: 'Global Payments', desc: 'M-Pesa, Stripe, Crypto, and bank transfers – pay and get paid your way.' },
            { icon: FaRocket, title: 'AI Matchmaking', desc: 'Smart, bias-aware algorithms that connect you with the right opportunities.' },
            { icon: FaRegLightbulb, title: 'Smart Tools', desc: 'Automated invoicing, real‑time chat, and analytics to grow your business.' },
            { icon: FaHandshake, title: 'Fair Reviews', desc: 'Multi‑dimensional ratings that build trust and reward quality.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="glass p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-4xl text-gold-500 mb-4">{<feature.icon />}</div>
              <h3 className="text-xl font-semibold text-gold-800 dark:text-gold-200">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-7xl mx-auto px-4 py-20 bg-gold-50/30 dark:bg-gold-950/10 rounded-3xl my-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gold-700 dark:text-gold-300 mb-16">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Create Your Profile', desc: 'Set up your freelancer or client profile with skills, portfolio, and rates.' },
            { step: '2', title: 'Find Work or Hire', desc: 'Browse gigs, post projects, or get AI‑matched with the best talent.' },
            { step: '3', title: 'Get Paid Securely', desc: 'Milestone‑based escrow with M‑Pesa, Stripe, or bank transfer – fast and safe.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gold-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-gold-800 dark:text-gold-200">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-xs mx-auto">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Freelancers', value: '10,000+' },
            { label: 'Clients', value: '5,000+' },
            { label: 'Projects Delivered', value: '50,000+' },
            { label: 'Countries', value: '190+' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass p-6 rounded-2xl shadow-lg"
            >
              <div className="text-4xl font-bold text-gold-600 dark:text-gold-400">{stat.value}</div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-7xl mx-auto px-4 py-20"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gold-700 dark:text-gold-300 mb-16">
          What Our Users Say
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Alice K.', role: 'Freelance Designer', quote: 'SkillBridge helped me find high‑paying clients. The M‑Pesa integration is a game‑changer!' },
            { name: 'James M.', role: 'Startup Founder', quote: 'I found top‑tier developers quickly. The escrow system gave me peace of mind.' },
            { name: 'Grace N.', role: 'Software Engineer', quote: 'The AI matching saved me hours of searching. I love the low fees!' },
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="glass p-6 rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <div className="flex text-gold-400 mb-3">
                {[...Array(5)].map((_, j) => (
                  <FaStar key={j} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.quote}"</p>
              <div className="mt-4 font-semibold text-gold-700 dark:text-gold-300">{testimonial.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="glass p-12 rounded-3xl shadow-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gold-800 dark:text-gold-300">
            Ready to Build Your Future?
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
            Join thousands of freelancers and clients who trust SkillBridge.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block bg-gold-600 text-white px-10 py-4 rounded-full hover:bg-gold-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Get Started – It's Free
          </Link>
        </div>
      </section>
    </div>
  );
};
export default Landing;