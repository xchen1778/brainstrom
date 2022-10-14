import { useState } from "react";
import EditIdea from "./EditIdea";
import { db } from "../utils/firebase";
import { doc, deleteDoc } from "firebase/firestore";

function Idea({ id, idea, photoURL, displayName, dashboard, profile }) {
  const [editOn, setEditOn] = useState(false);
  async function handleDelete(id) {
    try {
      const ideaRef = doc(db, "ideas", id);
      await deleteDoc(ideaRef);
    } catch (error) {
      console.log(error.code);
    }
  }

  return (
    <div>
      <div>
        <img src={photoURL} />
        <h2>{displayName}</h2>
      </div>
      {editOn ? (
        <EditIdea idea={idea} id={id} setEditOn={setEditOn} />
      ) : (
        <>
          <div>
            <p>{idea}</p>
          </div>
          {dashboard && (
            <div className="dashboard-page">
              <button>Comment</button>
            </div>
          )}
          {profile && (
            <div className="profile-page">
              <button onClick={() => handleDelete(id)}>Delete</button>
              <button onClick={() => setEditOn(true)}>Edit</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Idea;
