import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaSearch, FaPlus } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const ProjectList = ({ mine = false }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const user = useSelector((s) => s.auth.user);
  const location = useLocation();

  const isMine = mine || location.pathname.endsWith('/mine');

  useEffect(() => {
    let cancelled = false;

    const url = isMine && user?.id ? `projects/?client=${user.id}` : 'projects/';

    api.get(url)
      .then((res) => { if (!cancelled) setProjects(res.data || []); })
      .catch(() => { if (!cancelled) setProjects([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [isMine, user]);

  const filtered = projects.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status) => ({
    open: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    in_progress: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    completed: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  }[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300');

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
            {isMine ? 'My Projects' : 'Browse Projects'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isMine
              ? 'Projects you have posted.'
              : 'Open projects from clients looking for talent.'}
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={12}
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 outline-none focus:ring-2 focus:ring-gold-400 sm:w-64"
            />
          </div>
          {!isMine && (
            <Link
              to="/projects/post"
              className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <FaPlus size={12} /> Post Project
            </Link>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass p-8 rounded-2xl text-center text-gray-500 dark:text-gray-400">
          {isMine
            ? 'You have not posted any projects yet.'
            : 'No open projects right now.'}
          {isMine && (
            <div className="mt-4">
              <Link
                to="/projects/post"
                className="bg-gold-600 text-white px-6 py-2 rounded-lg hover:bg-gold-700 inline-block"
              >
                Post your first project
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="glass p-5 rounded-2xl shadow-lg hover:shadow-2xl transition flex flex-col"
            >
              <div className="flex justify-between items-start gap-3">
                <h3 className="text-lg font-semibold text-gold-800 dark:text-gold-200 line-clamp-2 flex-1">
                  {p.title}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${statusColor(p.status)}`}
                >
                  {p.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {p.category}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex-1 line-clamp-3">
                {p.description}
              </p>

              {isMine && p.proposal_count > 0 && (
                <p className="text-xs text-gold-600 dark:text-gold-400 mt-2 font-semibold">
                  {p.proposal_count} {p.proposal_count === 1 ? 'proposal' : 'proposals'}
                </p>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gold-200 dark:border-gold-800 gap-2 flex-wrap">
                <span className="text-gold-600 font-bold text-sm">
                  ${p.budget_min}-${p.budget_max}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {isMine && (
                    <Link
                      to={`/projects/${p.id}/edit`}
                      className="text-xs border border-gold-600 text-gold-600 px-3 py-1.5 rounded-full hover:bg-gold-50 dark:hover:bg-gold-900/30 transition"
                    >
                      Edit
                    </Link>
                  )}
                  <Link
                    to={isMine ? `/projects/${p.id}/manage` : `/projects/${p.id}`}
                    className="text-xs bg-gold-600 text-white px-3 py-1.5 rounded-full hover:bg-gold-700 transition"
                  >
                    {isMine ? 'Manage' : 'View'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;