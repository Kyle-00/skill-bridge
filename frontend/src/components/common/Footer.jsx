import { Link } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaGithub, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gold-200/30 dark:border-gold-700/30 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-bold text-gold-600 dark:text-gold-400">SkillBridge</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
            Bridging talent to global opportunities with lower fees and smarter matching.
          </p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="text-gray-400 hover:text-gold-600 transition"><FaTwitter size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-gold-600 transition"><FaLinkedin size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-gold-600 transition"><FaGithub size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-gold-600 transition"><FaYoutube size={20} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">For Freelancers</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/find-work" className="text-gray-600 dark:text-gray-400 hover:text-gold-600 transition">Find Work</Link></li>
            <li><Link to="/gigs/create" className="text-gray-600 dark:text-gray-400 hover:text-gold-600 transition">Create Gig</Link></li>
            <li><Link to="/how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-gold-600 transition">How It Works</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">For Clients</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/hire-talent" className="text-gray-600 dark:text-gray-400 hover:text-gold-600 transition">Hire Talent</Link></li>
            <li><Link to="/projects/post" className="text-gray-600 dark:text-gray-400 hover:text-gold-600 transition">Post Project</Link></li>
            <li><Link to="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-gold-600 transition">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Company</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-gold-600 transition">About Us</Link></li>
            <li><Link to="/blog" className="text-gray-600 dark:text-gray-400 hover:text-gold-600 transition">Blog</Link></li>
            <li><Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-gold-600 transition">Contact</Link></li>
            <li><Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gold-600 transition">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-4 border-t border-gold-200/30 dark:border-gold-700/30 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} SkillBridge. All rights reserved.
      </div>
    </footer>
  );
};
export default Footer;