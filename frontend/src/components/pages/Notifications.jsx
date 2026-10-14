import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBell, FaCheckCircle, FaCircle, FaTruck, FaComments,
  FaShoppingCart, FaCheckDouble, FaCrown,
} from 'react-icons/fa';
import api from '../../api/axiosConfig';

const ICONS = {
  order_created: FaShoppingCart,
  order_cancelled: FaShoppingCart,
  order_disputed: FaShoppingCart,
  escrow_funded: FaCheckCircle,
  work_delivered: FaTruck,
  work_approved: FaCheckCircle,
  proposal_accepted: FaCheckCircle,
  new_message: FaComments,
  subscription_activated: FaCrown,
  deposit_received: FaCheckCircle,
  withdrawal_made: FaCheckCircle,
  transfer_sent: FaCheckCircle,
  transfer_received: FaCheckCircle,
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | unread

  // Fetch whenever the filter changes.
  // All setState calls happen inside async callbacks so no
  // "setState synchronously within an effect" warning fires.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const params = filter === 'unread' ? { is_read: 'false' } : {};
        const res = await api.get('notifications/', { params });
        if (cancelled) return;
        const data = res.data?.results || res.data;
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail || 'Failed to load notifications.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filter]);

  // When switching filters, show the loading spinner again.
  // Deferred via setTimeout so it never runs synchronously in the effect body.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(true), 0);
    return () => clearTimeout(timer);
  }, [filter]);

  const handleClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await api.post(`notifications/${notif.id}/mark_read/`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      } catch {
        /* ignore */
      }
    }
    if (notif.target) {
      navigate(notif.target);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('notifications/mark_all_read/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark all as read.');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gold-700 dark:text-gold-300 flex items-center gap-3">
            <FaBell className="text-gold-600" /> Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : 'You are all caught up.'}
          </p>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          {/* Filter tabs */}
          <div className="glass p-1 rounded-xl inline-flex">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-gold-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gold-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === 'unread'
                  ? 'bg-gold-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gold-600'
              }`}
            >
              Unread
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 text-sm font-medium text-gold-600 hover:text-gold-700 border border-gold-300 dark:border-gold-700 px-3 py-1.5 rounded-full hover:bg-gold-50 dark:hover:bg-gold-900/30 transition"
            >
              <FaCheckDouble size={12} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass p-10 rounded-2xl text-center text-gray-500 dark:text-gray-400">
          <FaBell className="text-4xl text-gold-300 dark:text-gold-800 mx-auto mb-3" />
          <p className="text-lg font-semibold">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="text-sm mt-2">
            We will notify you when something important happens.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = ICONS[notif.verb] || FaBell;
            const time = notif.created_at
              ? new Date(notif.created_at).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full text-left glass p-4 rounded-xl flex items-start gap-4 hover:shadow-lg transition ${
                  !notif.is_read ? 'border-l-4 border-gold-500' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    !notif.is_read
                      ? 'bg-gold-100 dark:bg-gold-900/40 text-gold-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}
                >
                  <Icon size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm ${
                        !notif.is_read
                          ? 'font-semibold text-gray-800 dark:text-gray-100'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {notif.message || 'You have a new notification'}
                    </p>
                    {!notif.is_read && (
                      <FaCircle
                        className="text-gold-500 shrink-0 mt-1"
                        size={8}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {notif.actor_name && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        from {notif.actor_name}
                      </span>
                    )}
                    {time && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {time}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;