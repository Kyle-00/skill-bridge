import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const FindWork = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    api.get('projects/?status=open')
      .then((res) => { if (!cancelled) setProjects(res.data || []); })
      .catch(() => { if (!cancelled) setProjects([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
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
            Find Work
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Open projects from clients looking for talent.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass p-8 rounded-2xl text-center text-gray-500 dark:text-gray-400">
          No open projects right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="glass p-5 rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col"
            >
              <h3 className="text-lg font-semibold text-gold-800 dark:text-gold-200 line-clamp-2">
                {p.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {p.category}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex-1 line-clamp-3">
                {p.description}
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gold-200 dark:border-gold-800">
                <span className="text-gold-600 font-bold text-sm">
                  ${p.budget_min}-${p.budget_max}
                </span>
                <Link
                  to={`/projects/${p.id}`}
                  className="text-sm bg-gold-600 text-white px-4 py-1.5 rounded-full hover:bg-gold-700 transition"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindWork;