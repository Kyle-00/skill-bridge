import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('orders/disputes/')
      .then((res) => setDisputes(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load disputes.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading disputes…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Disputes
      </h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {disputes.length === 0 ? (
        <p className="text-gray-500">No open disputes.</p>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div
              key={d.id}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Order #{d.id}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Reason: {d.dispute_reason}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                  {d.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;