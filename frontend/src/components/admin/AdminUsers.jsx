import { useEffect, useMemo, useState } from 'react';
import { FaSearch, FaCheckCircle, FaBan, FaTrash, FaUserShield } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('accounts/admin/users/');
      setUsers(res.data || []);
    } catch (err) {
      console.warn('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get('accounts/admin/users/');
        if (!cancelled) setUsers(res.data || []);
      } catch (err) {
        console.warn('Failed to fetch users:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [search, users]);

  const toggleVerify = async (u) => {
    try {
      await api.patch(`accounts/admin/users/${u.id}/`, { is_verified: !u.is_verified });
      fetchUsers();
    } catch (err) {
      console.warn(err);
      alert('Failed to update');
    }
  };

  const toggleActive = async (u) => {
    try {
      await api.patch(`accounts/admin/users/${u.id}/`, { is_active: !u.is_active });
      fetchUsers();
    } catch (err) {
      console.warn(err);
      alert('Failed to update');
    }
  };

  const deleteUser = async (u) => {
    if (!window.confirm(`Permanently delete ${u.username}? This cannot be undone.`)) return;
    try {
      await api.delete(`accounts/admin/users/${u.id}/`);
      fetchUsers();
    } catch (err) {
      console.warn(err);
      alert(err.response?.data?.error || 'Failed to delete');
    }
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
          User Management
        </h1>
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
          <input
            type="text"
            placeholder="Search users..."
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
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3 hidden md:table-cell">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-100 dark:divide-gold-800/30">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gold-50/40 dark:hover:bg-gold-900/10">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gold-100 dark:bg-gold-900/50 flex items-center justify-center text-gold-600 font-semibold text-sm shrink-0">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                          {u.username}
                          {u.is_superuser && <FaUserShield className="text-gold-500" size={12} title="Superuser" />}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3 hidden md:table-cell">
                    <div className="flex gap-1">
                      {u.is_verified && <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Verified</span>}
                      {!u.is_verified && <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">Unverified</span>}
                      {u.is_active === false && <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">Banned</span>}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => toggleVerify(u)} title={u.is_verified ? 'Unverify' : 'Verify'} className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                        <FaCheckCircle size={14} />
                      </button>
                      <button onClick={() => toggleActive(u)} title={u.is_active ? 'Ban' : 'Unban'} className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20">
                        <FaBan size={14} />
                      </button>
                      {!u.is_superuser && (
                        <button onClick={() => deleteUser(u)} title="Delete" className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8 text-sm">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;