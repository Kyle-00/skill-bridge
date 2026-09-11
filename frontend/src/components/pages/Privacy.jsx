const Privacy = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gold-700 dark:text-gold-300 text-center mb-6">Privacy Policy</h1>
      <div className="glass p-8 rounded-3xl shadow-lg space-y-4">
        <p className="text-gray-600 dark:text-gray-400">Last updated: September 2026</p>
        <p className="text-gray-600 dark:text-gray-400">SkillBridge is committed to protecting your privacy. We collect minimal data and never share it with third parties.</p>
        <h3 className="text-lg font-semibold text-gold-700 dark:text-gold-300">What we collect:</h3>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li>Name and email address for account creation</li>
          <li>Payment information (processed securely by Stripe and M-Pesa)</li>
          <li>Profile details you choose to share</li>
        </ul>
        <h3 className="text-lg font-semibold text-gold-700 dark:text-gold-300">Contact:</h3>
        <p className="text-gray-600 dark:text-gray-400">Email: <a href="mailto:privacy@skillbridge.com" className="text-gold-600 hover:underline">privacy@skillbridge.com</a></p>
      </div>
    </div>
  );
};
export default Privacy;