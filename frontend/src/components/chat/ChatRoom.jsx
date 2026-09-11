import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useState } from 'react';

const ChatRoom = () => {
  const { roomId } = useParams();
  const user = useSelector(state => state.auth.user);
  const { messages, sendMessage } = useWebSocket(roomId);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300 mb-4">
        Chat Room {roomId}
      </h2>
      <div className="glass p-4 rounded-2xl h-96 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 p-2 rounded ${msg.sender === user.username ? 'bg-gold-100 dark:bg-gold-900/50 ml-8' : 'bg-gray-100 dark:bg-gray-800 mr-8'}`}>
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80"
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};
export default ChatRoom;