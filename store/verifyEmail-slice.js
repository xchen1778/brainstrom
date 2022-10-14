import { createSlice } from "@reduxjs/toolkit";

export const verifyEmailSlice = createSlice({
  name: "verifyEmail",
  initialState: false,
  reducers: {
    setVerifyEmail: (state, action) => {
      return action.payload;
    },
  },
});

export const { setVerifyEmail } = verifyEmailSlice.actions;
export default verifyEmailSlice.reducer;
