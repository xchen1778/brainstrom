import { useState } from "react";
import EditComment from "./EditComment";
import { db } from "../utils/firebase";
import {
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";

function Comment({
  comment,
  displayName,
  photoURL,
  timestamp,
  edited,
  userId,
  id,
  numOfLikes,
}) {
  const [deleteOn, setDeleteOn] = useState(false);
  const [editOn, setEditOn] = useState(false);

  async function handleDelete(id) {
    try {
      const commentRef = doc(db, "comments", id);
      await deleteDoc(commentRef);
      setDeleteOn(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleLikes() {
    try {
      const commentRef = doc(db, "comments", id);
      const commentSnap = await getDoc(commentRef);
      const alreadyLiked = commentSnap
        .data()
        .likes.some(
          (like) => like.userId === window.localStorage.getItem("userId")
        );
      const countLikes = commentSnap.data().numOfLikes;

      if (alreadyLiked) {
        await updateDoc(commentRef, {
          likes: arrayRemove({
            like: 1,
            userId: window.localStorage.getItem("userId"),
          }),
          numOfLikes: countLikes - 1,
        });
      } else {
        await updateDoc(commentRef, {
          likes: arrayUnion({
            like: 1,
            userId: window.localStorage.getItem("userId"),
          }),
          numOfLikes: countLikes + 1,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <img src={photoURL} />
      <h1>{displayName}</h1>
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

      {editOn ? (
        <EditComment comment={comment} id={id} setEditOn={setEditOn} />
      ) : (
        <>
          <div>
            <p>{comment}</p>
          </div>
          {userId === window.localStorage.getItem("userId") && (
            <>
              <button onClick={() => setDeleteOn(true)}>Delete</button>
              <button onClick={() => setEditOn(true)}>Edit</button>
            </>
          )}
          <button onClick={handleLikes}>{numOfLikes} Likes</button>
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

export default Comment;
