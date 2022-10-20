import { useRouter } from "next/router";
import { auth } from "../utils/firebase";
import { useDispatch } from "react-redux";
import { setSignupModal } from "../store/signupModal-slice";
import { setSigninModal } from "../store/signinModal-slice";
import { setForgotModal } from "../store/forgotModal-slice";
import { setResetModal } from "../store/resetModal-slice";
import { setEmail } from "../store/email-slice";
import { setVerifyEmail } from "../store/verifyEmail-slice";

function Dropdown() {
  const dispatch = useDispatch();
  const route = useRouter();
  return (
    <div className="flex flex-col">
      <button
        onClick={() => {
          route.push("/profile");
        }}
      >
        Profile
      </button>
      <button
        onClick={() => {
          auth.signOut();
          window.localStorage.removeItem("userId");
          dispatch(setSignupModal(false));
          dispatch(setSigninModal(false));
          dispatch(setForgotModal(false));
          dispatch(setResetModal(false));
          dispatch(setVerifyEmail(false));
          dispatch(setEmail(""));
          route.push("/");
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

export default Dropdown;
