import { useEffect, useState } from "react";
import EditComment from "./EditComment";
import { db } from "../utils/firebase";
import { useDispatch } from "react-redux";
import { setLoadingPage } from "../store/loadingPage-slice";
import {
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import styles from "../styles/Comment.module.scss";
import { FaRegHeart, FaHeart, FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { useRouter } from "next/router";
import Blackscreen from "./Blackscreen";
import Link from "next/link";

function Comment({
  comment,
  displayName,
  photoURL,
  timestamp,
  edited,
  userId,
  id,
  likes,
  numOfLikes,
}) {
  const [deleteOn, setDeleteOn] = useState(false);
  const [editOn, setEditOn] = useState(false);
  const [alreadyLiked, setAlreadyLiked] = useState(false);
  const [fillHeart, setFillHeart] = useState(false);
  const route = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    setAlreadyLiked(
      likes.some(
        (like) => like.userId === window.localStorage.getItem("userId")
      )
    );
  }, []);

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
      if (window.localStorage.getItem("userId")) {
        const commentRef = doc(db, "comments", id);
        const commentSnap = await getDoc(commentRef);
        const alreadyLiked = commentSnap
          .data()
          .likes.some(
            (like) => like.userId === window.localStorage.getItem("userId")
          );
        const countLikes = parseInt(commentSnap.data().numOfLikes);

        if (alreadyLiked) {
          await updateDoc(commentRef, {
            likes: arrayRemove(window.localStorage.getItem("userId")),
            numOfLikes: countLikes - 1,
          });
          setAlreadyLiked(false);
        } else {
          await updateDoc(commentRef, {
            likes: arrayUnion(window.localStorage.getItem("userId")),
            numOfLikes: countLikes + 1,
          });
          setAlreadyLiked(true);
        }
      } else {
        route.push("/");
        dispatch(setLoadingPage(true));
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className={styles.comment}>
      <Link
        href={{
          pathname: "/profile",
          query: {
            uId: userId,
            uName: displayName,
            uPic: photoURL,
          },
        }}
      >
        <div
          className={styles.userInfo}
          onClick={() => {
            dispatch(setLoadingPage(true));
          }}
        >
          <div className={styles.userPhotoSection}>
            <img src={photoURL} className={styles.userPhoto} />
          </div>
          <div>
            <h3 className={styles.userName}>{displayName}</h3>
            <p className={styles.commentTime}>
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
      </Link>

      {editOn ? (
        <EditComment comment={comment} id={id} setEditOn={setEditOn} />
      ) : (
        <>
          <div className={styles.commentContent}>
            <p>{comment}</p>
          </div>
          {userId === window.localStorage.getItem("userId") && (
            <div className={styles.commentActions}>
              <button
                className={styles.commentEditButton}
                onClick={() => setEditOn(true)}
              >
                <FaRegEdit />
              </button>
              <button
                className={styles.commentDeleteButton}
                onClick={() => setDeleteOn(true)}
              >
                <RiDeleteBinLine />
              </button>
            </div>
          )}
          <button
            onClick={handleLikes}
            className={styles.commentLikeButton}
            onMouseEnter={() => setFillHeart(true)}
            onMouseLeave={() => setFillHeart(false)}
          >
            {fillHeart || alreadyLiked ? (
              <FaHeart className={styles.fillHeart} />
            ) : (
              <FaRegHeart />
            )}
            {numOfLikes}{" "}
          </button>

          {deleteOn && (
            <>
              <Blackscreen />
              <div className={styles.deleteModal}>
                <h4 className={styles.deleteTitle}>
                  Do you want to delete this comment?
                </h4>
                <div className={styles.deleteButtons}>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(id)}
                  >
                    Yes
                  </button>
                  <button onClick={() => setDeleteOn(false)}>No</button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Comment;
