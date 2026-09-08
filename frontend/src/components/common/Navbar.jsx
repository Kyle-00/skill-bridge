import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../store/sidebarSlice';
import { toggleTheme } from '../../store/themeSlice';
import { logout } from '../../store/authSlice';
import { FaBars, FaBell, FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useSelector((state) => state.theme.mode);
  const unread = useSelector((state) => state.notifications?.unread || 0);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navLinks = [
    { path: '/find-work', label: 'Find Work' },
    { path: '/hire-talent', label: 'Hire Talent' },
    { path: '/why-skillbridge', label: 'Why Us' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/resources', label: 'Resources' },
    { path: '/about', label: 'About' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gold-200/30 dark:border-gold-700/30 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + hamburger (if logged in) */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="text-gold-600 hover:text-gold-800 transition"
                aria-label="Toggle sidebar"
              >
                <FaBars size={22} />
              </button>
            )}
            <Link to="/" className="text-2xl font-bold tracking-tight text-gold-600 dark:text-gold-400 flex items-center">
              <span className="bg-gold-600 text-white px-2 py-1 rounded-lg mr-1 text-sm">SB</span>
              SkillBridge
            </Link>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full ${
                  location.pathname === link.path
                    ? 'text-gold-600 bg-gold-50 dark:bg-gold-900/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gold-600 hover:bg-gold-50/50 dark:hover:bg-gold-900/20'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-full hover:bg-gold-50 dark:hover:bg-gold-900/30 transition text-gold-600"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-full hover:bg-gold-50 dark:hover:bg-gold-900/30 transition text-gold-600"
              aria-label="Notifications"
            >
              <FaBell size={18} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {unread}
                </span>
              )}
            </Link>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                aria-label="Logout"
              >
                <FaSignOutAlt size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-medium text-gold-600 hover:text-gold-700 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-gold-600 rounded-full hover:bg-gold-700 shadow-md hover:shadow-lg transition"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;