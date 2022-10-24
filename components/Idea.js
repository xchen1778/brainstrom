import { useState, useEffect, memo } from "react";
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
import styles from "../styles/Idea.module.scss";
import {
  FaRegCommentAlt,
  FaCommentAlt,
  FaRegHeart,
  FaHeart,
} from "react-icons/fa";

function Idea({
  id,
  idea,
  photoURL,
  displayName,
  timestamp,
  edited,
  userId,
  likes,
  numOfLikes,
}) {
  const [editOn, setEditOn] = useState(false);
  const [deleteOn, setDeleteOn] = useState(false);
  const [expandIdea, setExpandIdea] = useState(true);
  const [fillComment, setFillComment] = useState(false);
  const [fillLike, setFillLike] = useState(false);
  const [alreadyLiked, setAlreadyLiked] = useState(false);
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
    return unsubscribe;
  }

  useEffect(() => {
    getAllComments();
    liked();
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
          numOfLikes: numOfLikes - 1,
        });
        setAlreadyLiked(false);
      } else {
        await updateDoc(ideaRef, {
          likes: arrayUnion({
            like: 1,
            userId: window.localStorage.getItem("userId"),
          }),
          numOfLikes: numOfLikes + 1,
        });
        setAlreadyLiked(true);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function commented() {
    return allComments.some(
      (comment) => comment.userId === window.localStorage.getItem("userId")
    );
  }

  async function liked() {
    const ideaRef = doc(db, "ideas", id);
    const ideaSnap = await getDoc(ideaRef);
    const liked = ideaSnap
      .data()
      .likes.some(
        (like) => like.userId === window.localStorage.getItem("userId")
      );
    setAlreadyLiked(liked);
  }

  return (
    <div className={styles.idea}>
      <div className={styles.userInfo}>
        <img className={styles.userPhoto} src={photoURL} />
        <div>
          <h3 className={styles.userName}>{displayName}</h3>
          <p className={styles.postTime}>
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
      </div>
      <div className={styles.userIdea}>
        <p>{idea}</p>
      </div>
      <div className={styles.ideaButtons}>
        <button
          onClick={() => setExpandIdea(true)}
          className={styles.ideaCommentButton}
          onMouseEnter={() => setFillComment(true)}
          onMouseLeave={() => setFillComment(false)}
        >
          {fillComment || commented() ? (
            <FaCommentAlt className={styles.fillComment} />
          ) : (
            <FaRegCommentAlt />
          )}
          {`${allComments.length}`}
        </button>
        <button
          className={styles.ideaLikeButton}
          onClick={handleLikes}
          onMouseEnter={() => setFillLike(true)}
          onMouseLeave={() => setFillLike(false)}
        >
          {fillLike || alreadyLiked ? (
            <FaHeart className={styles.fillLike} />
          ) : (
            <FaRegHeart />
          )}
          {likes.length}
        </button>
      </div>
      {/* {expandIdea && <Comments id={id} allComments={allComments} />} */}
    </div>
  );
}

{
  /* {editOn ? (
        <EditIdea idea={idea} id={id} setEditOn={setEditOn} />
      ) : (
        <>
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
} */
}

export default memo(Idea);
