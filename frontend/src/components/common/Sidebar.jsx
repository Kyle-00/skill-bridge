import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaHome, FaUser, FaBriefcase, FaProjectDiagram, FaComments,
  FaCog, FaSignOutAlt, FaWallet, FaUsers, FaUserShield,
} from 'react-icons/fa';
import { logout } from '../../store/authSlice';
import { closeSidebar } from '../../store/sidebarSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector((s) => s.sidebar.isOpen);
  const user = useSelector((s) => s.auth.user);

  const role = user?.role || 'both';
  const isAdmin = user?.is_superuser;

  const handleLogout = () => {
    dispatch(logout());
    dispatch(closeSidebar());
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-lg transition ${
      isActive
        ? 'bg-gold-100 dark:bg-gold-900 text-gold-700 dark:text-gold-300'
        : 'hover:bg-gold-50 dark:hover:bg-gold-900/50 text-gray-700 dark:text-gray-300'
    }`;

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] glass border-r border-gold-200 dark:border-gold-700 transition-transform duration-300 w-64 z-40 overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 flex flex-col gap-1 h-full">
        {/* User info */}
        <div className="flex items-center gap-3 p-3 mb-2 border-b border-gold-200 dark:border-gold-700">
          <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold shrink-0">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gold-700 dark:text-gold-300 text-sm truncate">
              {user?.username || 'User'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {isAdmin ? 'Administrator' : role}
            </div>
          </div>
        </div>

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-red-500 dark:text-red-400">
              Admin
            </div>
            <NavLink to="/admin" end className={linkClass}>
              <FaUserShield /> Admin Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={linkClass}>
              <FaUsers /> Users
            </NavLink>
            <div className="border-t border-gold-200 dark:border-gold-700 my-2"></div>
          </>
        )}

        {/* Common */}
        <NavLink to="/dashboard" className={linkClass}>
          <FaHome /> Dashboard
        </NavLink>

        {/* Freelancer links */}
        {(role === 'freelancer' || role === 'both') && (
          <>
            <NavLink to="/gigs" end className={linkClass}>
              <FaBriefcase /> My Gigs
            </NavLink>
            <NavLink to="/gigs/create" className={linkClass}>
              <FaBriefcase /> Create Gig
            </NavLink>
          </>
        )}

        {/* Client links */}
        {(role === 'client' || role === 'both') && (
          <>
            <NavLink to="/projects" end className={linkClass}>
              <FaProjectDiagram /> Projects
            </NavLink>
            <NavLink to="/projects/post" className={linkClass}>
              <FaProjectDiagram /> Post Project
            </NavLink>
          </>
        )}

        {/* Common continued */}
        <NavLink to="/wallet" className={linkClass}>
          <FaWallet /> Wallet
        </NavLink>
        <NavLink to="/messages" className={linkClass}>
          <FaComments /> Messages
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <FaUser /> Profile
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          <FaCog /> Settings
        </NavLink>

        <div className="flex-1"></div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition mt-auto"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;