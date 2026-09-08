import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import {
  FaHome, FaUser, FaBriefcase, FaProjectDiagram, FaComments,
  FaCog, FaSignOutAlt,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { closeSidebar } from '../../store/sidebarSlice';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector(state => state.sidebar.isOpen);
  const user = useSelector(state => state.auth.user);
  const role = user?.role || 'both';

  const handleLogout = () => {
    dispatch(logout());
    dispatch(closeSidebar());
    navigate('/');
  };

  return (
    <aside
      className={`fixed top-16 left-0 h-full glass border-r border-gold-200 dark:border-gold-700 transition-transform duration-300 w-64 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 flex flex-col gap-1 mt-2 h-full overflow-y-auto">
        {/* User Info */}
        <div className="flex items-center gap-3 p-3 mb-2 border-b border-gold-200 dark:border-gold-700">
          <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-semibold text-gold-700 dark:text-gold-300">{user?.username || 'User'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</div>
          </div>
        </div>

        {/* Navigation Links */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg transition ${
              isActive
                ? 'bg-gold-100 dark:bg-gold-900 text-gold-700 dark:text-gold-300'
                : 'hover:bg-gold-50 dark:hover:bg-gold-900/50 text-gray-700 dark:text-gray-300'
            }`
          }
        >
          <FaHome /> Dashboard
        </NavLink>

        {role !== 'client' && (
          <>
            <NavLink
              to="/gigs"
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive
                    ? 'bg-gold-100 dark:bg-gold-900 text-gold-700 dark:text-gold-300'
                    : 'hover:bg-gold-50 dark:hover:bg-gold-900/50 text-gray-700 dark:text-gray-300'
                }`
              }
            >
              <FaBriefcase /> My Gigs
            </NavLink>
            <NavLink
              to="/gigs/create"
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive
                    ? 'bg-gold-100 dark:bg-gold-900 text-gold-700 dark:text-gold-300'
                    : 'hover:bg-gold-50 dark:hover:bg-gold-900/50 text-gray-700 dark:text-gray-300'
                }`
              }
            >
              <FaBriefcase /> Create Gig
            </NavLink>
          </>
        )}

        {role !== 'freelancer' && (
          <>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive
                    ? 'bg-gold-100 dark:bg-gold-900 text-gold-700 dark:text-gold-300'
                    : 'hover:bg-gold-50 dark:hover:bg-gold-900/50 text-gray-700 dark:text-gray-300'
                }`
              }
            >
              <FaProjectDiagram /> Projects
            </NavLink>
            <NavLink
              to="/projects/post"
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive
                    ? 'bg-gold-100 dark:bg-gold-900 text-gold-700 dark:text-gold-300'
                    : 'hover:bg-gold-50 dark:hover:bg-gold-900/50 text-gray-700 dark:text-gray-300'
                }`
              }
            >
              <FaProjectDiagram /> Post Project
            </NavLink>
          </>
        )}

        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg transition ${
              isActive
                ? 'bg-gold-100 dark:bg-gold-900 text-gold-700 dark:text-gold-300'
                : 'hover:bg-gold-50 dark:hover:bg-gold-900/50 text-gray-700 dark:text-gray-300'
            }`
          }
        >
          <FaComments /> Messages
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg transition ${
              isActive
                ? 'bg-gold-100 dark:bg-gold-900 text-gold-700 dark:text-gold-300'
                : 'hover:bg-gold-50 dark:hover:bg-gold-900/50 text-gray-700 dark:text-gray-300'
            }`
          }
        >
          <FaUser /> Profile
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg transition ${
              isActive
                ? 'bg-gold-100 dark:bg-gold-900 text-gold-700 dark:text-gold-300'
                : 'hover:bg-gold-50 dark:hover:bg-gold-900/50 text-gray-700 dark:text-gray-300'
            }`
          }
        >
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