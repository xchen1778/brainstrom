import { auth } from "../utils/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { errorModal } from "../functions/errorModal";
import { useSelector, useDispatch } from "react-redux";
import { setForgotModal } from "../store/forgotModal-slice";
import { setResetModal } from "../store/resetModal-slice";
import { setEmail } from "../store/email-slice";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Blackscreen from "./Blackscreen";
import EmailSent from "./EmailSent";
import styles from "../styles/Forgot.module.scss";
import { IoCloseCircle } from "react-icons/io5";

function ForgotPassword() {
  const email = useSelector((store) => store.email);
  const dispatch = useDispatch();
  const resetModal = useSelector((store) => store.resetModal);

  async function handleReset(e) {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      dispatch(setResetModal(true));
    } catch (error) {
      console.log(error.code);
      switch (error.code) {
        case "auth/invalid-email":
          errorModal("Please enter a valid email address.");
          break;
        case "auth/user-not-found":
          errorModal("We didn't find an account with this email address.");
          break;
      }
    }
  }

  return (
    <div className={styles.forgotModal}>
      <div
        className={styles.forgotClose}
        onClick={() => {
          dispatch(setForgotModal(false));
          dispatch(setEmail(""));
        }}
      >
        <IoCloseCircle />
      </div>
      {resetModal ? (
        <EmailSent />
      ) : (
        <div className={styles.forgotContent}>
          <h2 className={styles.forgotTitle}>Find your account</h2>
          <form className={styles.forgotForm} onSubmit={handleReset}>
            <div className={styles.forgotInput}>
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  dispatch(setEmail(e.target.value));
                }}
                id="forgotEmail"
              />
              <label htmlFor="forgotEmail">Email</label>
            </div>
            <button className={styles.forgotButton}>Search</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
