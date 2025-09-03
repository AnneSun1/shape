import { configureStore } from '@reduxjs/toolkit';
import messageReducer from './messageSlice';
import chatReducer from './chatSlice';
import authReducer from './authSlice';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

export const store = configureStore({
  reducer: {
    message: messageReducer,
    chat: chatReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Debug: Log the store state
console.log('Store created with reducers:', Object.keys(store.getState()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();

// You can also create a typed useSelector hook:
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
