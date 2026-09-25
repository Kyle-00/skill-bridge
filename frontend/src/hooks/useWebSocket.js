import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setCredentials, logout } from '../store/authSlice';

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/';
const KEEPALIVE_MS = 25000;
const MAX_BACKOFF_MS = 30000;
const TOKEN_REFRESH_BUFFER_MS = 60000;

// Return true if the token is missing, malformed, or expires in less
// than TOKEN_REFRESH_BUFFER_MS. This lets us refresh before opening the socket.
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp * 1000 < Date.now() + TOKEN_REFRESH_BUFFER_MS;
  } catch {
    return true;
  }
};

export const useWebSocket = (roomId) => {
  const [liveMessages, setLiveMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const refresh = useSelector((state) => state.auth.refresh);
  const user = useSelector((state) => state.auth.user);

  // Refs hold the latest values without ever triggering a reconnect
  const tokenRef = useRef(token);
  const refreshRef = useRef(refresh);
  const userRef = useRef(user);

  const wsRef = useRef(null);
  const pingRef = useRef(null);
  const retryRef = useRef(null);
  const retryCountRef = useRef(0);
  const closedByUsRef = useRef(false);
  const isConnectingRef = useRef(false);
  const connectRef = useRef(null);

  // Keep refs in sync with Redux without re-running the connection effect
  useEffect(() => {
    tokenRef.current = token;
    refreshRef.current = refresh;
    userRef.current = user;
  }, [token, refresh, user]);

  const cleanupSocket = useCallback(() => {
    if (pingRef.current) {
      clearInterval(pingRef.current);
      pingRef.current = null;
    }
    const ws = wsRef.current;
    if (ws) {
      // Remove handlers first so onclose does not trigger a reconnect
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        try {
          ws.close();
        } catch {
          // Socket already dead
        }
      }
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!roomId) return;
    if (isConnectingRef.current) return;

    isConnectingRef.current = true;
    closedByUsRef.current = false;

    let authToken = tokenRef.current;

    // Refresh the token before connecting if it's expired or about to expire
    if (isTokenExpired(authToken)) {
      const refreshToken = refreshRef.current;

      if (!refreshToken) {
        isConnectingRef.current = false;
        return;
      }

      try {
        const res = await axios.post(
          `${API_BASE}accounts/token/refresh/`,
          { refresh: refreshToken }
        );
        authToken = res.data.access;

        dispatch(
          setCredentials({
            user: userRef.current,
            token: authToken,
            refresh: refreshToken,
          })
        );
      } catch {
        isConnectingRef.current = false;
        dispatch(logout());
        return;
      }
    }

    // If the component unmounted while we were refreshing, stop here
    if (closedByUsRef.current) {
      isConnectingRef.current = false;
      return;
    }

    const url = `${WS_BASE}chat/${roomId}/?token=${authToken}`;

    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      isConnectingRef.current = false;
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      isConnectingRef.current = false;
      retryCountRef.current = 0;
      setConnected(true);

      // Keepalive so intermediaries don't drop the idle socket
      if (pingRef.current) clearInterval(pingRef.current);
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ type: 'ping' }));
          } catch {
            // Ignore — onclose will handle reconnect
          }
        }
      }, KEEPALIVE_MS);
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      // Ignore server pong replies
      if (data.type === 'pong') return;

      setLiveMessages((prev) => {
        if (data.id && prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    };

    ws.onerror = () => {
      // onclose drives the reconnect
    };

    ws.onclose = () => {
      isConnectingRef.current = false;
      setConnected(false);

      if (pingRef.current) {
        clearInterval(pingRef.current);
        pingRef.current = null;
      }

      if (closedByUsRef.current) return;

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, capped at 30s
      const attempt = retryCountRef.current + 1;
      retryCountRef.current = attempt;
      const delay = Math.min(
        1000 * Math.pow(2, attempt - 1),
        MAX_BACKOFF_MS
      );

      retryRef.current = setTimeout(() => {
        if (connectRef.current) connectRef.current();
      }, delay);
    };
  }, [roomId, dispatch]);

  // Store the latest connect function in a ref so onclose can call it
  // without a direct self-reference
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // Start the connection when the room changes
  useEffect(() => {
    if (!roomId || !token) return;

    connect();

    return () => {
      closedByUsRef.current = true;
      if (retryRef.current) {
        clearTimeout(retryRef.current);
        retryRef.current = null;
      }
      cleanupSocket();
      setConnected(false);
    };
    // Only reconnect when the room changes. Token changes are handled
    // inside connect() via tokenRef, so we don't need to depend on it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const sendMessage = useCallback((message) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ message }));
      return true;
    }
    return false;
  }, []);

  return { liveMessages, sendMessage, connected };
};

export default useWebSocket;