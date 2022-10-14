import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSignupModal } from "../store/signupModal-slice";
import { setSigninModal } from "../store/signinModal-slice";
import { setForgotModal } from "../store/forgotModal-slice";
import { setEmail } from "../store/email-slice";
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
import Blackscreen from "./Blackscreen";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SignIn() {
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

  async function login() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      route.push("/dashboard");
    } catch (error) {
      switch (error.code) {
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
          url: "http://localhost:3000/",
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
      route.push("/dashboard");
    } catch (error) {
      console.log(error.code);
    }
  }

  async function facebookLogin() {
    try {
      await signInWithPopup(auth, facebookProvider);
      route.push("/dashboard");
    } catch (error) {
      console.log(error.code);
    }
  }

  async function twitterLogin() {
    try {
      await signInWithPopup(auth, twitterProvider);
      route.push("/dashboard");
    } catch (error) {
      console.log(error.code);
    }
  }

  async function githubLogin() {
    try {
      await signInWithPopup(auth, githubProvider);
      route.push("/dashboard");
    } catch (error) {
      console.log(error.code);
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
    <div className="z-10">
      <button onClick={debouncedGoogleLogin}>Sign Up with Google</button>
      <button onClick={debouncedFacebookLogin}>Sign Up with Facebook</button>
      <button onClick={debouncedTwitterLogin}>Sign Up with Twitter</button>
      <button onClick={debouncedGithubLogin}>Sign Up with GitHub</button>
      <form>
        <input
          type="text"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => {
            dispatch(setEmail(e.target.value));
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            debouncedLoginWithPassword();
          }}
        >
          Login with Password
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            debouncedLoginWithEmail();
          }}
        >
          Login with Email Link
        </button>
      </form>
      <p
        onClick={() => {
          dispatch(setSignupModal(false));
          dispatch(setSigninModal(false));
          dispatch(setForgotModal(true));
        }}
      >
        Forgot password?
      </p>
      <p>
        Don't have an account?
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
    <div className="z-10">
      <h2>Enter your password</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          debouncedLogin();
        }}
      >
        <input type="email" value={email} disabled />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <button>Log in</button>
      </form>
      <p
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
    <>
      <div
        className="z-10"
        onClick={() => {
          dispatch(setSigninModal(false));
          dispatch(setEmail(""));
        }}
      >
        X
      </div>
      {passwordPage ? passwordContent : loginContent}
      {emailLinkSent && (
        <>
          <div className="z-30">
            <Blackscreen />
          </div>
          <div className="z-40">
            <h1>
              Email link has been sent. (Sometimes it is in your spam folder.)
            </h1>
            <button
              onClick={() => {
                dispatch(setSigninModal(false));
                setEmailLinkSent(false);
                dispatch(setEmail(""));
              }}
            >
              Back to Home
            </button>
          </div>
        </>
      )}

      <ToastContainer
        position="top-center"
        autoClose={1500}
        limit={5}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
      />
    </>
  );
}

export default SignIn;
