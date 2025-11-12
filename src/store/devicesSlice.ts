import { createSlice } from '@reduxjs/toolkit';

const devicesSlice = createSlice({
  name: 'devices',
  initialState: {
    data: [],
  },
  reducers: {
    setDevices: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setDevices } = devicesSlice.actions;
export default devicesSlice.reducer;
