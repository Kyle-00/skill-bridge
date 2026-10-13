import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers, FaBriefcase, FaProjectDiagram, FaShoppingCart,
  FaDollarSign, FaUserPlus, FaChartLine, FaExclamationTriangle,
} from 'react-icons/fa';
import api from '../../api/axiosConfig';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get('analytics/admin-stats/');
        if (!cancelled) setStats(res.data);
      } catch (err) {
        console.warn('Failed to load admin stats:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Failed to load admin stats. Make sure you are logged in as superuser.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gold-700 dark:text-gold-300">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Platform-wide overview and management.
          </p>
        </div>
      </div>

      {stats.open_disputes > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <FaExclamationTriangle className="text-red-600 text-xl shrink-0" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-300">
              You have {stats.open_disputes} open {stats.open_disputes === 1 ? 'dispute' : 'disputes'} requiring attention.
            </p>
            <Link to="/admin/disputes" className="text-sm text-red-600 hover:underline">
              Review disputes
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        <Stat icon={FaUsers} label="Total Users" value={stats.users.total} sub={`+${stats.users.new_7d} this week`} color="gold" />
        <Stat icon={FaBriefcase} label="Freelancers" value={stats.users.freelancers} color="gold" />
        <Stat icon={FaUsers} label="Clients" value={stats.users.clients} color="green" />
        <Stat icon={FaProjectDiagram} label="Projects" value={stats.projects.total} sub={`${stats.projects.open} open`} color="purple" />
        <Stat icon={FaShoppingCart} label="Orders" value={stats.orders.total} sub={`${stats.orders.completed} done`} color="orange" />
        <Stat icon={FaDollarSign} label="Revenue" value={`$${stats.revenue.toFixed(2)}`} color="gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gold-700 dark:text-gold-300 flex items-center gap-2">
              <FaChartLine /> Recent Platform Activity
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Recent Orders</h3>
              <div className="space-y-3">
                {stats.recent_activity.orders.map((o) => (
                  <div key={o.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        Order #{o.id} - {o.client__username} to {o.freelancer__username}
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
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Recent Gigs</h3>
              <div className="space-y-3">
                {stats.recent_activity.gigs.map((g) => (
                  <div key={g.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{g.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        by {g.freelancer__username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gold-700 dark:text-gold-300 flex items-center gap-2">
              <FaUserPlus /> Recently Joined Users
            </h2>
            <Link to="/admin/users" className="text-sm text-gold-600 hover:underline">
              View all
            </Link>
          </div>
          {stats.recent_users.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No users yet.</p>
          ) : (
            <div className="divide-y divide-gold-100 dark:divide-gold-800/30">
              {stats.recent_users.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gold-100 dark:bg-gold-900/50 flex items-center justify-center text-gold-600 font-semibold text-sm shrink-0">
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">
                        {u.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 capitalize shrink-0">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, sub, color }) => {
  const c = {
    gold: 'bg-gold-100 dark:bg-gold-900/30 text-gold-600',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
  };
  return (
    <div className="glass p-3 sm:p-4 rounded-2xl shadow-lg">
      <div className={`p-2 rounded-lg inline-block ${c[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase mt-2">
        {label}
      </p>
      <p className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
        {value}
      </p>
      {sub && <p className="text-[10px] text-gold-600 dark:text-gold-400">{sub}</p>}
    </div>
  );
};

export default AdminDashboard;