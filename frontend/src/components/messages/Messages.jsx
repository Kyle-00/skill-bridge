import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaComment } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const Messages = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    let cancelled = false;

    api.get('chat/rooms/')
      .then((res) => { if (!cancelled) setRooms(res.data || []); })
      .catch(() => { if (!cancelled) setRooms([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gold-700 dark:text-gold-300">
          Messages
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Conversations with clients and freelancers.
        </p>
      </div>

      <div className="glass p-4 rounded-2xl shadow-lg">
        {rooms.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FaComment className="text-5xl mx-auto mb-4 text-gold-300" />
            <p className="text-lg font-medium">No conversations yet</p>
            <p className="text-sm mt-1">Start one from a gig or project.</p>
          </div>
        ) : (
          <div className="divide-y divide-gold-100 dark:divide-gold-800/30">
            {rooms.map((room) => {
              const other = room.participants?.find((p) => p.id !== user?.id);
              const otherName =
                other?.display_name ||
                [other?.first_name, other?.last_name].filter(Boolean).join(' ') ||
                other?.username ||
                'Chat';
              const initial = otherName[0]?.toUpperCase() || '?';
              const preview =
                room.last_message?.content?.slice(0, 60) || 'No messages yet';

              return (
                <Link
                  key={room.id}
                  to={`/chat/${room.id}`}
                  className="flex items-center gap-4 py-4 hover:bg-gold-50/50 dark:hover:bg-gold-900/20 rounded-lg px-3 transition"
                >
                  <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {otherName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {preview}
                    </p>
                  </div>
                  <span className="text-xs text-gold-600 shrink-0">View</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;