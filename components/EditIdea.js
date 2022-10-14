import { useState } from "react";
import { db } from "../utils/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

function EditIdea({ id, idea, setEditOn }) {
  const [editIdea, setEditIdea] = useState(idea);

  async function handleEdit(id) {
    try {
      const ideaRef = doc(db, "ideas", id);
      await updateDoc(ideaRef, {
        idea: editIdea,
        timestamp: serverTimestamp(),
      });
      setEditOn(false);
    } catch (error) {
      console.log(error.code);
    }
  }

  return (
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
      ></textarea>
      <button>Done</button>
    </form>
  );
}

export default EditIdea;
