import { configureStore } from "@reduxjs/toolkit";
import dropdown from "./dropdown-slice";
import signupModal from "./signupModal-slice";
import signinModal from "./signinModal-slice";
import forgotModal from "./forgotModal-slice";
import resetModal from "./resetModal-slice";
import email from "./email-slice";
import verifyEmail from "./verifyEmail-slice";

export const store = configureStore({
  reducer: {
    dropdown,
    signupModal,
    signinModal,
    forgotModal,
    resetModal,
    email,
    verifyEmail,
  },
});
