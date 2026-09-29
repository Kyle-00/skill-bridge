import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    unread: 0,
    unreadMessages: 0,
    list: [],
  },
  reducers: {
    setUnread: (state, action) => {
      state.unread = action.payload;
    },
    setUnreadMessages: (state, action) => {
      state.unreadMessages = action.payload;
    },
    setList: (state, action) => {
      state.list = action.payload;
    },
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      if (!action.payload.isRead) state.unread += 1;
    },
    markAllRead: (state) => {
      state.unread = 0;
      state.list = state.list.map((n) => ({ ...n, is_read: true }));
    },
  },
});

export const {
  setUnread,
  setUnreadMessages,
  setList,
  addNotification,
  markAllRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;