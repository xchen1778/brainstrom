import { useState } from "react";
import { db } from "../utils/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { errorModal } from "../functions/errorModal";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditComment({ id, comment, setEditOn }) {
  const [editComment, setEditComment] = useState(comment);

  async function handleEdit(id) {
    try {
      if (
        editComment === comment ||
        editComment.length === 0 ||
        editComment.length > 300
      ) {
        errorModal("Invalid post. Please check again.");
        return;
      } else {
        const commentRef = doc(db, "comments", id);
        await updateDoc(commentRef, {
          comment: editComment,
          timestamp: serverTimestamp(),
          edited: true,
        });
        setEditOn(false);
      }
    } catch (error) {
      console.log(error);
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
        <input
          type="text"
          value={editComment}
          onChange={(e) => {
            setEditComment(e.target.value);
          }}
        />
        <p>{editComment.length}/300</p>
        <button
          disabled={
            editComment === comment ||
            editComment.length === 0 ||
            editComment.length > 300
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

export default EditComment;
