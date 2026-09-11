import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaWallet, FaBriefcase, FaProjectDiagram, FaStar, FaClock,
  FaChartLine, FaPlus, FaEye,
} from 'react-icons/fa';
import api from '../../api/axiosConfig';

const BothDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const [tab, setTab] = useState('freelancer');
  const [stats, setStats] = useState({
    balance: 0, activeGigs: 0, activeProjects: 0,
    avgRating: 0, pendingMilestones: 0, earnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const w = await api.get('wallet/balance/');
        if (!cancelled) {
          setStats((s) => ({ ...s, balance: parseFloat(w.data?.balance) || 0 }));
        }
      } catch (err) {
        console.warn('Fetch failed:', err);
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

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gold-700 dark:text-gold-300">
            Welcome, {user?.first_name || user?.username}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
              Client & Freelancer
            </span>
            You can both hire and work.
          </p>
        </div>
      </div>

      <div className="glass p-1 rounded-xl inline-flex mb-6 shadow-sm">
        <button
          onClick={() => setTab('freelancer')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'freelancer'
              ? 'bg-gold-600 text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gold-600'
          }`}
        >
          <FaBriefcase className="inline mr-2" size={12} /> Freelancer View
        </button>
        <button
          onClick={() => setTab('client')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'client'
              ? 'bg-gold-600 text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gold-600'
          }`}
        >
          <FaProjectDiagram className="inline mr-2" size={12} /> Client View
        </button>
      </div>

      {tab === 'freelancer' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <Stat icon={FaWallet} label="Balance" value={`$${stats.balance.toFixed(2)}`} color="gold" />
            <Stat icon={FaBriefcase} label="Active Gigs" value={stats.activeGigs} color="blue" />
            <Stat icon={FaStar} label="Avg Rating" value={stats.avgRating.toFixed(1)} color="green" />
            <Stat icon={FaClock} label="Milestones" value={stats.pendingMilestones} color="orange" />
            <Stat icon={FaChartLine} label="Earnings" value={`$${stats.earnings.toFixed(2)}`} color="purple" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass p-6 rounded-2xl shadow-lg">
              <h2 className="text-lg font-semibold text-gold-700 dark:text-gold-300 mb-4">
                <FaChartLine className="inline mr-2" /> Freelancer Activity
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No recent freelancer activity.
              </p>
            </div>
            <div className="glass p-6 rounded-2xl shadow-lg">
              <h3 className="text-base font-semibold text-gold-700 dark:text-gold-300 mb-3">
                Freelancer Actions
              </h3>
              <div className="space-y-2">
                <Action to="/gigs/create" icon={FaPlus} label="Create Gig" />
                <Action to="/gigs" icon={FaBriefcase} label="My Gigs" />
                <Action to="/find-work" icon={FaEye} label="Find Work" />
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'client' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <Stat icon={FaWallet} label="Balance" value={`$${stats.balance.toFixed(2)}`} color="gold" />
            <Stat icon={FaProjectDiagram} label="Active Projects" value={stats.activeProjects} color="blue" />
            <Stat icon={FaChartLine} label="Open Proposals" value={0} color="green" />
            <Stat icon={FaClock} label="Milestones" value={0} color="orange" />
            <Stat icon={FaStar} label="Total Spent" value="$0.00" color="purple" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass p-6 rounded-2xl shadow-lg">
              <h2 className="text-lg font-semibold text-gold-700 dark:text-gold-300 mb-4">
                <FaChartLine className="inline mr-2" /> Client Activity
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No recent client activity.
              </p>
            </div>
            <div className="glass p-6 rounded-2xl shadow-lg">
              <h3 className="text-base font-semibold text-gold-700 dark:text-gold-300 mb-3">
                Client Actions
              </h3>
              <div className="space-y-2">
                <Action to="/projects/post" icon={FaPlus} label="Post Project" />
                <Action to="/projects" icon={FaProjectDiagram} label="My Projects" />
                <Action to="/hire-talent" icon={FaEye} label="Hire Talent" />
              </div>
            </div>
          </div>
        </>
      )}
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
      <div className={`p-2 rounded-lg inline-block ${c[color]}`}><Icon className="w-4 h-4" /></div>
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

export default BothDashboard;