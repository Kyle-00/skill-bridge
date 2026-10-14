import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaWallet, FaProjectDiagram, FaClock, FaStar, FaPlus, FaEye,
  FaChartLine, FaArrowUp, FaUserCheck,
} from 'react-icons/fa';
import api from '../../api/axiosConfig';

const ClientDashboard = ({ hideHeader = false }) => {
  const user = useSelector((state) => state.auth.user);
  const [stats, setStats] = useState({
    balance: 0, activeProjects: 0, openProposals: 0,
    pendingMilestones: 0, totalSpent: 0,
    profileCompletion: 0, missingFields: [],
    recentActivity: { projects: [], orders: [] },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [w, a] = await Promise.all([
          api.get('wallet/balance/'),
          api.get('analytics/client-stats/').catch(() => null),
        ]);
        if (cancelled) return;
        setStats((s) => ({
          ...s,
          balance: parseFloat(w.data?.balance) || 0,
        }));
        if (a?.data) {
          const pc = a.data.profile_completion || { percentage: 0, missing_fields: [] };
          setStats((s) => ({
            ...s,
            activeProjects: a.data.active_projects || 0,
            openProposals: a.data.open_proposals || 0,
            pendingMilestones: a.data.pending_milestones || 0,
            totalSpent: a.data.total_spent || 0,
            profileCompletion: pc.percentage,
            missingFields: pc.missing_fields || [],
            recentActivity: a.data.recent_activity || { projects: [], orders: [] },
          }));
        }
      } catch (err) {
        console.warn('Fetch failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  return (
    <div className={hideHeader ? '' : 'p-4 sm:p-6 max-w-7xl mx-auto'}>
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gold-700 dark:text-gold-300">
              Welcome, {user?.first_name || user?.username}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                Client
              </span>
              Manage your projects and freelancers here.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/projects/new" className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition flex items-center gap-2 text-sm">
              <FaPlus size={12} /> Post Project
            </Link>
            <Link to="/hire-talent" className="border border-gold-600 text-gold-600 px-4 py-2 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/30 transition flex items-center gap-2 text-sm">
              <FaEye size={12} /> Hire Talent
            </Link>
          </div>
        </div>
      )}

      {stats.profileCompletion < 100 && (
        <div className="mb-6 p-4 bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-xl flex items-center gap-4">
          <FaUserCheck className="text-gold-600 text-2xl shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1 flex-wrap gap-2">
              <p className="font-semibold text-gold-800 dark:text-gold-300 text-sm">
                Profile Completion: {stats.profileCompletion}%
                {stats.missingFields.length > 0 && (
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
                    Missing: {stats.missingFields.slice(0, 3).join(', ')}
                    {stats.missingFields.length > 3 && ` +${stats.missingFields.length - 3} more`}
                  </span>
                )}
              </p>
              <Link to="/profile" className="text-xs font-semibold text-gold-600 hover:underline">
                Complete Profile
              </Link>
            </div>
            <div className="w-full bg-gold-200 dark:bg-gold-800 rounded-full h-2">
              <div
                className="bg-gold-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.profileCompletion}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <Stat icon={FaWallet} label="Balance" value={`$${stats.balance.toFixed(2)}`} color="gold" />
        <Stat icon={FaProjectDiagram} label="Active Projects" value={stats.activeProjects} color="blue" />
        <Stat icon={FaChartLine} label="Open Proposals" value={stats.openProposals} color="green" />
        <Stat icon={FaClock} label="Pending Milestones" value={stats.pendingMilestones} color="orange" />
        <Stat icon={FaStar} label="Total Spent" value={`$${stats.totalSpent.toFixed(2)}`} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-gold-700 dark:text-gold-300 mb-4 flex items-center gap-2">
            <FaChartLine /> Recent Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Recent Projects</h3>
              {stats.recentActivity.projects.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent projects.</p>
              ) : (
                <div className="space-y-2">
                  {stats.recentActivity.projects.map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{p.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(p.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 capitalize shrink-0">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Recent Orders</h3>
              {stats.recentActivity.orders.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent orders.</p>
              ) : (
                <div className="space-y-2">
                  {stats.recentActivity.orders.map((o) => (
                    <div key={o.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          Order #{o.id} - {o.freelancer__username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ${parseFloat(o.total_amount).toFixed(2)}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 capitalize shrink-0">
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass p-6 rounded-2xl shadow-lg">
            <h3 className="text-base font-semibold text-gold-700 dark:text-gold-300 mb-3">
              Client Quick Actions
            </h3>
            <div className="space-y-2">
              <Action to="/projects/new" icon={FaPlus} label="Post a Project" />
              <Action to="/my-projects" icon={FaProjectDiagram} label="My Projects" />
              <Action to="/hire-talent" icon={FaEye} label="Browse Freelancers" />
              <Action to="/wallet/deposit" icon={FaArrowUp} label="Add Funds" />
            </div>
          </div>

          <div className="glass p-6 rounded-2xl shadow-lg">
            <h3 className="text-base font-semibold text-gold-700 dark:text-gold-300 mb-3">
              Wallet
            </h3>
            <div className="text-3xl font-bold text-gold-600 dark:text-gold-400">
              ${stats.balance.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Available for payments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, color }) => {
  const c = {
    gold: 'bg-gold-100 dark:bg-gold-900/30 text-gold-600',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  };
  return (
    <div className="glass p-3 sm:p-4 rounded-2xl shadow-lg">
      <div className={`p-2 rounded-lg inline-block ${c[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase mt-2">{label}</p>
      <p className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200 truncate">{value}</p>
    </div>
  );
};

const Action = ({ to, icon: Icon, label }) => (
  <Link to={to} className="flex items-center justify-between p-3 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/20 transition border border-gold-200/50 text-sm">
    <span className="flex items-center gap-2"><Icon className="text-gold-600" /> {label}</span>
    <span className="text-gray-400">→</span>
  </Link>
);

export default ClientDashboard;