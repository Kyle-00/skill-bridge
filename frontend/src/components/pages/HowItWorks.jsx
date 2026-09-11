const HowItWorks = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gold-700 dark:text-gold-300 text-center mb-6">How SkillBridge Works</h1>
      <div className="glass p-8 rounded-3xl shadow-lg space-y-8">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 bg-gold-600 text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0">1</div>
          <div>
            <h3 className="text-xl font-semibold text-gold-700 dark:text-gold-300">Create Your Profile</h3>
            <p className="text-gray-600 dark:text-gray-400">Sign up as a freelancer or client, add your skills, portfolio, and rates.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 bg-gold-600 text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0">2</div>
          <div>
            <h3 className="text-xl font-semibold text-gold-700 dark:text-gold-300">Find Work or Hire</h3>
            <p className="text-gray-600 dark:text-gray-400">Browse gigs, post projects, or let our AI match you with opportunities.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 bg-gold-600 text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0">3</div>
          <div>
            <h3 className="text-xl font-semibold text-gold-700 dark:text-gold-300">Get Paid Securely</h3>
            <p className="text-gray-600 dark:text-gray-400">Milestone-based escrow with M-Pesa, Stripe, or bank transfer.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HowItWorks;