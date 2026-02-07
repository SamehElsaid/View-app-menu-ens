import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';
import authReducer from './authSlice/authSlice';
import menuReducer from './authMenu/authMenu';
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    menu: menuReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

