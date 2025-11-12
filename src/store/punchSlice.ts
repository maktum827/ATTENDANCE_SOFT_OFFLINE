import { createSlice } from '@reduxjs/toolkit';

const punchSlice = createSlice({
  name: 'punch',
  initialState: {
    latestPunch: null,
  },
  reducers: {
    setPunchData: (state, action) => {
      state.latestPunch = action.payload;
    },
    clearPunchData: (state) => {
      state.latestPunch = null;
    },
  },
});

export const { setPunchData, clearPunchData } = punchSlice.actions;
export default punchSlice.reducer;
