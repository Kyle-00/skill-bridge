import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axiosConfig';
import { setUnread, setUnreadMessages } from '../store/notificationSlice';

const POLL_MS = 10000;

const useNotificationPoll = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const [notifRes, chatRes] = await Promise.all([
          api.get('notifications/unread_count/'),
          api.get('chat/rooms/unread_count/'),
        ]);
        if (cancelled) return;
        dispatch(setUnread(notifRes.data.unread || 0));
        dispatch(setUnreadMessages(chatRes.data.unread || 0));
      } catch {
        // Network hiccup; next poll retries
      }
    };

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated, dispatch]);
};

export default useNotificationPoll;