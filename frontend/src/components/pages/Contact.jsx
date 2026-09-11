const Contact = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gold-700 dark:text-gold-300 text-center mb-6">Contact Us</h1>
      <div className="glass p-8 rounded-3xl shadow-lg space-y-4">
        <p className="text-gray-600 dark:text-gray-400">Have questions or feedback? Reach out to us:</p>
        <div className="space-y-2">
          <p><strong>Email:</strong> <a href="" className="text-gold-600 hover:underline">hello@skillbridge.com</a></p>
          <p><strong>Twitter:</strong> <a href="" target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:underline">@skillbridge</a></p>
          <p><strong>Support Hours:</strong> Mon-Fri, 9:00 AM - 6:00 PM EAT</p>
        </div>
      </div>
    </div>
  );
};
export default Contact;