import { createSlice } from "@reduxjs/toolkit";

export const signinModalSlice = createSlice({
  name: "signinModal",
  initialState: false,
  reducers: {
    setSigninModal: (state, action) => {
      return action.payload;
    },
  },
});

export const { setSigninModal } = signinModalSlice.actions;
export default signinModalSlice.reducer;
