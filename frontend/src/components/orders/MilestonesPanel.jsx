import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

const MilestonesPanel = ({ order }) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMilestones = async () => {
      if (!order?.id) return;
      try {
        const res = await api.get(`orders/${order.id}/milestones/`);
        if (isMounted) setMilestones(res.data);
      } catch {
        // endpoint may not exist yet — silently ignore
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMilestones();

    return () => {
      isMounted = false;
    };
  }, [order?.id]);

  if (loading || milestones.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Milestones</h2>
      <div className="space-y-3">
        {milestones.map((m) => (
          <div
            key={m.id}
            className="flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div>
              <div className="font-medium">{m.title}</div>
              <div className="text-sm text-gray-500">KES {m.amount}</div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestonesPanel;