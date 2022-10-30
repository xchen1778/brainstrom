import { useState } from "react";
import { useDispatch } from "react-redux";
import { setSignupModal } from "../store/signupModal-slice";
import { setSigninModal } from "../store/signinModal-slice";
import { setForgotModal } from "../store/forgotModal-slice";
import { setLoadingPage } from "../store/loadingPage-slice";
import { auth } from "../utils/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { debounce } from "../functions/debounce";
import { errorModal } from "../functions/errorModal";
import { useRouter } from "next/router";
import styles from "../styles/Signup.module.scss";
import { IoCloseCircle } from "react-icons/io5";
import { useAuthState } from "react-firebase-hooks/auth";

function SignUp({ isHomePage }) {
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const dispatch = useDispatch();
  const route = useRouter();
  const [user, loading] = useAuthState(auth);

  function closeAllModals() {
    dispatch(setSigninModal(false));
    dispatch(setSignupModal(false));
    dispatch(setForgotModal(false));
    window.localStorage.setItem("userId", user.uid);
  }

  async function register() {
    try {
      if (!registerName) {
        errorModal("Please enter your name.");
      } else {
        await createUserWithEmailAndPassword(
          auth,
          registerEmail,
          registerPassword
        );
        await updateProfile(auth.currentUser, {
          displayName: registerName,
          photoURL: "https://i.ibb.co/dbBcVSW/profile-picture.png",
        });
        closeAllModals();
      }
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-exists":
          errorModal("There is already an account with this email address.");
          break;
        case "auth/email-already-in-use":
          errorModal("There is already an account with this email address.");
          break;
        case "auth/invalid-email":
          errorModal("Please enter a valid email address.");
          break;
        case "auth/invalid-password":
          errorModal("Password entered does not meet the requirement.");
          break;
        case "auth/weak-password":
          errorModal("Password entered does not meet the requirement.");
          break;
        case "auth/internal-error":
          errorModal("Password entered does not meet the requirement.");
          break;
      }
    }
  }

  const debouncedRegister = debounce(register, 300);

  return (
    <div className={styles.signupModal}>
      <div
        className={styles.signupClose}
        onClick={() => {
          dispatch(setSignupModal(false));
        }}
      >
        <IoCloseCircle />
      </div>
      <div className={styles.signupContent}>
        <h2 className={styles.signupTitle}>Create your account</h2>
        <form
          className={styles.signupForm}
          onSubmit={(e) => {
            e.preventDefault();
            debouncedRegister();
          }}
        >
          <div className={styles.signupInput}>
            <input
              type="text"
              placeholder="Name"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              id="signupName"
            />
            <label htmlFor="signupName">Name</label>
          </div>
          <div className={styles.signupInput}>
            <input
              type="text"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              id="signupEmail"
            />
            <label htmlFor="signupEmail">Email</label>
          </div>
          <div className={styles.signupInput}>
            <input
              type="password"
              placeholder="Password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              id="signupPassword"
            />
            <label htmlFor="signupPassword">Password</label>
          </div>
          <p>*Password must be at least 6 characters.</p>
          <button>Sign up</button>
        </form>
        <p className={styles.signinText}>
          Already an account?&nbsp;
          <span
            onClick={() => {
              dispatch(setSignupModal(false));
              dispatch(setSigninModal(true));
            }}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
