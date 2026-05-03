import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import reservationsReducer from '../features/reservations/reservationsSlice';
import tablesReducer from '../features/tables/tablesSlice';
import waitlistReducer from '../features/waitlist/waitlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    reservations: reservationsReducer,
    tables: tablesReducer,
    waitlist: waitlistReducer,
  },
});
