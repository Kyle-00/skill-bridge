import { createSlice } from '@reduxjs/toolkit';

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: { isOpen: false },
  reducers: {
    toggleSidebar: (state) => { state.isOpen = !state.isOpen; },
    closeSidebar: (state) => { state.isOpen = false; },
  },
});
export const { toggleSidebar, closeSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;