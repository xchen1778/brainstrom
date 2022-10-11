import { createSlice } from "@reduxjs/toolkit";

export const dropdownSlice = createSlice({
  name: "dropdown",
  initialState: false,
  reducers: {
    setDropdown: (state, action) => {
      return action.payload;
    },
  },
});

export const { setDropdown } = dropdownSlice.actions;
export default dropdownSlice.reducer;
