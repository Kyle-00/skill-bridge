import { useSelector } from 'react-redux';

const Notifications = () => {
  const notifications = useSelector((state) => state.notifications?.list || []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gold-700 dark:text-gold-300 mb-6">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="glass p-8 rounded-2xl text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">No notifications yet</p>
          <p className="text-sm mt-2">We'll notify you when something important happens.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, i) => (
            <div key={i} className="glass p-4 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300">{notif.message || 'You have a new notification'}</p>
              <span className="text-xs text-gray-500 dark:text-gray-400">{notif.created_at || 'Just now'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Notifications;