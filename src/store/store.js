import { configureStore } from '@reduxjs/toolkit';
import { othersApi } from '../actions/othersApi';
import { onlineApi } from '../actions/onlineApi';
import { zkTecoApi } from '../actions/zkTecoApi';
import punchReducer from './punchSlice';
import studentsReducer from './studentsSlice';
import staffReducer from './staffSlice';
import rulesReducer from './rulesSlice';
import deviceReducer from './devicesSlice';

export const store = configureStore({
  reducer: {
    punch: punchReducer, // ⬅️ Add it here
    [othersApi.reducerPath]: othersApi.reducer,
    [onlineApi.reducerPath]: onlineApi.reducer,
    [zkTecoApi.reducerPath]: zkTecoApi.reducer,
    students: studentsReducer,
    staffs: staffReducer,
    rules: rulesReducer,
    devices: deviceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      othersApi.middleware,
      onlineApi.middleware,
      zkTecoApi.middleware,
    ),
  devTools: process.env.NODE_ENV !== 'production',
});
