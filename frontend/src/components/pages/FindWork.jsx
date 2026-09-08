import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaClock } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const FindWork = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const res = await api.get('gigs/');
        setGigs(res.data);
      } catch {
        setGigs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGigs();
  }, []);

  const filtered = gigs.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gold-700 dark:text-gold-300">Find Work</h1>
        <div className="relative w-full md:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search gigs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gold-600 animate-pulse">Loading gigs...</div>
      ) : filtered.length === 0 ? (
        <div className="glass p-8 rounded-2xl text-center text-gray-500 dark:text-gray-400">
          {search ? 'No gigs match your search.' : 'No gigs available at the moment.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((gig) => (
            <div key={gig.id} className="glass p-5 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 flex flex-col">
              <h3 className="text-xl font-semibold text-gold-800 dark:text-gold-200">{gig.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{gig.category}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 flex-1 line-clamp-3">{gig.description}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gold-200 dark:border-gold-800">
                <span className="text-gold-600 font-bold">${gig.price}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <FaClock /> {gig.delivery_days} days
                </span>
              </div>
              <Link
                to={`/gigs/${gig.id}`}
                className="mt-3 text-center bg-gold-600 text-white px-4 py-1.5 rounded-full hover:bg-gold-700 transition text-sm"
              >
                View Gig
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default FindWork;