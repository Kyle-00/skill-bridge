import { useSelector } from 'react-redux';
import { FaWallet, FaBriefcase, FaStar, FaClock } from 'react-icons/fa';

const Dashboard = () => {
  const user = useSelector(state => state.auth.user);
  // In real app, fetch stats from API
  const stats = { earnings: 1250, activeProjects: 3, avgRating: 4.8, pendingMilestones: 2 };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gold-700 dark:text-gold-300 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <h1 className="text-3xl font-bold text-gold-700 dark:text-gold-300 mb-8">
           Welcome, {user?.username || 'User'}!
        </h1>
        {[
          { icon: <FaWallet />, label: 'Earnings', value: `$${stats.earnings}` },
          { icon: <FaBriefcase />, label: 'Active Projects', value: stats.activeProjects },
          { icon: <FaStar />, label: 'Avg Rating', value: stats.avgRating },
          { icon: <FaClock />, label: 'Pending Milestones', value: stats.pendingMilestones },
        ].map((stat, idx) => (
          <div key={idx} className="glass p-6 rounded-2xl shadow-lg flex items-center gap-4">
            <div className="text-3xl text-gold-500">{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gold-700 dark:text-gold-200">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-gold-700 dark:text-gold-300">Earnings Trend</h2>
          <div className="h-48 flex items-center justify-center text-gray-400">[Chart placeholder]</div>
        </div>
        <div className="glass p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-gold-700 dark:text-gold-300">Recent Projects</h2>
          <ul className="mt-4 space-y-2">
            <li className="flex justify-between border-b border-gold-200 dark:border-gold-800 py-2">
              <span>Project Alpha</span>
              <span className="text-green-500">Completed</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;