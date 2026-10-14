import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaArrowLeft, FaComments, FaPlus, FaClock, FaDownload, FaExternalLinkAlt,
} from 'react-icons/fa';
import api from '../../api/axiosConfig';
import FundEscrowModal from './FundEscrowModal';
import DisputePanel from './DisputePanel';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((s) => s.auth.user);

  const [order, setOrder] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const [deliverable, setDeliverable] = useState({
    deliverable_url: '',
    deliverable_message: '',
    deliverable_file: null,
  });
  const [review, setReview] = useState({
    quality: 5, communication: 5, timeliness: 5, professionalism: 5, comment: '',
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get(`orders/${id}/`);
        if (!cancelled) setOrder(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.detail || 'Order not found.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    (async () => {
      try {
        const res = await api.get(`orders/${id}/milestones/`);
        if (!cancelled) setMilestones(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) setMilestones([]);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  // Auto-open Fund Escrow modal when ?fund=1 is present
  useEffect(() => {
    if (searchParams.get('fund') === '1' && order && !order.escrow_funded) {
      const timer = setTimeout(() => setShowFundModal(true), 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, order]);

  // Poll for status changes while the order is delivered and awaiting review
  useEffect(() => {
    if (!order) return;
    if (order.status === 'completed' || order.status === 'cancelled') return;
    const t = setInterval(async () => {
      try {
        const res = await api.get(`orders/${id}/`);
        setOrder(res.data);
      } catch { /* ignore */ }
    }, 10000);
    return () => clearInterval(t);
  }, [order, id]);

  const reload = async () => {
    try {
      const [o, m] = await Promise.all([
        api.get(`orders/${id}/`),
        api.get(`orders/${id}/milestones/`).catch(() => ({ data: [] })),
      ]);
      setOrder(o.data);
      setMilestones(Array.isArray(m.data) ? m.data : []);
    } catch { /* ignore */ }
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

  const handleOpenChat = async () => {
    setChatLoading(true);
    setError('');
    try {
      const res = await api.get(`orders/${id}/chat-room/`);
      navigate(`/chat/${res.data.chat_room_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not open chat.');
      setChatLoading(false);
    }
  };

  const handleSubmitDeliverable = () => {
    if (deliverable.deliverable_file) {
      const formData = new FormData();
      formData.append('deliverable_file', deliverable.deliverable_file);
      formData.append('deliverable_message', deliverable.deliverable_message || '');
      formData.append('deliverable_url', deliverable.deliverable_url || '');
      runAction('submit-work', formData);
    } else {
      runAction('submit-work', {
        deliverable_url: deliverable.deliverable_url,
        deliverable_message: deliverable.deliverable_message,
      });
    }
  };

  const handleApprove = () => {
    if (!window.confirm('Approve this work and release funds to the freelancer?')) return;
    runAction('approve-work');
  };

  const handleCancel = () => {
    const msg = order.escrow_funded
      ? 'Cancel this order? Escrow funds will be refunded to the client wallet.'
      : 'Cancel this order?';
    if (!window.confirm(msg)) return;
    runAction('cancel');
  };

  const handleAddMilestone = async () => {
    const title = window.prompt('Milestone title?');
    if (!title) return;
    const amount = window.prompt('Amount (USD)?');
    if (!amount) return;
    try {
      await api.post(`orders/${id}/milestones/`, { title, amount });
      await reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add milestone.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await api.post('reviews/', { order: parseInt(id), ...review });
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-red-600 mb-4">{error || 'Order not found.'}</p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-gold-600 text-white px-6 py-2 rounded-lg"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const isClient = user?.id === order.client?.id;
  const isFreelancer = user?.id === order.freelancer?.id;
  const hasDeliverable = Boolean(
    order.deliverable_url || order.deliverable_message || order.deliverable_file
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-500 hover:text-gold-600 mb-4"
      >
        <FaArrowLeft /> Back to Orders
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order #{order.id}
            </h1>
            <p className="text-gray-500 mt-1">
              {order.gig_title || order.project_title || 'Custom Order'}
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              order.status === 'completed'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                : order.status === 'disputed'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                : order.status === 'delivered'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
            }`}>
              {order.status}
            </span>

            <button
              onClick={handleOpenChat}
              disabled={chatLoading}
              className="flex items-center gap-2 bg-gold-600 text-white px-4 py-1.5 rounded-full hover:bg-gold-700 disabled:opacity-50 text-sm font-medium transition"
            >
              <FaComments size={12} />
              {chatLoading ? 'Opening…' : `Chat ${isClient ? 'Freelancer' : 'Client'}`}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Client:</span>{' '}
            <span className="font-medium">{order.client?.username}</span>
          </div>
          <div>
            <span className="text-gray-500">Freelancer:</span>{' '}
            <span className="font-medium">{order.freelancer?.username}</span>
          </div>
          <div>
            <span className="text-gray-500">Total:</span>{' '}
            <span className="font-medium">${order.total_amount}</span>
          </div>
          <div>
            <span className="text-gray-500">Escrow:</span>{' '}
            <span className={`font-medium ${
              order.escrow_funded ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {order.escrow_funded ? 'Funded' : 'Not funded'}
            </span>
          </div>
        </div>
      </div>

      {/* Deliverable — NEW: shows what the freelancer submitted */}
      {hasDeliverable && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-gold-500">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FaDownload className="text-gold-600" /> Work Delivered
          </h2>

          {order.deliverable_message && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-line">
              {order.deliverable_message}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {order.deliverable_file && (
              <a
                href={order.deliverable_file}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 text-sm font-semibold"
              >
                <FaDownload size={12} /> Download File
              </a>
            )}
            {order.deliverable_url && (
              <a
                href={order.deliverable_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-gold-600 text-gold-600 px-4 py-2 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/30 text-sm font-semibold"
              >
                <FaExternalLinkAlt size={12} /> Open Link
              </a>
            )}
          </div>

          {isClient && order.status === 'delivered' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Review the work above, then approve it to release escrow funds to the freelancer.
              </p>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg disabled:opacity-50 font-semibold"
              >
                Approve & Release Funds
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {isClient && !order.escrow_funded && (
            <button
              onClick={() => setShowFundModal(true)}
              className="bg-gold-600 hover:bg-gold-700 text-white px-5 py-2 rounded-lg font-semibold transition"
            >
              Fund Escrow
            </button>
          )}

          {isFreelancer && order.status === 'in_progress' && (
            <div className="w-full space-y-3">
              <input
                type="text"
                placeholder="Deliverable URL (optional if uploading a file)"
                value={deliverable.deliverable_url}
                onChange={(e) =>
                  setDeliverable((d) => ({ ...d, deliverable_url: e.target.value }))
                }
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              />
              <input
                type="file"
                onChange={(e) =>
                  setDeliverable((d) => ({
                    ...d, deliverable_file: e.target.files[0] || null,
                  }))
                }
                className="w-full text-sm"
              />
              <textarea
                placeholder="Message about the delivery"
                value={deliverable.deliverable_message}
                onChange={(e) =>
                  setDeliverable((d) => ({
                    ...d, deliverable_message: e.target.value,
                  }))
                }
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              />
              <button
                onClick={handleSubmitDeliverable}
                disabled={actionLoading}
                className="bg-gold-600 hover:bg-gold-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
              >
                Submit Work
              </button>
            </div>
          )}

          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {actionLoading ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Milestones */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FaClock className="text-gold-600" /> Milestones
          </h2>
          {(isClient || isFreelancer) && order.status !== 'completed' && (
            <button
              onClick={handleAddMilestone}
              className="text-sm text-gold-600 hover:underline flex items-center gap-1"
            >
              <FaPlus size={10} /> Add Milestone
            </button>
          )}
        </div>
        {milestones.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No milestones yet. Break the project into stages to track progress.
          </p>
        ) : (
          <div className="space-y-2">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800"
              >
                <div>
                  <p className="font-medium text-sm">{m.title}</p>
                  {m.description && (
                    <p className="text-xs text-gray-500">{m.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">${m.amount}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 capitalize">
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <DisputePanel order={order} onChanged={reload} />

      {order.status === 'completed' && !reviewSubmitted && !order.has_review && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Leave a Review</h2>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {['quality', 'communication', 'timeliness', 'professionalism'].map((field) => (
                <div key={field}>
                  <label className="block text-sm capitalize mb-1">{field}</label>
                  <select
                    value={review[field]}
                    onChange={(e) =>
                      setReview((r) => ({ ...r, [field]: Number(e.target.value) }))
                    }
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <textarea
              placeholder="Comment (optional)"
              value={review.comment}
              onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700"
            />
            <button
              type="submit"
              disabled={actionLoading}
              className="bg-gold-600 hover:bg-gold-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              Submit Review
            </button>
          </form>
        </div>
      )}

      {showFundModal && (
        <FundEscrowModal
          order={order}
          onClose={() => setShowFundModal(false)}
          onSuccess={async (msg) => {
            setShowFundModal(false);
            await reload();
            if (msg) window.alert(msg);
          }}
        />
      )}
    </div>
  );
};

export default OrderDetail;