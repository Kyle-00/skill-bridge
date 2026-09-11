import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { FaComment, FaPlus } from 'react-icons/fa';

const Messages = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('chat/rooms/');
        setRooms(Array.isArray(res.data) ? res.data : []);
      } catch {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gold-700 dark:text-gold-300">Messages</h1>
        <Link
          to="/find-work"
          className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition flex items-center gap-2 text-sm"
        >
          <FaPlus size={12} /> New Chat
        </Link>
      </div>

      <div className="glass p-4 rounded-2xl shadow-lg">
        {rooms.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FaComment className="text-5xl mx-auto mb-4 text-gold-300" />
            <p className="text-base sm:text-lg font-medium">No conversations yet</p>
            <p className="text-sm mt-1">Start a conversation by contacting a freelancer or client.</p>
            <Link
              to="/find-work"
              className="mt-4 inline-block bg-gold-600 text-white px-6 py-2 rounded-lg hover:bg-gold-700 transition text-sm"
            >
              Find someone to chat with
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gold-100 dark:divide-gold-800/30">
            {rooms.map((room) => (
              <Link
                key={room.id}
                to={`/chat/${room.id}`}
                className="flex items-center gap-4 py-4 hover:bg-gold-50/50 dark:hover:bg-gold-900/20 rounded-lg px-3 transition"
              >
                <div className="w-12 h-12 rounded-full bg-gold-100 dark:bg-gold-900/50 flex items-center justify-center text-gold-600 text-xl shrink-0">
                  <FaComment />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">
                    Chat Room #{room.id}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {room.participants?.length || 0} participants
                  </p>
                </div>
                <span className="text-xs text-gold-600 shrink-0">View →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;