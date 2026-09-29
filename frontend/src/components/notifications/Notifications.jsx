import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaBell, FaCheckDouble } from 'react-icons/fa';
import api from '../../api/axiosConfig';
import { markAllRead as markAllReadLocal } from '../../store/notificationSlice';

const formatTime = (ts) => {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return '';
  }
};

const Notifications = () => {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchNotifications = async () => {
      try {
        const res = await api.get('notifications/');
        if (!cancelled) setItems(res.data || []);
      } catch (err) {
        console.warn('Failed to load notifications:', err);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNotifications();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('notifications/mark_all_read/');
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      dispatch(markAllReadLocal());
    } catch (err) {
      console.warn('Failed to mark all read:', err);
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
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gold-700 dark:text-gold-300">
          Notifications
        </h1>
        {items.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm text-gold-600 hover:underline"
          >
            <FaCheckDouble size={14} /> Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center text-gray-500 dark:text-gray-400">
          <FaBell className="text-5xl mx-auto mb-4 text-gold-300" />
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm mt-1">
            We'll notify you when something important happens.
          </p>
        </div>
      ) : (
        <div className="glass p-4 rounded-2xl shadow-lg divide-y divide-gold-100 dark:divide-gold-800/30">
          {items.map((n) => {
            const Wrapper = n.target ? Link : 'div';
            const wrapperProps = n.target ? { to: n.target } : {};
            return (
              <Wrapper
                key={n.id}
                {...wrapperProps}
                className={`flex items-start gap-3 py-4 px-3 rounded-lg transition ${
                  n.target ? 'hover:bg-gold-50/50 dark:hover:bg-gold-900/20' : ''
                } ${!n.is_read ? 'bg-gold-50/30 dark:bg-gold-950/20' : ''}`}
              >
                <div
                  className={`p-2 rounded-full shrink-0 ${
                    !n.is_read
                      ? 'bg-gold-100 dark:bg-gold-900/40 text-gold-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}
                >
                  <FaBell size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      !n.is_read
                        ? 'font-semibold text-gray-800 dark:text-gray-200'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {n.message || n.verb}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatTime(n.created_at)}
                  </p>
                </div>
                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-gold-500 shrink-0 mt-2" />
                )}
              </Wrapper>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;