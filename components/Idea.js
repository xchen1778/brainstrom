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
import styles from "../styles/Idea.module.scss";
import {
  FaRegCommentAlt,
  FaCommentAlt,
  FaRegHeart,
  FaHeart,
  FaRegEdit,
} from "react-icons/fa";
import { useRouter } from "next/router";
import Link from "next/link";
import { RiDeleteBinLine } from "react-icons/ri";
import Blackscreen from "./Blackscreen";
import { animated, useTransition } from "react-spring";
import { useDispatch } from "react-redux";
import { setLoadingPage } from "../store/loadingPage-slice";

function Idea({
  id,
  idea,
  photoURL,
  displayName,
  timestamp,
  edited,
  userId,
  numOfLikes,
  ideaPage,
  isAuthor,
  profilePage,
}) {
  const [editOn, setEditOn] = useState(false);
  const [deleteOn, setDeleteOn] = useState(false);
  const [fillComment, setFillComment] = useState(false);
  const [fillLike, setFillLike] = useState(false);
  const [alreadyLiked, setAlreadyLiked] = useState(false);
  const [allComments, setAllComments] = useState([]);
  const route = useRouter();
  const dispatch = useDispatch();
  const transitionDelete = useTransition(deleteOn, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  useEffect(() => {
    getAllComments();
    liked();
  }, []);

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
      route.push("/dashboard");
      dispatch(setLoadingPage(true));
    } catch (error) {
      console.log(error);
    }
  }

  async function handleLikes() {
    try {
      if (window.localStorage.getItem("userId")) {
        const ideaRef = doc(db, "ideas", id);
        const ideaSnap = await getDoc(ideaRef);
        const alreadyLiked = ideaSnap
          .data()
          .likes.some((like) => like === window.localStorage.getItem("userId"));
        if (alreadyLiked) {
          await updateDoc(ideaRef, {
            likes: arrayRemove(window.localStorage.getItem("userId")),
            numOfLikes: parseInt(numOfLikes) - 1,
          });
          setAlreadyLiked(false);
        } else {
          await updateDoc(ideaRef, {
            likes: arrayUnion(window.localStorage.getItem("userId")),
            numOfLikes: parseInt(numOfLikes) + 1,
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
      .likes.some((like) => like === window.localStorage.getItem("userId"));
    setAlreadyLiked(liked);
  }

  return (
    <div
      className={`${ideaPage ? styles.ideaOnDetails : ""} ${
        profilePage ? styles.ideaOnProfile : ""
      }`}
      onClick={() => {
        if (!ideaPage) {
          dispatch(setLoadingPage(true));
        }
      }}
    >
      <Link
        href={!ideaPage ? { pathname: `/dashboard/${id}`, query: id } : "#"}
      >
        <div
          className={styles.idea}
          onClick={(e) => {
            if (ideaPage) {
              e.preventDefault();
            }
          }}
        >
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
          {!editOn && (
            <>
              <div className={styles.userIdea}>
                <p>{idea}</p>
              </div>
              <div className={styles.ideaButtons}>
                <div className={styles.firstButtons}>
                  <button
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikes();
                    }}
                    onMouseEnter={() => setFillLike(true)}
                    onMouseLeave={() => setFillLike(false)}
                  >
                    {fillLike || alreadyLiked ? (
                      <FaHeart className={styles.fillLike} />
                    ) : (
                      <FaRegHeart />
                    )}
                    {numOfLikes}
                  </button>
                </div>
                {isAuthor && ideaPage && (
                  <div className={styles.secondButtons}>
                    <button
                      onClick={() => setEditOn(true)}
                      className={styles.editButton}
                    >
                      <FaRegEdit />
                    </button>
                    <button
                      onClick={() => setDeleteOn(true)}
                      className={styles.deleteButton}
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Link>

      {deleteOn && (
        <>
          <Blackscreen />
          <div className={styles.deleteModal}>
            <h4 className={styles.deleteTitle}>
              Do you want to delete this idea?
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

      {editOn && <EditIdea idea={idea} id={id} setEditOn={setEditOn} />}
    </div>
  );
}

export default memo(Idea);
