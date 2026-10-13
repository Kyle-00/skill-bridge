import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaWallet, FaBriefcase, FaStar, FaClock, FaChartLine,
  FaPlus, FaEye, FaArrowUp,
} from 'react-icons/fa';
import api from '../../api/axiosConfig';

const FreelancerDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const [stats, setStats] = useState({
    balance: 0, activeGigs: 0, avgRating: 0,
    pendingMilestones: 0, totalEarnings: 0,
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [w, g, a] = await Promise.all([
          api.get('wallet/balance/'),
          api.get(`gigs/?freelancer=${user?.id || ''}`),
          api.get('analytics/freelancer-stats/').catch(() => null),
        ]);
        if (cancelled) return;
        setStats((s) => ({
          ...s,
          balance: parseFloat(w.data?.balance) || 0,
          activeGigs: Array.isArray(g.data) ? g.data.length : 0,
        }));
        if (a?.data) {
          setAnalytics(a.data);
          setStats((s) => ({
            ...s,
            avgRating: a.data.ratings?.quality || 0,
            totalEarnings: a.data.lifetime_earnings || 0,
            pendingMilestones: a.data.pending_milestone_reviews || 0,
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

  const maxEarning = analytics ? Math.max(...analytics.earnings.series, 1) : 1;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gold-700 dark:text-gold-300">
            Welcome, {user?.first_name || user?.username}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
              Freelancer
            </span>
            {analytics && `${analytics.orders.completion_rate}% completion rate`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/gigs/create" className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition flex items-center gap-2 text-sm">
            <FaPlus size={12} /> Create Gig
          </Link>
          <Link to="/find-work" className="border border-gold-600 text-gold-600 px-4 py-2 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/30 transition flex items-center gap-2 text-sm">
            <FaEye size={12} /> Find Work
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <Stat icon={FaWallet} label="Balance" value={`$${stats.balance.toFixed(2)}`} color="gold" />
        <Stat icon={FaBriefcase} label="Active Gigs" value={stats.activeGigs} color="blue" />
        <Stat icon={FaStar} label="Avg Rating" value={stats.avgRating.toFixed(1)} color="green" />
        <Stat icon={FaClock} label="Milestones Awaiting Review" value={stats.pendingMilestones} color="orange" />
        <Stat icon={FaChartLine} label="6-Month Earnings" value={`$${stats.totalEarnings.toFixed(2)}`} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-gold-700 dark:text-gold-300 mb-4 flex items-center gap-2">
            <FaChartLine /> Earnings — last 6 months
          </h2>
          {analytics && analytics.earnings.series.some((v) => v > 0) ? (
            <div className="flex items-end gap-2 h-48">
              {analytics.earnings.series.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {v > 0 ? `$${v.toFixed(0)}` : ''}
                  </span>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-gold-600 to-gold-400"
                    style={{ height: `${Math.max((v / maxEarning) * 100, 2)}%` }}
                    title={`$${v.toFixed(2)}`}
                  />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {analytics.earnings.labels[i]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
              No earnings in the last 6 months yet. Complete an order to see your chart grow.
            </p>
          )}

          {analytics && analytics.ratings.count > 0 && (
            <div className="mt-6 pt-4 border-t border-gold-200 dark:border-gold-800">
              <h3 className="text-sm font-semibold text-gold-700 dark:text-gold-300 mb-3">
                Rating breakdown ({analytics.ratings.count} reviews)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['quality', 'communication', 'timeliness', 'professionalism'].map((key) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-bold text-gold-600 dark:text-gold-400">
                      {analytics.ratings[key]}
                    </div>
                    <div className="text-[10px] uppercase text-gray-500 dark:text-gray-400">{key}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {analytics && analytics.top_gigs.length > 0 && (
            <div className="glass p-6 rounded-2xl shadow-lg">
              <h3 className="text-base font-semibold text-gold-700 dark:text-gold-300 mb-3">
                Top Gigs
              </h3>
              <div className="space-y-2">
                {analytics.top_gigs.map((g) => (
                  <div key={g.title} className="flex items-center justify-between text-sm">
                    <span className="truncate text-gray-700 dark:text-gray-300">{g.title}</span>
                    <span className="text-gold-600 font-semibold shrink-0 ml-2">
                      ${Number(g.revenue).toFixed(0)}
                      <span className="text-gray-400 font-normal"> ({g.sales})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass p-6 rounded-2xl shadow-lg">
            <h3 className="text-base font-semibold text-gold-700 dark:text-gold-300 mb-3">
              Freelancer Quick Actions
            </h3>
            <div className="space-y-2">
              <Action to="/gigs/create" icon={FaPlus} label="Create a Gig" />
              <Action to="/gigs/mine" icon={FaBriefcase} label="My Gigs" />
              <Action to="/find-work" icon={FaEye} label="Browse Matched Projects" />
              <Action to="/orders" icon={FaClock} label="My Orders" />
              <Action to="/wallet/withdraw" icon={FaArrowUp} label="Withdraw Earnings" />
            </div>
          </div>

          <div className="glass p-6 rounded-2xl shadow-lg">
            <h3 className="text-base font-semibold text-gold-700 dark:text-gold-300 mb-3">
              Wallet
            </h3>
            <div className="text-3xl font-bold text-gold-600 dark:text-gold-400">
              ${stats.balance.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ready to withdraw</p>
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

export default FreelancerDashboard;