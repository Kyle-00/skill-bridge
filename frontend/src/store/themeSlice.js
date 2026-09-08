import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: 'light' }, 
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark');
    },
  },
});
export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;