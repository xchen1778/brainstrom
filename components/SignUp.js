import { useState } from "react";
import { useDispatch } from "react-redux";
import { setSignupModal } from "../store/signupModal-slice";
import { setSigninModal } from "../store/signinModal-slice";
import { auth } from "../utils/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { debounce } from "../functions/debounce";
import { errorModal } from "../functions/errorModal";
import { useRouter } from "next/router";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SignUp() {
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const dispatch = useDispatch();
  const route = useRouter();

  async function register() {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword
      );
      await updateProfile(auth.currentUser, {
        displayName: registerName,
        photoURL:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0xaQ0N_9FbazbTufFB8hDIUkH6cQYqz8IrQ&usqp=CAU",
      });
      route.push("/dashboard");
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
          errorModal(
            "The Password you entered does not meet the requirements."
          );
          break;
        case "auth/weak-password":
          errorModal(
            "The Password you entered does not meet the requirements."
          );
          break;
      }
    }
  }

  const debouncedRegister = debounce(register, 300);

  return (
    <div className="z-10">
      <div
        onClick={() => {
          dispatch(setSignupModal(false));
        }}
      >
        X
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          debouncedRegister();
        }}
      >
        <input
          type="text"
          placeholder="name"
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          required
        />
        <p>(Password must be at least 6 characters.)</p>
        <button>Sign up</button>
      </form>
      <p>
        Already an account?
        <span
          onClick={() => {
            dispatch(setSignupModal(false));
            dispatch(setSigninModal(true));
          }}
        >
          Sign in
        </span>
      </p>
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

export default SignUp;
