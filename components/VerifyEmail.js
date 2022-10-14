import { useState } from "react";
import { auth } from "../utils/firebase";
import { signInWithEmailLink } from "firebase/auth";
import { errorModal } from "../functions/errorModal";
import { useDispatch } from "react-redux";
import { setVerifyEmail } from "../store/verifyEmail-slice";
import { useRouter } from "next/router";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    <div className="z-10">
      <div onClick={() => dispatch(setVerifyEmail(false))}>X</div>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Email"
          value={emailForVerify}
          onChange={(e) => {
            setEmailForVerify(e.target.value);
          }}
        />
        <button>Verify</button>
      </form>
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

export default VerifyEmail;
