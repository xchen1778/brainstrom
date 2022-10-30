import { createSlice } from "@reduxjs/toolkit";

export const scrollUpSlice = createSlice({
  name: "scrollUp",
  initialState: false,
  reducers: {
    setScrollUp: (state, action) => {
      return action.payload;
    },
  },
});

export const { setScrollUp } = scrollUpSlice.actions;
export default scrollUpSlice.reducer;
