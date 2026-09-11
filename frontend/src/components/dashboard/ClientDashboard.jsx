import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaWallet, FaProjectDiagram, FaClock, FaStar, FaPlus, FaEye,
  FaChartLine, FaArrowUp,
} from 'react-icons/fa';
import api from '../../api/axiosConfig';

const ClientDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const [stats, setStats] = useState({
    balance: 0, activeProjects: 0, openProposals: 0,
    pendingMilestones: 0, totalSpent: 0,
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
        console.warn('Balance fetch failed:', err);
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
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
          <Link to="/projects/post" className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition flex items-center gap-2 text-sm">
            <FaPlus size={12} /> Post Project
          </Link>
          <Link to="/hire-talent" className="border border-gold-600 text-gold-600 px-4 py-2 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/30 transition flex items-center gap-2 text-sm">
            <FaEye size={12} /> Hire Talent
          </Link>
        </div>
      </div>

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
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
            No activity yet. Post a project to get started.
          </p>
        </div>

        <div className="space-y-4">
          <div className="glass p-6 rounded-2xl shadow-lg">
            <h3 className="text-base font-semibold text-gold-700 dark:text-gold-300 mb-3">
              Client Quick Actions
            </h3>
            <div className="space-y-2">
              <Action to="/projects/post" icon={FaPlus} label="Post a Project" />
              <Action to="/projects" icon={FaProjectDiagram} label="My Projects" />
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