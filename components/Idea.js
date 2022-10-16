import { useState, useEffect } from "react";
import EditIdea from "./EditIdea";
import { db } from "../utils/firebase";
import {
  doc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import Comments from "./Comments";

function Idea({
  id,
  idea,
  photoURL,
  displayName,
  timestamp,
  edited,
  userId,
  likes,
}) {
  const [editOn, setEditOn] = useState(false);
  const [deleteOn, setDeleteOn] = useState(false);
  const [expandIdea, setExpandIdea] = useState(false);
  const [allComments, setAllComments] = useState([]);

  async function getAllComments() {
    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef,
      orderBy("timestamp", "desc"),
      where("ideaId", "==", id)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setAllComments(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    });
    console.log(allComments);
    return unsubscribe;
  }

  useEffect(() => {
    getAllComments();
  }, []);

  async function handleDelete(id) {
    try {
      const ideaRef = doc(db, "ideas", id);
      await deleteDoc(ideaRef);
      const commentsRef = collection(db, "comments");
      const q = query(commentsRef, where("ideaId", "==", id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (document) => {
        const commentRef = doc(db, "comments", document.id);
        await deleteDoc(commentRef);
      });
      setDeleteOn(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleLikes() {
    try {
      const ideaRef = doc(db, "ideas", id);
      const ideaSnap = await getDoc(ideaRef);
      const alreadyLiked = ideaSnap
        .data()
        .likes.some(
          (like) => like.userId === window.localStorage.getItem("userId")
        );

      if (alreadyLiked) {
        await updateDoc(ideaRef, {
          likes: arrayRemove({
            like: 1,
            userId: window.localStorage.getItem("userId"),
          }),
        });
      } else {
        await updateDoc(ideaRef, {
          likes: arrayUnion({
            like: 1,
            userId: window.localStorage.getItem("userId"),
          }),
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <div>
        <img src={photoURL} />
        <h2>{displayName}</h2>
        <p>
          <span>
            {(timestamp
              ? new Date(timestamp.seconds * 1000)
              : new Date()
            ).toLocaleDateString("en-US")}
          </span>
          {"  "}
          <span>
            {(timestamp
              ? new Date(timestamp.seconds * 1000)
              : new Date()
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {"  "}
          {edited && <span>edited</span>}
        </p>
      </div>
      {editOn ? (
        <EditIdea idea={idea} id={id} setEditOn={setEditOn} />
      ) : (
        <>
          <div>
            <p>{idea}</p>
          </div>
          <div className="dashboard-page">
            <button onClick={() => setExpandIdea(true)}>{`${
              allComments.length
            } Comment${allComments.length > 1 ? "s" : ""}`}</button>{" "}
            <button onClick={handleLikes}>{likes.length} Likes</button>
          </div>
          {userId === window.localStorage.getItem("userId") && expandIdea && (
            <div className="profile-page">
              <button onClick={() => setDeleteOn(true)}>Delete</button>
              <button onClick={() => setEditOn(true)}>Edit</button>
            </div>
          )}

          {expandIdea && <Comments id={id} allComments={allComments} />}

          {deleteOn && (
            <div>
              <h1>Do you want to delete this?</h1>
              <button onClick={() => handleDelete(id)}>Yes</button>
              <button onClick={() => setDeleteOn(false)}>No</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Idea;
