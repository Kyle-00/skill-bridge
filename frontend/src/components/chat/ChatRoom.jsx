import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const POLL_INTERVAL_MS = 3000;

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const lastIdRef = useRef(0);
  const pollRef = useRef(null);
  const scrollRef = useRef(null);

  // Load room info
  useEffect(() => {
    let cancelled = false;
    api.get(`chat/rooms/${roomId}/`)
      .then((res) => { if (!cancelled) setRoom(res.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [roomId]);

  // Poll for new messages
  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    const fetchMessages = async () => {
      try {
        const url = lastIdRef.current
          ? `chat/messages/?room=${roomId}&since=${lastIdRef.current}`
          : `chat/messages/?room=${roomId}`;

        const res = await api.get(url);
        const incoming = Array.isArray(res.data) ? res.data : [];

        if (!cancelled && incoming.length > 0) {
          lastIdRef.current = incoming[incoming.length - 1].id;
          setMessages((prev) => {
            const existing = new Set(prev.map((m) => m.id));
            const fresh = incoming.filter((m) => !existing.has(m.id));
            return [...prev, ...fresh];
          });
        }
      } catch {
        // Network hiccup; next tick retries
      }
    };

    fetchMessages();
    pollRef.current = setInterval(fetchMessages, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [roomId]);

  // Mark the room as read when opening or receiving new messages
  useEffect(() => {
    if (!roomId) return;
    api.post(`chat/rooms/${roomId}/mark_read/`).catch(() => {});
  }, [roomId, messages.length]);

  // Auto-scroll to newest
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setError('');

    try {
      const res = await api.post('chat/messages/', {
        room: parseInt(roomId, 10),
        content,
      });

      setMessages((prev) => [...prev, res.data]);
      lastIdRef.current = res.data.id;
      setInput('');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.content?.[0] || data?.detail || 'Failed to send message.');
    } finally {
      setSending(false);
    }
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
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Live &middot; refreshes every 3s
            </p>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 space-y-3 bg-gold-50/30 dark:bg-black/20"
        >
          {messages.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8">
              No messages yet. Say hello.
            </p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender === user?.id;
              const time = msg.created_at
                ? new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      isMine
                        ? 'bg-gold-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {!isMine && msg.sender_name && (
                      <p className="text-xs font-semibold text-gold-600 dark:text-gold-400 mb-0.5">
                        {msg.sender_name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-line break-words">
                      {msg.content}
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

        {error && (
          <p className="px-4 py-2 text-sm text-red-600">{error}</p>
        )}

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
              disabled={!input.trim() || sending}
              className={`p-3 rounded-full text-white transition shrink-0 ${
                input.trim() && !sending
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