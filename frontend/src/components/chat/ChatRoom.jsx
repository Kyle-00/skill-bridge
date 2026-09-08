import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ChatRoom = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const ws = useRef(null);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };
    return () => ws.current.close();
  }, [roomId]);

  const sendMessage = () => {
    if (input.trim()) {
      ws.current.send(JSON.stringify({ message: input, sender: user.username }));
      setInput('');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300 mb-4">Chat Room {roomId}</h2>
      <div className="glass p-4 rounded-2xl h-96 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2 p-2 bg-gold-100 dark:bg-gold-900 rounded">
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} className="flex-1 p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white dark:bg-gray-800" placeholder="Type a message..." />
        <button onClick={sendMessage} className="bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700">Send</button>
      </div>
    </div>
  );
};
export default ChatRoom;