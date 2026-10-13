import { useState } from 'react';
import api from '../../api/axiosConfig';

const DisputePanel = ({ order, onChanged }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!order || order.status === 'completed' || order.status === 'cancelled') {
    return null;
  }

  const handleOpenDispute = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please describe the issue.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post(`orders/${order.id}/dispute/`, { reason });
      onChanged?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to open dispute.');
    } finally {
      setLoading(false);
    }
  };

  if (order.status === 'disputed') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
          Dispute Open
        </h2>
        <p className="text-sm text-red-700 dark:text-red-400">
          {order.dispute_reason || 'A dispute has been opened for this order.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-2">Open a Dispute</h2>
      <p className="text-sm text-gray-500 mb-4">
        If something went wrong with this order, describe the issue and we'll
        step in.
      </p>
      <form onSubmit={handleOpenDispute} className="space-y-3">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe the issue…"
          className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          rows={3}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Opening…' : 'Open Dispute'}
        </button>
      </form>
    </div>
  );
};

export default DisputePanel;