import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (roomId) => {
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    if (!roomId) return;
    ws.current = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };
    return () => ws.current.close();
  }, [roomId]);

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ message }));
    }
  };

  return { messages, sendMessage };
};