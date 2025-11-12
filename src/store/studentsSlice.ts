import { createSlice } from '@reduxjs/toolkit';

const studentsSlice = createSlice({
  name: 'students',
  initialState: {
    data: [],
  },
  reducers: {
    setStudents: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setStudents } = studentsSlice.actions;
export default studentsSlice.reducer;
