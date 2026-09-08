import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaStar, FaDollarSign } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const HireTalent = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const res = await api.get('accounts/users/?role=freelancer');
        setFreelancers(res.data);
      } catch {
        setFreelancers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, []);

  const filtered = freelancers.filter(f =>
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gold-700 dark:text-gold-300">Hire Talent</h1>
        <div className="relative w-full md:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search freelancers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gold-600 animate-pulse">Loading freelancers...</div>
      ) : filtered.length === 0 ? (
        <div className="glass p-8 rounded-2xl text-center text-gray-500 dark:text-gray-400">
          {search ? 'No freelancers match your search.' : 'No freelancers registered yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((freelancer) => (
            <div key={freelancer.id} className="glass p-5 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold text-xl">
                  {freelancer.username[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gold-800 dark:text-gold-200">{freelancer.username}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trust score: {freelancer.trust_score || 'N/A'}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span><FaStar className="inline text-gold-500" /> 4.8</span>
                <span><FaDollarSign /> $50/hr</span>
              </div>
              <Link
                to={`/profile/${freelancer.id}`}
                className="mt-4 block text-center bg-gold-600 text-white px-4 py-1.5 rounded-full hover:bg-gold-700 transition text-sm"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default HireTalent;