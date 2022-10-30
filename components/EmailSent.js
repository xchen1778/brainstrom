import { useDispatch } from "react-redux";
import { setSigninModal } from "../store/signinModal-slice";
import { setEmail } from "../store/email-slice";
import { setResetModal } from "../store/resetModal-slice";
import { setForgotModal } from "../store/forgotModal-slice";
import styles from "../styles/Emailsent.module.scss";

function EmailSent({ setEmailLinkSent }) {
  const dispatch = useDispatch();

  return (
    <div className={styles.emailSentContent}>
      <h2 className={styles.emailSentTitle}>An email has been sent to you.</h2>
      <p className={styles.emailSentText}>
        Sometimes it might be in your spam folder.
      </p>
      <button
        className={styles.emailSentButton}
        onClick={() => {
          dispatch(setSigninModal(false));
          dispatch(setForgotModal(false));
          dispatch(setEmail(""));
          setTimeout(() => {
            setEmailLinkSent && setEmailLinkSent(false);
            dispatch(setResetModal(false));
          }, 1000);
        }}
      >
        Done
      </button>
    </div>
  );
}

export default EmailSent;
