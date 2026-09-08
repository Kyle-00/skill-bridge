import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import authReducer from './authSlice';
import themeReducer from './themeSlice';
import sidebarReducer from './sidebarSlice';
import notificationReducer from './notificationSlice';
import languageReducer from './languageSlice';

// Custom storage adapter using native localStorage
const storage = {
  getItem: (key) => {
    const value = localStorage.getItem(key);
    if (value === null) return Promise.resolve(null);
    try {
      return Promise.resolve(JSON.parse(value));
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota/security errors
    }
    return Promise.resolve();
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'theme', 'language'],
};

const rootReducer = {
  auth: persistReducer(persistConfig, authReducer),
  theme: themeReducer,
  sidebar: sidebarReducer,
  notifications: notificationReducer,
  language: languageReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);