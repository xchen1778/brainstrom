import { configureStore } from "@reduxjs/toolkit";
import dropdown from "./dropdown-slice";

export const store = configureStore({
  reducer: {
    dropdown,
  },
});
