import { useDispatch } from "react-redux";
import { setSignupModal } from "../store/signupModal-slice";
import { setSigninModal } from "../store/signinModal-slice";
import { setForgotModal } from "../store/forgotModal-slice";
import { setResetModal } from "../store/resetModal-slice";
import { setEmail } from "../store/email-slice";
import { setVerifyEmail } from "../store/verifyEmail-slice";
import styles from "../styles/Blackscreen.module.scss";

function Blackscreen() {
  const dispatch = useDispatch();

  return (
    <div
      className={styles.blackscreen}
      onClick={() => {
        // dispatch(setSignupModal(false));
        // dispatch(setSigninModal(false));
        // dispatch(setForgotModal(false));
        // dispatch(setResetModal(false));
        // dispatch(setVerifyEmail(false));
        // dispatch(setEmail(""));
      }}
    ></div>
  );
}

export default Blackscreen;
