import { createSlice } from '@reduxjs/toolkit';

const rulesSlice = createSlice({
  name: 'rules',
  initialState: {
    data: [],
  },
  reducers: {
    setRules: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setRules } = rulesSlice.actions;
export default rulesSlice.reducer;
