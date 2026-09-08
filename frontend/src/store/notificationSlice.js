import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { unread: 0, list: [] },
  reducers: {
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      if (!action.payload.isRead) state.unread += 1;
    },
    markAllRead: (state) => {
      state.unread = 0;
      state.list = state.list.map(n => ({ ...n, isRead: true }));
    },
  },
});
export const { addNotification, markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;