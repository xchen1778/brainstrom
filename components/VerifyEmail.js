import { useState } from "react";
import { auth } from "../utils/firebase";
import { signInWithEmailLink } from "firebase/auth";
import { errorModal } from "../functions/errorModal";
import { useDispatch } from "react-redux";
import { setVerifyEmail } from "../store/verifyEmail-slice";
import { useRouter } from "next/router";
import styles from "../styles/Verifyemail.module.scss";
import { IoCloseCircle } from "react-icons/io5";

function VerifyEmail() {
  const dispatch = useDispatch();
  const route = useRouter();
  const [emailForVerify, setEmailForVerify] = useState("");

  async function handleVerify(e) {
    e.preventDefault();
    try {
      await signInWithEmailLink(auth, emailForVerify, window.location.href);
      window.localStorage.removeItem("emailForSignIn");
      route.push("/dashboard");
    } catch (error) {
      switch (error.code) {
        case "auth/missing-email":
          errorModal("Verification failed. You provided an incorrect email.");
          break;
        case "auth/invalid-action-code":
          errorModal("Verification failed. You provided an incorrect email.");
          break;
        case "auth/invalid-email":
          errorModal("Verification failed. You provided an incorrect email.");
          break;
      }
    }
  }

  return (
    <div className={styles.verifyModal}>
      <div
        className={styles.verifyClose}
        onClick={() => dispatch(setVerifyEmail(false))}
      >
        <IoCloseCircle />
      </div>
      <div className={styles.verifyContent}>
        <h2 className={styles.verifyTitle}>Let&apos;s verify your account</h2>
        <form className={styles.verifyForm} onSubmit={handleVerify}>
          <div className={styles.verifyInput}>
            <input
              type="text"
              placeholder="Email"
              value={emailForVerify}
              onChange={(e) => {
                setEmailForVerify(e.target.value);
              }}
              id="verifyEmail"
            />
            <label htmlFor="verifyEmail">Email</label>
          </div>
          <button className={styles.verifyButton}>Verify</button>
        </form>
      </div>
    </div>
  );
}

export default VerifyEmail;
