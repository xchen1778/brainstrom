import { useRouter } from "next/router";
import { auth } from "../utils/firebase";
import { useDispatch } from "react-redux";
import { setSignupModal } from "../store/signupModal-slice";
import { setSigninModal } from "../store/signinModal-slice";
import { setForgotModal } from "../store/forgotModal-slice";
import { setResetModal } from "../store/resetModal-slice";
import { setEmail } from "../store/email-slice";
import { setVerifyEmail } from "../store/verifyEmail-slice";
import { setLoadingPage } from "../store/loadingPage-slice";
import styles from "../styles/Dropdown.module.scss";

function Dropdown({ isProfile }) {
  const dispatch = useDispatch();
  const route = useRouter();
  return (
    <div className={styles.dropdown}>
      <button
        className={`${styles.dropdownButton} ${
          isProfile ? styles.profileButton : ""
        }`}
        disabled={isProfile}
        onClick={() => {
          if (!isProfile) {
            dispatch(setLoadingPage(true));
            route.push({
              pathname: "/profile",
              query: {
                uId: window.localStorage.getItem("userId"),
              },
            });
          }
        }}
      >
        Profile
      </button>
      <button
        className={styles.dropdownButton}
        onClick={() => {
          auth.signOut();
          window.localStorage.removeItem("userId");
          dispatch(setSignupModal(false));
          dispatch(setSigninModal(false));
          dispatch(setForgotModal(false));
          dispatch(setResetModal(false));
          dispatch(setVerifyEmail(false));
          dispatch(setEmail(""));
          isProfile && dispatch(setLoadingPage(true));
          isProfile && route.push("/");
        }}
      >
        Sign out
      </button>
    </div>
  );
}

export default Dropdown;
