import { createSlice } from "@reduxjs/toolkit";

export const forgotModalSlice = createSlice({
  name: "forgotModal",
  initialState: false,
  reducers: {
    setForgotModal: (state, action) => {
      return action.payload;
    },
  },
});

export const { setForgotModal } = forgotModalSlice.actions;
export default forgotModalSlice.reducer;
