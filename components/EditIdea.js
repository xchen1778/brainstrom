import { useState } from "react";
import { db } from "../utils/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { errorModal } from "../functions/errorModal";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditIdea({ id, idea, setEditOn }) {
  const [editIdea, setEditIdea] = useState(idea);

  async function handleEdit(id) {
    try {
      if (editIdea === idea || editIdea.length === 0 || editIdea.length > 300) {
        errorModal("Invalid post. Please check again.");
        return;
      } else {
        const ideaRef = doc(db, "ideas", id);
        await updateDoc(ideaRef, {
          idea: editIdea,
          timestamp: serverTimestamp(),
          edited: true,
        });
        setEditOn(false);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleEnterPress(e) {
    if (e.keyCode === 13 && !e.shift && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleEdit(id);
    }
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleEdit(id);
        }}
      >
        <textarea
          value={editIdea}
          onChange={(e) => {
            setEditIdea(e.target.value);
          }}
          onKeyDown={handleEnterPress}
        ></textarea>
        <p>{editIdea.length}/300</p>
        <button
          disabled={
            editIdea === idea || editIdea.length === 0 || editIdea.length > 300
          }
        >
          Done
        </button>
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
    </>
  );
}

export default EditIdea;
