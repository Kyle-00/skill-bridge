import { FaTwitter, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';

const About = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gold-700 dark:text-gold-300 text-center mb-4">About SkillBridge</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
        We're on a mission to revolutionise the freelance industry.
      </p>

      <div className="glass p-8 rounded-3xl shadow-lg space-y-6">
        <h2 className="text-2xl font-semibold text-gold-700 dark:text-gold-300">Our Story</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          SkillBridge was born from the frustration of high fees, poor discovery, and limited payment options on existing platforms. We wanted to create a marketplace that truly serves freelancers and clients alike – with fairness, transparency, and innovation at its core.
        </p>

        <h2 className="text-2xl font-semibold text-gold-700 dark:text-gold-300 pt-4">Our Values</h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li><strong>Inclusivity</strong> - Everyone deserves access to global opportunities.</li>
          <li><strong>Trust</strong> - Secure escrow, verified identities, fair disputes.</li>
          <li><strong>Innovation</strong> - AI matching and smart tools to empower users.</li>
          <li><strong>Fairness</strong> - Low fees, no hidden charges, 0% client fee.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gold-700 dark:text-gold-300 pt-4">Contact Us</h2>
        <div className="flex flex-wrap gap-6">
          <a
            href=""
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gold-600 transition"
          >
            <FaTwitter size={20} /> Twitter
          </a>
          <a
            href=""
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gold-600 transition"
          >
            <FaLinkedin size={20} /> LinkedIn
          </a>
          <a
            href=""
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gold-600 transition"
          >
            <FaGithub size={20} /> GitHub
          </a>
          <a
            href="mailto:hello@skillbridge.com"
            className="flex items-center gap-2 text-gray-700 dark:text-gold-300 hover:text-gold-600 transition"
          >
            <FaEnvelope size={20} /> hello@skillbridge.com
          </a>
        </div>
      </div>
    </div>
  );
};
export default About;