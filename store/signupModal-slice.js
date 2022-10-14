import { createSlice } from "@reduxjs/toolkit";

export const signupModalSlice = createSlice({
  name: "signupModal",
  initialState: false,
  reducers: {
    setSignupModal: (state, action) => {
      return action.payload;
    },
  },
});

export const { setSignupModal } = signupModalSlice.actions;
export default signupModalSlice.reducer;
