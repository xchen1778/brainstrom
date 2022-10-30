import { useEffect, useState } from "react";
import { db, auth } from "../utils/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Comment from "./Comment";
import { errorModal } from "../functions/errorModal";
import styles from "../styles/Comments.module.scss";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setLoadingPage } from "../store/loadingPage-slice";
import Lottie from "lottie-react";
import loader from "../public/loader.json";
import { debounce } from "../functions/debounce";

function Comments({ id }) {
  const [message, setMessage] = useState("");
  const [user, loading] = useAuthState(auth);
  const [allComments, setAllComments] = useState([]);
  const [sortedAllComments, setSortedAllComments] = useState([]);
  const [showSubmit, setShowSubmit] = useState(false);
  const [posting, setPosting] = useState(false);
  const [endComments, setEndComments] = useState(false);
  const [amountCommentsShown, setAmountCommentsShown] = useState(10);
  const [loadingIcon, setLoadingIcon] = useState(false);
  const route = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    getComments();
    document.addEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (amountCommentsShown > allComments.length) {
      setEndComments(true);
    }
  }, [amountCommentsShown]);

  function handleScroll() {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      endComments === false
    ) {
      setLoadingIcon(true);
      setTimeout(() => {
        setAmountCommentsShown((amount) => amount + 10);
        setLoadingIcon(false);
      }, 1000);
    }
  }

  function sortComments(comments) {
    return comments.sort((a, b) => b.numOfLikes - a.numOfLikes);
  }

  function isSameComment(a, b) {
    return a.id === b.id;
  }

  function isSameLikedComment(a, b) {
    return a.id === b.id && a.numOfLikes === b.numOfLikes;
  }

  function isSameCommentContent(a, b) {
    return a.id === b.id && a.comment === b.comment;
  }

  function getDifference(a, b, compareFunction) {
    return a.filter(
      (aComment) => !b.some((bComment) => compareFunction(aComment, bComment))
    );
  }

  useEffect(() => {
    const additionalDifference = getDifference(
      allComments,
      sortedAllComments,
      isSameComment
    );
    const removalDifference = getDifference(
      sortedAllComments,
      allComments,
      isSameComment
    );
    const likeDifference = getDifference(
      allComments,
      sortedAllComments,
      isSameLikedComment
    );

    const updateDifference = getDifference(
      allComments,
      sortedAllComments,
      isSameCommentContent
    );

    additionalDifference.map((differentComment) => {
      let newComments;
      if (posting) {
        newComments = sortedAllComments.unshift(differentComment);
      } else {
        newComments = sortedAllComments.push(differentComment);
      }
      setPosting(false);
      setSortedAllComments(newComments);
    });

    removalDifference.map((differentComment) => {
      const newComments = sortedAllComments.filter(
        (comment) => comment.id !== differentComment.id
      );
      setSortedAllComments(newComments);
    });

    likeDifference.map((differentComment) => {
      const newComments = sortedAllComments.map((comment) =>
        comment.id === differentComment.id
          ? {
              ...comment,
              likes: [...differentComment.likes],
              numOfLikes: parseInt(differentComment.numOfLikes),
            }
          : comment
      );
      setSortedAllComments(newComments);
    });

    updateDifference.map((differentComment) => {
      const newComments = sortedAllComments.map((comment) =>
        comment.id === differentComment.id
          ? {
              ...comment,
              comment: differentComment.comment,
            }
          : comment
      );
      setSortedAllComments(newComments);
    });
  }, [allComments]);

  async function getComments() {
    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef,
      orderBy("timestamp", "desc"),
      where("ideaId", "==", id)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setAllComments(
        sortComments(
          querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        )
      );
    });
    return unsubscribe;
  }

  async function handleAddComment(id) {
    try {
      if (message.length === 0 || message.length > 300) {
        errorModal("Invalid post. Please check again.");
        return;
      } else {
        setPosting(true);
        const commentsRef = collection(db, "comments");
        await addDoc(commentsRef, {
          comment: message,
          ideaId: id,
          userId: user?.uid,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
          timestamp: serverTimestamp(),
          edited: false,
          likes: [],
          numOfLikes: 0,
        });
        setMessage("");
        setShowSubmit(false);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const debouncedHandleAddComment = debounce(handleAddComment, 300);

  function handleEnterPress(e) {
    if (e.keyCode === 13 && !e.shift && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      debouncedHandleAddComment(id);
    }
  }

  return (
    <div className={styles.commentsSection}>
      <h2
        className={styles.commentTitle}
      >{`All comments (${allComments.length})`}</h2>
      {user && (
        <form className={styles.commentForm}>
          <div className={styles.commentInput}>
            <img
              className={styles.commentUser}
              src={user?.photoURL}
              onClick={() => {
                route.push("/profile");
                dispatch(setLoadingPage(true));
              }}
            />
            <textarea
              type="text"
              placeholder="Add a comment..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                e.target.style.height = "inherit";
                e.target.style.height = `${e.target.scrollHeight}px`;
                if (!e.target.value) {
                  setShowSubmit(false);
                }
              }}
              onFocus={() => {
                setShowSubmit(true);
              }}
              className={styles.commentTextArea}
              onKeyDown={handleEnterPress}
            />
          </div>
          {showSubmit && (
            <div className={styles.commentSubmit}>
              <p
                className={`${styles.textCount} ${
                  message.length ? styles.textShowCount : ""
                } ${message.length > 300 ? styles.textOverCount : ""} `}
              >
                {message.length}/300
              </p>
              <div className={styles.commentButtons}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setMessage("");
                    setShowSubmit(false);
                  }}
                  className={styles.commentCancelButton}
                >
                  Cancel
                </button>
                <button
                  disabled={message.length === 0 || message.length > 300}
                  onClick={(e) => {
                    e.preventDefault();
                    debouncedHandleAddComment(id);
                  }}
                  className={styles.commentSubmitButton}
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </form>
      )}
      {sortedAllComments.slice(0, amountCommentsShown).map((comment) => (
        <div key={comment.id}>
          <Comment id={comment.id} {...comment} />
          <hr className={styles.commentLine} />
        </div>
      ))}
      {loadingIcon && amountCommentsShown < allComments.length && (
        <Lottie animationData={loader} className={styles.lottie} />
      )}
    </div>
  );
}

export default Comments;
