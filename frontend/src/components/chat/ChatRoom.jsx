import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import api from '../../api/axiosConfig';
import useWebSocket from '../../hooks/useWebSocket';

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { liveMessages, sendMessage, connected } = useWebSocket(roomId);

  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    api.get(`chat/rooms/${roomId}/`)
      .then((res) => { if (!cancelled) setRoom(res.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [roomId]);

  useEffect(() => {
    let cancelled = false;

    api.get(`chat/messages/?room=${roomId}`)
      .then((res) => { if (!cancelled) setHistory(res.data || []); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [roomId]);

  // Merge history with live messages
  const allMessages = [
    ...history,
    ...liveMessages.filter((lm) => !history.some((h) => h.id === lm.id)),
  ];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [allMessages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const sent = sendMessage(text);
    if (!sent) {
      alert('Not connected. Please wait a moment and try again.');
      return;
    }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const other = room?.participants?.find((p) => p.id !== user?.id);
  const otherName =
    other?.display_name ||
    [other?.first_name, other?.last_name].filter(Boolean).join(' ') ||
    other?.username ||
    'Chat';
  const otherInitial = otherName[0]?.toUpperCase() || '?';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/messages')}
        className="flex items-center gap-2 text-sm text-gold-600 hover:underline mb-4"
      >
        <FaArrowLeft /> Back to Messages
      </button>

      <div className="glass rounded-3xl shadow-xl overflow-hidden flex flex-col h-[70vh]">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gold-200 dark:border-gold-800 bg-white/40 dark:bg-gray-900/40">
          <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold shrink-0">
            {otherInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
              {otherName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  connected ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              {connected ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 space-y-3 bg-gold-50/30 dark:bg-black/20"
        >
          {allMessages.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8">
              No messages yet. Say hello.
            </p>
          ) : (
            allMessages.map((msg, idx) => {
              const isMine =
                msg.sender === user?.id || msg.sender_id === user?.id;
              const senderName = msg.sender_name || '';
              const time = msg.created_at
                ? new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div
                  key={msg.id || `live-${idx}`}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      isMine
                        ? 'bg-gold-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {!isMine && senderName && (
                      <p className="text-xs font-semibold text-gold-600 dark:text-gold-400 mb-0.5">
                        {senderName}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-line break-words">
                      {msg.content || msg.message}
                    </p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isMine ? 'text-white/70' : 'text-gray-400'
                      }`}
                    >
                      {time}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-3 border-t border-gold-200 dark:border-gold-800 bg-white/40 dark:bg-gray-900/40">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-2xl border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 outline-none focus:ring-2 focus:ring-gold-400 resize-none max-h-32"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !connected}
              className={`p-3 rounded-full text-white transition shrink-0 ${
                input.trim() && connected
                  ? 'bg-gold-600 hover:bg-gold-700'
                  : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <FaPaperPlane size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;