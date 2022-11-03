import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.scss";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSignupModal } from "../store/signupModal-slice";
import { setSigninModal } from "../store/signinModal-slice";
import { setVerifyEmail } from "../store/verifyEmail-slice";
import { setLoadingPage } from "../store/loadingPage-slice";
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
import { MdEmail } from "react-icons/md";
import { FaGoogle, FaFacebookF, FaTwitter, FaGithub } from "react-icons/fa";
import { animated, useTransition } from "react-spring";
import Loading from "../components/Loading";

function Home() {
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  const twitterProvider = new TwitterAuthProvider();
  const githubProvider = new GithubAuthProvider();
  const signupModal = useSelector((store) => store.signupModal);
  const signinModal = useSelector((store) => store.signinModal);
  const forgotModal = useSelector((store) => store.forgotModal);
  const verifyEmail = useSelector((store) => store.verifyEmail);
  const dispatch = useDispatch();
  const loadingPage = useSelector((store) => store.loadingPage);
  const route = useRouter();
  const [user, loading] = useAuthState(auth);
  const transitionSignup = useTransition(signupModal, {
    from: { opacity: 1 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });
  const transitionSignin = useTransition(signinModal, {
    from: { opacity: 1 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });
  const transitionForgot = useTransition(forgotModal, {
    from: { opacity: 1 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });
  const transitionVerify = useTransition(verifyEmail, {
    from: { opacity: 1 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

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
          dispatch(setLoadingPage(true));
        }
      } catch (error) {
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
    dispatch(setLoadingPage(true));
  }, []);

  useEffect(() => {
    if (user && !loading) {
      setTimeout(() => {
        route.push("/dashboard");
      }, 500);
    } else {
      dispatch(setLoadingPage(false));
    }
  }, [user, loading]);

  async function googleLogin() {
    try {
      await signInWithPopup(auth, googleProvider);
      route.push("/dashboard");
      dispatch(setLoadingPage(true));
    } catch (error) {
      console.log(error);
      switch (error.code) {
        case "auth/account-exists-with-different-credential":
          errorModal("An account already exists with this email.");
          break;
      }
    }
  }

  async function facebookLogin() {
    try {
      await signInWithPopup(auth, facebookProvider);
      route.push("/dashboard");
      dispatch(setLoadingPage(true));
    } catch (error) {
      console.log(error);
      switch (error.code) {
        case "auth/account-exists-with-different-credential":
          errorModal("An account already exists with this email.");
          break;
      }
    }
  }

  async function twitterLogin() {
    try {
      await signInWithPopup(auth, twitterProvider);
      route.push("/dashboard");
      dispatch(setLoadingPage(true));
    } catch (error) {
      console.log(error);
      switch (error.code) {
        case "auth/account-exists-with-different-credential":
          errorModal("An account already exists with this email.");
          break;
      }
    }
  }

  async function githubLogin() {
    try {
      await signInWithPopup(auth, githubProvider);
      route.push("/dashboard");
      dispatch(setLoadingPage(true));
    } catch (error) {
      console.log(error);
      switch (error.code) {
        case "auth/account-exists-with-different-credential":
          errorModal("An account already exists with this email.");
          break;
      }
    }
  }
  const debouncedGoogleLogin = debounce(googleLogin, 300);
  const debouncedFacebookLogin = debounce(facebookLogin, 300);
  const debouncedTwitterLogin = debounce(twitterLogin, 300);
  const debouncedGithubLogin = debounce(githubLogin, 300);

  return (
    <div className={styles.loginPage}>
      <Head>
        <title>Brainstorm</title>
      </Head>
      <header className={styles.loginHeader}>
        <Link href={"/"}>
          <a className={styles.logoLink}>
            <img className={styles.logo} src="/brainstorm-logo.png" />
          </a>
        </Link>
        <a
          className={styles.loginText}
          onClick={() => {
            dispatch(setLoadingPage(true));
            route.push("/dashboard");
          }}
        >
          Explore
        </a>
      </header>
      <main className={styles.loginContent}>
        <section className={styles.loginSection}>
          <h1 className={styles.loginHeadline}>
            Let&apos;s share and collaborate!
          </h1>
          <div className={styles.loginMethods}>
            <div>
              <h2 className={styles.loginSubtitle}>Sign up with</h2>
              <div className={styles.signUpButtons}>
                <button
                  className={styles.signUpButton}
                  onClick={() => dispatch(setSignupModal(true))}
                >
                  <MdEmail />
                </button>
                <button
                  className={styles.signUpButton}
                  onClick={debouncedGoogleLogin}
                >
                  <FaGoogle />
                </button>
                <button
                  className={styles.signUpButton}
                  onClick={debouncedFacebookLogin}
                >
                  <FaFacebookF />
                </button>
                <button
                  className={styles.signUpButton}
                  onClick={debouncedTwitterLogin}
                >
                  <FaTwitter />
                </button>
                <button
                  className={styles.signUpButton}
                  onClick={debouncedGithubLogin}
                >
                  <FaGithub />
                </button>
              </div>
            </div>
            <div>
              <h2 className={styles.loginSubtitle}>Already have an account?</h2>
              <button
                className={styles.signInButton}
                onClick={() => dispatch(setSigninModal(true))}
              >
                Sign in
              </button>
            </div>
          </div>
        </section>
        <section className={styles.imageSection}>
          <img className={styles.heroImage} src="/login-page-graphic.png" />
        </section>
      </main>

      {(signinModal || signupModal || forgotModal || verifyEmail) && (
        <Blackscreen />
      )}
      {transitionSignup(
        (style, item) =>
          item && (
            <animated.div style={style}>
              <SignUp isHomePage={true} />
            </animated.div>
          )
      )}

      {transitionSignin(
        (style, item) =>
          item &&
          !forgotModal && (
            <animated.div style={style}>
              <SignIn isHomePage={true} />
            </animated.div>
          )
      )}
      {transitionForgot(
        (style, item) =>
          item && (
            <animated.div style={style}>
              <ForgotPassword />
            </animated.div>
          )
      )}
      {transitionVerify(
        (style, item) =>
          item && (
            <animated.div style={style}>
              <VerifyEmail isHomePage={true} />
            </animated.div>
          )
      )}
      {loadingPage && <Loading />}
      <ToastContainer
        position="top-center"
        autoClose={2000}
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
        toastStyle={{ backgroundColor: "#206BFF" }}
      />
    </div>
  );
}

export default Home;
