import { useEffect, useState } from 'react';
import { FaTrash, FaBan, FaSearch } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('projects/admin/')
      .then((res) => setProjects(res.data || []))
      .catch((err) => console.warn('Failed to load projects:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const cancelProject = async (p) => {
    if (!window.confirm(`Cancel project "${p.title}"?`)) return;
    try {
      await api.post(`projects/admin/${p.id}/cancel/`);
      load();
    } catch (err) {
      console.warn(err);
      alert('Failed to cancel');
    }
  };

  const deleteProject = async (p) => {
    if (!window.confirm(`Delete project "${p.title}"?`)) return;
    try {
      await api.delete(`projects/admin/${p.id}/`);
      load();
    } catch (err) {
      console.warn(err);
      alert('Failed to delete');
    }
  };

  const filtered = projects.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status) => {
    const map = {
      open: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };
    return map[status] || map.open;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
          Project Management
        </h1>
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 text-sm"
          />
        </div>
      </div>

      <div className="glass rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gold-50 dark:bg-gold-950/30 text-gold-700 dark:text-gold-300">
              <tr>
                <th className="text-left p-3">Project</th>
                <th className="text-left p-3">Budget</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-100 dark:divide-gold-800/30">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gold-50/40 dark:hover:bg-gold-900/10">
                  <td className="p-3">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{p.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.category}</p>
                  </td>
                  <td className="p-3 font-semibold text-gold-600">
                    ${p.budget_min} – ${p.budget_max}
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadge(p.status)}`}>
                      {p.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      {p.status !== 'cancelled' && (
                        <button
                          onClick={() => cancelProject(p)}
                          title="Cancel"
                          className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                        >
                          <FaBan size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteProject(p)}
                        title="Delete"
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8 text-sm">No projects found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;