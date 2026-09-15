import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaShoppingCart } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    let cancelled = false;
    api.get('orders/')
      .then((res) => { if (!cancelled) setOrders(res.data || []); })
      .catch(() => { if (!cancelled) setOrders([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const statusColor = (status) => ({
    pending: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    funded: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    disputed: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  }[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gold-700 dark:text-gold-300 mb-6">Orders</h1>

      {orders.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center text-gray-500 dark:text-gray-400">
          <FaShoppingCart className="text-5xl mx-auto mb-4 text-gold-300" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm mt-1">When you buy a gig or accept a proposal, orders appear here.</p>
          <Link to="/gigs" className="mt-4 inline-block bg-gold-600 text-white px-6 py-2 rounded-lg hover:bg-gold-700">
            Browse Gigs
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const isClient = user?.id === o.client?.id;
            return (
              <Link
                key={o.id}
                to={`/orders/${o.id}`}
                className="glass p-4 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 rounded-full uppercase">
                      {o.order_type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor(o.status)}`}>
                      {o.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {isClient ? 'You are the client' : 'You are the freelancer'}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-2 truncate">
                    {o.gig_title || o.project_title || `Order #${o.id}`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(o.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gold-600 dark:text-gold-400">
                    ${parseFloat(o.total_amount).toFixed(2)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;