import Head from "next/head";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSignupModal } from "../store/signupModal-slice";
import { setSigninModal } from "../store/signinModal-slice";
import { setVerifyEmail } from "../store/verifyEmail-slice";
import { auth } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { debounce } from "../functions/debounce";
import { useRouter } from "next/router";
import SignUp from "../components/SignUp";
import SignIn from "../components/SignIn";
import Blackscreen from "../components/Blackscreen";
import ForgotPassword from "../components/ForgotPassword";
import { errorModal } from "../functions/errorModal";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VerifyEmail from "../components/VerifyEmail";
// import Loading from "../components/Loading";

function Home() {
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  const twitterProvider = new TwitterAuthProvider();
  const githubProvider = new GithubAuthProvider();
  const signupModal = useSelector((store) => store.signupModal);
  const signinModal = useSelector((store) => store.signinModal);
  const forgotModal = useSelector((store) => store.forgotModal);
  const verifyEmail = useSelector((store) => store.verifyEmail);
  // const [loadingPage, setLoadingPage] = useState(false);
  const dispatch = useDispatch();
  const route = useRouter();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    async function signInEmailLink() {
      try {
        if (await isSignInWithEmailLink(auth, window.location.href)) {
          let savedEmail = window.localStorage.getItem("emailForSignIn");
          if (!savedEmail) {
            dispatch(setVerifyEmail(true));
            return;
          }
          await signInWithEmailLink(auth, savedEmail, window.location.href);
          window.localStorage.removeItem("emailForSignIn");
          route.push("/dashboard");
        }
      } catch (error) {
        console.log(error.code);
        switch (error.code) {
          case "auth/missing-email":
            errorModal("Verification failed. You provided an incorrect email.");
            break;
          case "auth/invalid-email":
            errorModal("Verification failed. You provided an incorrect email.");
            break;
          case "auth/invalid-action-code":
            errorModal("Verification link has expired.");
            break;
        }
      }
    }
    signInEmailLink();
  }, []);

  useEffect(() => {
    if (user && !loading) {
      route.push("/dashboard");
    }
  }, [user, loading]);

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

  const debouncedGoogleLogin = debounce(googleLogin, 300);
  const debouncedFacebookLogin = debounce(facebookLogin, 300);
  const debouncedTwitterLogin = debounce(twitterLogin, 300);
  const debouncedGithubLogin = debounce(githubLogin, 300);

  return (
    <div>
      <Head>
        <title>Brainstorm</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col">
        <h1>Join Brainstorm today!</h1>
        <button onClick={debouncedGoogleLogin}>Sign Up with Google</button>
        <button onClick={debouncedFacebookLogin}>Sign Up with Facebook</button>
        <button onClick={debouncedTwitterLogin}>Sign Up with Twitter</button>
        <button onClick={debouncedGithubLogin}>Sign Up with GitHub</button>
        <p>or</p>
        <button onClick={() => dispatch(setSignupModal(true))}>
          Sign up with email
        </button>
        <h2>Already have an account?</h2>
        <button onClick={() => dispatch(setSigninModal(true))}>Sign in</button>
        {signupModal && (
          <>
            <Blackscreen />
            <SignUp />
          </>
        )}
        {signinModal && (
          <>
            <Blackscreen />
            <SignIn />
          </>
        )}
        {forgotModal && (
          <>
            <Blackscreen />
            <ForgotPassword />
          </>
        )}
        {verifyEmail && (
          <>
            <Blackscreen />
            <VerifyEmail />
          </>
        )}
        {/* {loadingPage && <Loading />} */}
      </div>

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
    </div>
  );
}

export default Home;
