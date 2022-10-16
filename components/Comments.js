import { useEffect, useState } from "react";
import { db, auth } from "../utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Comment from "./Comment";
import { debounce } from "../functions/debounce";
import { errorModal } from "../functions/errorModal";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Comments({ id, allComments }) {
  const [message, setMessage] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const [sortedAllComments, setSortedAllComments] = useState(
    sortComments(allComments)
  );

  function sortComments(comments) {
    return comments.sort((a, b) => b.numOfLikes - a.numOfLikes);
  }

  function isSameComment(a, b) {
    return a.id === b.id;
  }

  function isSameLikedComment(a, b) {
    return a.id === b.id && a.numOfLikes === b.numOfLikes;
  }

  function getDifference(a, b, compareFunction) {
    return a.filter(
      (acomment) => !b.some((bcomment) => compareFunction(acomment, bcomment))
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

    additionalDifference.map((differentComment) => {
      const newComments = sortedAllComments.unshift(differentComment);
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
              numOfLikes: differentComment.numOfLikes,
            }
          : comment
      );
      setSortedAllComments(newComments);
    });
  }, [allComments]);

  async function handleAddComment(id) {
    try {
      if (message.length === 0 || message.length > 300) {
        errorModal("Invalid post. Please check again.");
        return;
      } else {
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
      }
    } catch (error) {
      console.log(error);
    }
  }

  const debouncedHandleAddComment = debounce(handleAddComment, 300);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          debouncedHandleAddComment(id);
        }}
      >
        <input
          type="text"
          placeholder="tell me what you think"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <p>{message.length}/300</p>
        <button
          type="submit"
          disabled={message.length === 0 || message.length > 300}
        >
          Submit
        </button>
      </form>
      {sortedAllComments.map((comment) => (
        <Comment key={comment.id} id={comment.id} {...comment} />
      ))}
      <ToastContainer
        position="top-center"
        autoClose={1500}
        limit={5}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
      />
    </div>
  );
}

export default Comments;
