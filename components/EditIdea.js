import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { errorModal } from "../functions/errorModal";
import styles from "../styles/Editidea.module.scss";

function EditIdea({ id, idea, setEditOn }) {
  const [editIdea, setEditIdea] = useState(idea);

  useEffect(() => {
    const editIdeaTextArea = document.querySelector("#editIdeaTextArea");
    const end = editIdeaTextArea.value.length;
    editIdeaTextArea.setSelectionRange(end, end);
    editIdeaTextArea.focus();
  }, []);

  async function handleEdit(id) {
    try {
      console.log("run");
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
    <form className={styles.editForm}>
      <textarea
        value={editIdea}
        onChange={(e) => {
          setEditIdea(e.target.value);
          e.target.style.height = "inherit";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onKeyDown={handleEnterPress}
        className={styles.editArea}
        id="editIdeaTextArea"
        autofocus
      ></textarea>
      <div className={styles.editAction}>
        <p className={styles.editTextCount}>{editIdea.length}/300</p>
        <div className={styles.editButtons}>
          <button
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#editIdeaTextArea").style.height =
                "inherit";
              setEditIdea(idea);
              setEditOn(false);
            }}
            className={styles.editIdeaCancelButton}
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleEdit(id);
            }}
            disabled={editIdea.length === 0 || editIdea.length > 300}
            className={styles.editIdeaDoneButton}
          >
            Done
          </button>
        </div>
      </div>
    </form>
  );
}

export default EditIdea;
