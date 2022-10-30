import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { errorModal } from "../functions/errorModal";
import { debounce } from "../functions/debounce";
import styles from "../styles/Editcomment.module.scss";

function EditComment({ id, comment, setEditOn }) {
  const [editComment, setEditComment] = useState(comment);

  useEffect(() => {
    const editCommentTextArea = document.querySelector("#editCommentTextArea");
    const end = editCommentTextArea.value.length;
    editCommentTextArea.setSelectionRange(end, end);
    editCommentTextArea.focus();
  }, []);

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
  const debouncedHandleEdit = debounce(handleEdit, 300);

  function handleEnterPress(e) {
    if (e.keyCode === 13 && !e.shift && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      debouncedHandleEdit(id);
    }
  }

  return (
    <form className={styles.editForm}>
      <textarea
        type="text"
        value={editComment}
        onChange={(e) => {
          setEditComment(e.target.value);
          e.target.style.height = "inherit";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        className={styles.editTextArea}
        id="editCommentTextArea"
        onKeyDown={handleEnterPress}
      ></textarea>

      <div className={styles.editCommentSubmit}>
        <p
          className={`${styles.textCount} ${
            editComment.length ? styles.textShowCount : ""
          } ${editComment.length > 300 ? styles.textOverCount : ""} `}
        >
          {editComment.length}/300
        </p>
        <div className={styles.editCommentButtons}>
          <button
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#editCommentTextArea").style.height =
                "inherit";
              setEditOn(false);
            }}
            className={styles.editCommentCancelButton}
          >
            Cancel
          </button>
          <button
            disabled={
              editComment === comment ||
              editComment.length === 0 ||
              editComment.length > 300
            }
            onClick={(e) => {
              e.preventDefault();
              debouncedHandleEdit(id);
            }}
            className={styles.editCommentSubmitButton}
          >
            Done
          </button>
        </div>
      </div>
    </form>
  );
}

export default EditComment;
