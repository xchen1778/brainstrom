import { auth } from "../utils/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { errorModal } from "../functions/errorModal";
import { useSelector, useDispatch } from "react-redux";
import { setForgotModal } from "../store/forgotModal-slice";
import { setResetModal } from "../store/resetModal-slice";
import { setEmail } from "../store/email-slice";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Blackscreen from "./Blackscreen";

function ForgotPassword() {
  const email = useSelector((store) => store.email);
  const dispatch = useDispatch();
  const resetModal = useSelector((store) => store.resetModal);

  async function handleReset(e) {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      dispatch(setResetModal(true));
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-email":
          errorModal("Please enter a valid email address.");
          break;
        case "auth/user-not-found":
          errorModal("We didn't find an account with this email address.");
          break;
      }
    }
  }

  return (
    <>
      <div className="z-10">
        <div
          onClick={() => {
            dispatch(setForgotModal(false));
            dispatch(setEmail(""));
          }}
        >
          X
        </div>
        <form onSubmit={handleReset}>
          <h1>Find your Brainstorm account</h1>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              dispatch(setEmail(e.target.value));
            }}
          />
          <button>Search</button>
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

      {resetModal && (
        <>
          <div className="z-30">
            <Blackscreen />
          </div>
          <div className="z-40">
            <h3>
              An email has been sent. (Sometimes it can be in your spam folder.)
            </h3>
            <button
              onClick={() => {
                dispatch(setResetModal(false));
                dispatch(setForgotModal(false));
                dispatch(setEmail(""));
              }}
            >
              Back to home page
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default ForgotPassword;
