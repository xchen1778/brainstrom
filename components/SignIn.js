import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSignupModal } from "../store/signupModal-slice";
import { setSigninModal } from "../store/signinModal-slice";
import { setForgotModal } from "../store/forgotModal-slice";
import { setEmail } from "../store/email-slice";
import { setLoadingPage } from "../store/loadingPage-slice";
import { auth } from "../utils/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  sendSignInLinkToEmail,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { debounce } from "../functions/debounce";
import { errorModal } from "../functions/errorModal";
import { useRouter } from "next/router";
import styles from "../styles/Signin.module.scss";
import { IoCloseCircle } from "react-icons/io5";
import { FaGoogle, FaFacebookF, FaTwitter, FaGithub } from "react-icons/fa";
import EmailSent from "./EmailSent";
import { useAuthState } from "react-firebase-hooks/auth";

function SignIn({ isHomePage }) {
  const email = useSelector((store) => store.email);
  const [password, setPassword] = useState("");
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [passwordPage, setPasswordPage] = useState(false);
  const dispatch = useDispatch();
  const route = useRouter();
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  const twitterProvider = new TwitterAuthProvider();
  const githubProvider = new GithubAuthProvider();
  const [user, loading] = useAuthState(auth);

  function closeAllModals() {
    dispatch(setSigninModal(false));
    dispatch(setSignupModal(false));
    dispatch(setForgotModal(false));
    window.localStorage.setItem("userId", user.uid);
  }

  async function login() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      isHomePage && dispatch(setLoadingPage(true));
      closeAllModals();
      isHomePage && route.push("/dashboard");
    } catch (error) {
      switch (error.code) {
        case "auth/internal-error":
          errorModal("Wrong password. Please try again.");
          break;
        case "auth/wrong-password":
          errorModal("Wrong password. Please try again.");
          break;
      }
    }
  }

  async function loginWithPassword() {
    try {
      const userWithEmail = await fetchSignInMethodsForEmail(auth, email);
      if (!userWithEmail.length) {
        errorModal("We didn't find an account with this email address.");
      } else {
        setPasswordPage(true);
      }
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-email":
          errorModal("Please enter a valid email address.");
          break;
      }
    }
  }

  async function loginWithEmail() {
    try {
      const userWithEmail = await fetchSignInMethodsForEmail(auth, email);
      if (!userWithEmail.length) {
        errorModal("We didn't find an account with this email address.");
      } else {
        await sendSignInLinkToEmail(auth, email, {
          url: "https://brainstorm-5dbab.web.app/",
          handleCodeInApp: true,
        });
        window.localStorage.setItem("emailForSignIn", email);
        setEmailLinkSent(true);
      }
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-email":
          errorModal("Please enter a valid email address.");
          break;
      }
    }
  }

  async function googleLogin() {
    try {
      await signInWithPopup(auth, googleProvider);
      isHomePage && dispatch(setLoadingPage(true));
      closeAllModals();
      isHomePage && route.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  async function facebookLogin() {
    try {
      await signInWithPopup(auth, facebookProvider);
      isHomePage && dispatch(setLoadingPage(true));
      closeAllModals();
      isHomePage && route.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  async function twitterLogin() {
    try {
      await signInWithPopup(auth, twitterProvider);
      isHomePage && dispatch(setLoadingPage(true));
      closeAllModals();
      isHomePage && route.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  async function githubLogin() {
    try {
      await signInWithPopup(auth, githubProvider);
      isHomePage && dispatch(setLoadingPage(true));
      closeAllModals();
      isHomePage && route.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  const debouncedLoginWithPassword = debounce(loginWithPassword, 300);
  const debouncedLoginWithEmail = debounce(loginWithEmail, 300);
  const debouncedGoogleLogin = debounce(googleLogin, 300);
  const debouncedFacebookLogin = debounce(facebookLogin, 300);
  const debouncedTwitterLogin = debounce(twitterLogin, 300);
  const debouncedGithubLogin = debounce(githubLogin, 300);
  const debouncedLogin = debounce(login, 300);

  const loginContent = (
    <div className={styles.signinContent}>
      <h2 className={styles.signinTitle}>Sign in to Brainstorm</h2>
      <div className={styles.signinButtons}>
        <button onClick={debouncedGoogleLogin}>
          <FaGoogle />
        </button>
        <button onClick={debouncedFacebookLogin}>
          <FaFacebookF />
        </button>
        <button onClick={debouncedTwitterLogin}>
          <FaTwitter />
        </button>
        <button onClick={debouncedGithubLogin}>
          <FaGithub />
        </button>
      </div>

      <div className={styles.line}></div>
      <p className={styles.orText}>or</p>
      <form className={styles.signinForm}>
        <div className={styles.signinInput}>
          <input
            type="text"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => {
              dispatch(setEmail(e.target.value));
            }}
            id="signinEmail"
          />
          <label htmlFor="signinEmail">Email</label>
        </div>
        <div className={styles.signinButtons}>
          <button
            onClick={(e) => {
              e.preventDefault();
              debouncedLoginWithPassword();
            }}
            className={styles.signinPassword}
          >
            Sign in with Password
          </button>
          <p className={styles.orText2}>or</p>
          <button
            onClick={(e) => {
              e.preventDefault();
              debouncedLoginWithEmail();
            }}
            className={styles.signinLink}
          >
            Sign in with Email Link
          </button>
        </div>
      </form>
      <p className={styles.signupText}>
        Don&apos;t have an account?&nbsp;
        <span
          onClick={() => {
            dispatch(setSigninModal(false));
            dispatch(setSignupModal(true));
            dispatch(setEmail(""));
          }}
        >
          Sign up
        </span>
      </p>
    </div>
  );

  const passwordContent = (
    <div className={styles.passwordContent}>
      <h2 className={styles.passwordTitle}>Enter your password</h2>
      <form
        className={styles.signinForm}
        onSubmit={(e) => {
          e.preventDefault();
          debouncedLogin();
        }}
      >
        <div className={styles.signinInput}>
          <input
            type="email"
            value={email}
            onChange={(e) => dispatch(setEmail(e.target.value))}
          />
          <label htmlFor="signinEmailField">Email</label>
        </div>
        <div className={styles.signinInput}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <label htmlFor="signinPassword">Password</label>
        </div>
        <button className={styles.signinButton}>Log in</button>
      </form>
      <p
        className={styles.forgotText}
        onClick={() => {
          dispatch(setSignupModal(false));
          dispatch(setSigninModal(false));
          dispatch(setForgotModal(true));
        }}
      >
        Forgot password?
      </p>
    </div>
  );

  return (
    <div className={styles.signinModal}>
      <div
        className={styles.signinClose}
        onClick={() => {
          dispatch(setSigninModal(false));
          dispatch(setEmail(""));
        }}
      >
        <IoCloseCircle />
      </div>

      {!emailLinkSent ? (
        <div>{passwordPage ? passwordContent : loginContent}</div>
      ) : (
        <EmailSent setEmailLinkSent={setEmailLinkSent} />
      )}
    </div>
  );
}

export default SignIn;
