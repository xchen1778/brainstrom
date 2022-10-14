import { createSlice } from "@reduxjs/toolkit";

export const resetModalSlice = createSlice({
  name: "resetModal",
  initialState: false,
  reducers: {
    setResetModal: (state, action) => {
      return action.payload;
    },
  },
});

export const { setResetModal } = resetModalSlice.actions;
export default resetModalSlice.reducer;
