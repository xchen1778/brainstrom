import { createSlice } from "@reduxjs/toolkit";

export const loadingPageSlice = createSlice({
  name: "loadingPage",
  initialState: false,
  reducers: {
    setLoadingPage: (state, action) => {
      return action.payload;
    },
  },
});

export const { setLoadingPage } = loadingPageSlice.actions;
export default loadingPageSlice.reducer;
