import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaBriefcase, FaProjectDiagram } from 'react-icons/fa';
import FreelancerDashboard from './FreelancerDashboard';
import ClientDashboard from './ClientDashboard';

const BothDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const [tab, setTab] = useState('freelancer');

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

      {tab === 'freelancer' ? <FreelancerDashboard /> : <ClientDashboard />}
    </div>
  );
};

export default BothDashboard;