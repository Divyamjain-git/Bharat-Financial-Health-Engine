import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import scoreReducer from './slices/scoreSlice';
import goalsReducer from './slices/goalsSlice';
import netWorthReducer from './slices/netWorthSlice';
import alertsReducer from './slices/alertsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    score: scoreReducer,
    goals: goalsReducer,
    netWorth: netWorthReducer,
    alerts: alertsReducer,
  },
});
