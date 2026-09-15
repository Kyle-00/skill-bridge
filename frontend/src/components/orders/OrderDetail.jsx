import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaArrowLeft, FaComments, FaCheckCircle, FaStar,
  FaLock, FaHourglassHalf,
} from 'react-icons/fa';
import api from '../../api/axiosConfig';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [deliverable, setDeliverable] = useState({
    deliverable_url: '',
    deliverable_message: '',
  });

  const [review, setReview] = useState({
    quality: 5,
    communication: 5,
    timeliness: 5,
    professionalism: 5,
    comment: '',
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api.get(`orders/${id}/`)
      .then((res) => { if (!cancelled) setOrder(res.data); })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.detail || 'Order not found.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  const reload = async () => {
    const res = await api.get(`orders/${id}/`);
    setOrder(res.data);
  };

  const runAction = async (url, body) => {
    setActionLoading(true);
    setError('');
    try {
      await api.post(`orders/${id}/${url}/`, body || {});
      await reload();
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || data?.detail || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkFunded = () => runAction('mark-funded');
  const handleSubmitDeliverable = () => runAction('submit-work', deliverable);
  const handleApprove = () => {
    if (!window.confirm('Approve this work and release funds to the freelancer?')) return;
    runAction('approve-work');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await api.post('reviews/', {
        order: parseInt(id),
        quality: review.quality,
        communication: review.communication,
        timeliness: review.timeliness,
        professionalism: review.professionalism,
        comment: review.comment,
      });
      setReviewSubmitted(true);
      await reload();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit review.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">
          {error || 'Order not found.'}
        </p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-gold-600 text-white px-6 py-2 rounded-lg hover:bg-gold-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const isClient = user?.id === order.client?.id;
  const isFreelancer = user?.id === order.freelancer?.id;

  const statusColor = {
    pending: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    funded: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    delivered: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    disputed: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  }[order.status];

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-sm text-gold-600 hover:underline mb-4"
      >
        <FaArrowLeft /> Back to Orders
      </button>

      <div className="glass p-6 rounded-2xl shadow-lg mb-6">
        <div className="flex justify-between items-start gap-3 flex-wrap">
          <div>
            <span className="text-xs px-2 py-0.5 bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 rounded-full uppercase">
              {order.order_type}
            </span>
            <h1 className="text-2xl font-bold text-gold-700 dark:text-gold-300 mt-2">
              {order.gig_title || order.project_title || `Order #${order.id}`}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Order #{order.id}
            </p>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full capitalize ${statusColor}`}
          >
            {order.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
              Client
            </p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              {order.client?.username}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
              Freelancer
            </p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              {order.freelancer?.username}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
              Total
            </p>
            <p className="font-bold text-gold-600 dark:text-gold-400">
              ${parseFloat(order.total_amount).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
              Platform Fee
            </p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              ${parseFloat(order.platform_fee).toFixed(2)}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="glass p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-lg font-semibold text-gold-700 dark:text-gold-300 mb-4">
          Actions
        </h2>
        <div className="space-y-3">
          {order.chat_room_id && (
            <Link
              to={`/chat/${order.chat_room_id}`}
              className="flex items-center gap-2 p-3 rounded-lg border border-gold-200 dark:border-gold-700 hover:bg-gold-50 dark:hover:bg-gold-900/20 transition"
            >
              <FaComments className="text-gold-600" />
              <span className="text-sm font-medium">Open Chat</span>
            </Link>
          )}

          {isClient && !order.escrow_funded && order.status !== 'cancelled' && (
            <button
              onClick={handleMarkFunded}
              disabled={actionLoading}
              className={`w-full flex items-center gap-2 justify-center p-3 rounded-lg text-white font-semibold transition ${
                actionLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gold-600 hover:bg-gold-700'
              }`}
            >
              <FaLock size={12} />
              {actionLoading ? 'Processing...' : 'Fund Escrow'}
            </button>
          )}

          {isClient && order.escrow_funded && order.status === 'delivered' && (
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className={`w-full flex items-center gap-2 justify-center p-3 rounded-lg text-white font-semibold transition ${
                actionLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <FaCheckCircle size={12} />
              {actionLoading ? 'Processing...' : 'Approve and Release Payment'}
            </button>
          )}
        </div>
      </div>

      {(order.status === 'delivered' || order.status === 'completed') && (
        <div className="glass p-6 rounded-2xl shadow-lg mb-6">
          <h2 className="text-lg font-semibold text-gold-700 dark:text-gold-300 mb-4">
            Deliverable
          </h2>
          {order.deliverable_url && (
            <a
              href={order.deliverable_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-600 underline break-all block mb-3"
            >
              {order.deliverable_url}
            </a>
          )}
          {order.deliverable_message && (
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {order.deliverable_message}
            </p>
          )}
        </div>
      )}

      {isFreelancer && order.status === 'in_progress' && (
        <div className="glass p-6 rounded-2xl shadow-lg mb-6">
          <h2 className="text-lg font-semibold text-gold-700 dark:text-gold-300 mb-4">
            Submit Your Work
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deliverable URL
              </label>
              <input
                type="url"
                value={deliverable.deliverable_url}
                onChange={(e) =>
                  setDeliverable({ ...deliverable, deliverable_url: e.target.value })
                }
                placeholder="https://drive.google.com/..."
                className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message to the client
              </label>
              <textarea
                value={deliverable.deliverable_message}
                onChange={(e) =>
                  setDeliverable({
                    ...deliverable,
                    deliverable_message: e.target.value,
                  })
                }
                rows="3"
                placeholder="Describe what you delivered..."
                className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <button
              onClick={handleSubmitDeliverable}
              disabled={actionLoading}
              className={`w-full flex items-center gap-2 justify-center p-3 rounded-lg text-white font-semibold transition ${
                actionLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <FaHourglassHalf size={12} />
              {actionLoading ? 'Submitting...' : 'Submit Deliverable'}
            </button>
          </div>
        </div>
      )}

      {order.status === 'completed' && !order.has_review && !reviewSubmitted && (
        <div className="glass p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-gold-700 dark:text-gold-300 mb-4">
            Leave a Review
          </h2>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {[
              { key: 'quality', label: 'Quality of Work' },
              { key: 'communication', label: 'Communication' },
              { key: 'timeliness', label: 'Timeliness' },
              { key: 'professionalism', label: 'Professionalism' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setReview({ ...review, [field.key]: n })
                      }
                      className="text-2xl transition"
                      aria-label={`${n} stars`}
                    >
                      <FaStar
                        className={
                          n <= review[field.key]
                            ? 'text-gold-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <textarea
              value={review.comment}
              onChange={(e) =>
                setReview({ ...review, comment: e.target.value })
              }
              placeholder="Share your experience working with this person..."
              rows="3"
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 outline-none focus:ring-2 focus:ring-gold-400"
            />
            <button
              type="submit"
              disabled={actionLoading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                actionLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gold-600 hover:bg-gold-700'
              }`}
            >
              {actionLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {(order.has_review || reviewSubmitted) && (
        <div className="glass p-6 rounded-2xl shadow-lg text-center text-green-700 dark:text-green-300">
          <FaCheckCircle className="inline mr-2" /> Review submitted. Thank you.
        </div>
      )}
    </div>
  );
};

export default OrderDetail;