import { useSelector, useDispatch } from "react-redux";
import { setDropdown } from "../store/dropdown-slice";
import Link from "next/link";
import { auth } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Dropdown from "./Dropdown";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useRouter } from "next/router";
import styles from "../styles/Nav.module.scss";
import { animated, useTransition } from "react-spring";
import { setLoadingPage } from "../store/loadingPage-slice";
import { setSigninModal } from "../store/signinModal-slice";
import Blackscreen from "./Blackscreen";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";
import VerifyEmail from "./VerifyEmail";

function Nav({ isHomePage, isDashboard, isProfile }) {
  const [user, loading] = useAuthState(auth);
  const dropdown = useSelector((store) => store.dropdown);
  const signinModal = useSelector((store) => store.signinModal);
  const signupModal = useSelector((store) => store.signupModal);
  const forgotModal = useSelector((store) => store.forgotModal);
  const verifyEmail = useSelector((store) => store.verifyEmail);
  const dispatch = useDispatch();
  const route = useRouter();
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
  const transitionUser = useTransition(dropdown, {
    from: { opacity: 1 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return (
    <div className={styles.topNav}>
      <nav className={styles.nav}>
        <a
          className={styles.logoLink}
          onClick={() => {
            if (!user) {
              dispatch(setLoadingPage(true));
              route.push("/");
            } else {
              if (!isDashboard) {
                dispatch(setLoadingPage(true));
                route.push("/dashboard");
              }
            }
          }}
        >
          <img className={styles.logo} src="/brainstorm-logo.png" />
        </a>
        {user ? (
          <button
            className={styles.userProfile}
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setDropdown(!dropdown));
            }}
          >
            <img className={styles.userPhoto} src={user?.photoURL} />
            {dropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </button>
        ) : (
          <button
            onClick={() => {
              dispatch(setSigninModal(true));
            }}
            className={styles.signInUpButton}
          >
            Sign in / up
          </button>
        )}
      </nav>
      {(signinModal || signupModal || forgotModal || verifyEmail) && (
        <Blackscreen />
      )}
      {transitionUser(
        (style, item) =>
          item && (
            <animated.div style={style}>
              <Dropdown isProfile={isProfile} />
            </animated.div>
          )
      )}
      {transitionSignup(
        (style, item) =>
          item && (
            <animated.div style={style}>
              <SignUp />
            </animated.div>
          )
      )}

      {transitionSignin(
        (style, item) =>
          item &&
          !forgotModal && (
            <animated.div style={style}>
              <SignIn />
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
              <VerifyEmail />
            </animated.div>
          )
      )}
    </div>
  );
}

export default Nav;
