import { createSlice } from '@reduxjs/toolkit';

const staffSlice = createSlice({
  name: 'staff',
  initialState: {
    data: [],
  },
  reducers: {
    setStaff: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setStaff } = staffSlice.actions;
export default staffSlice.reducer;
