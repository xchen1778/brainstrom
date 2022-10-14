import { useDispatch } from "react-redux";
import { setSignupModal } from "../store/signupModal-slice";
import { setSigninModal } from "../store/signinModal-slice";
import { setForgotModal } from "../store/forgotModal-slice";
import { setResetModal } from "../store/resetModal-slice";
import { setEmail } from "../store/email-slice";
import { setVerifyEmail } from "../store/verifyEmail-slice";

function Blackscreen() {
  const dispatch = useDispatch();

  return (
    <div
      className="w-screen h-screen bg-slate-700 absolute top-0 left-0"
      onClick={() => {
        dispatch(setSignupModal(false));
        dispatch(setSigninModal(false));
        dispatch(setForgotModal(false));
        dispatch(setResetModal(false));
        dispatch(setVerifyEmail(false));
        dispatch(setEmail(""));
      }}
    ></div>
  );
}

export default Blackscreen;
