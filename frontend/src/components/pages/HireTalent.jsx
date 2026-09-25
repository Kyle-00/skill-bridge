import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaClock } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const HireTalent = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    api.get('gigs/')
      .then((res) => { if (!cancelled) setGigs(res.data || []); })
      .catch(() => { if (!cancelled) setGigs([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const filtered = gigs.filter(
    (g) =>
      g.title?.toLowerCase().includes(search.toLowerCase()) ||
      g.category?.toLowerCase().includes(search.toLowerCase()) ||
      g.freelancer_name?.toLowerCase().includes(search.toLowerCase())
  );

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
            Hire Talent
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Services offered by freelancers on SkillBridge.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={12}
          />
          <input
            type="text"
            placeholder="Search gigs or freelancers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass p-8 rounded-2xl text-center text-gray-500 dark:text-gray-400">
          No gigs available right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((gig) => (
            <div
              key={gig.id}
              className="glass p-5 rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold shrink-0">
                  {gig.freelancer_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {gig.freelancer_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {gig.freelancer_title || 'Freelancer'}
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gold-800 dark:text-gold-200 line-clamp-2">
                {gig.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {gig.category}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex-1 line-clamp-3">
                {gig.description}
              </p>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gold-200 dark:border-gold-800">
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <FaClock size={10} /> {gig.delivery_days}d
                  </span>
                </div>
                <span className="text-gold-600 font-bold">${gig.price}</span>
              </div>

              <Link
                to={`/gigs/${gig.id}`}
                className="mt-3 text-center bg-gold-600 text-white px-4 py-2 rounded-full hover:bg-gold-700 transition text-sm"
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

export default HireTalent;