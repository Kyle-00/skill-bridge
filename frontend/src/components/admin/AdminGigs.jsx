import { useEffect, useState } from 'react';
import { FaTrash, FaEye, FaEyeSlash, FaSearch } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const AdminGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('gigs/admin/')
      .then((res) => setGigs(res.data || []))
      .catch((err) => console.warn('Failed to load gigs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (g) => {
    try {
      await api.post(`gigs/admin/${g.id}/toggle_active/`);
      load();
    } catch (err) {
      console.warn(err);
      alert('Failed to update');
    }
  };

  const deleteGig = async (g) => {
    if (!window.confirm(`Delete gig "${g.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`gigs/admin/${g.id}/`);
      load();
    } catch (err) {
      console.warn(err);
      alert('Failed to delete');
    }
  };

  const filtered = gigs.filter(
    (g) =>
      g.title?.toLowerCase().includes(search.toLowerCase()) ||
      g.category?.toLowerCase().includes(search.toLowerCase())
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
          Gig Management
        </h1>
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
          <input
            type="text"
            placeholder="Search gigs..."
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
                <th className="text-left p-3">Gig</th>
                <th className="text-left p-3 hidden md:table-cell">Category</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3 hidden lg:table-cell">Freelancer</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-100 dark:divide-gold-800/30">
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-gold-50/40 dark:hover:bg-gold-900/10">
                  <td className="p-3">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{g.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {g.is_active ? '● Active' : '● Inactive'}
                    </p>
                  </td>
                  <td className="p-3 hidden md:table-cell">{g.category}</td>
                  <td className="p-3 font-semibold text-gold-600">${g.price}</td>
                  <td className="p-3 hidden lg:table-cell">{g.freelancer?.username || '—'}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => toggleActive(g)}
                        title={g.is_active ? 'Deactivate' : 'Activate'}
                        className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                      >
                        {g.is_active ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </button>
                      <button
                        onClick={() => deleteGig(g)}
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
          <p className="text-center text-gray-500 py-8 text-sm">No gigs found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminGigs;