import { useEffect, useState, memo } from "react";
import Nav from "../../components/Nav";
import { db, auth } from "../../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSelector, useDispatch } from "react-redux";
import { setDropdown } from "../../store/dropdown-slice";
import { setLoadingPage } from "../../store/loadingPage-slice";
import { setScrollUp } from "../../store/scrollUp-slice";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  limit,
  startAfter,
} from "firebase/firestore";
import { errorModal } from "../../functions/errorModal";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Idea from "../../components/Idea";
import { debounce } from "../../functions/debounce";
import styles from "../../styles/Dashboard.module.scss";
import Masonry from "react-masonry-css";
import loader from "../../public/loader.json";
import Lottie from "lottie-react";
import { useRouter } from "next/router";
import Loading from "../../components/Loading";
import ScrollUp from "../../components/ScrollUp";

function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const loadingPage = useSelector((store) => store.loadingPage);
  const dispatch = useDispatch();
  const scrollUp = useSelector((store) => store.scrollUp);
  const [idea, setIdea] = useState("");
  const [allIdeas, setAllIdeas] = useState([]);
  const [allDisplayIdeas, setAllDisplayIdeas] = useState([]);
  const [posting, setPosting] = useState(false);
  const [loadingIcon, setLoadingIcon] = useState(false);
  const [latestDoc, setLatestDoc] = useState(0);
  const [endIdeas, setEndIdeas] = useState(false);
  const breakpointColumnsObj = {
    default: 3,
    900: 2,
    600: 1,
  };
  const route = useRouter();

  function isSameIdea(a, b) {
    return a.id === b.id;
  }

  function isSameLikedIdea(a, b) {
    return a.id === b.id && a.numOfLikes === b.numOfLikes;
  }

  function getDifference(a, b, compareFunction) {
    return a.filter(
      (aIdea) => !b.some((bIdea) => compareFunction(aIdea, bIdea))
    );
  }

  useEffect(() => {
    const additionalDifference = getDifference(
      allIdeas,
      allDisplayIdeas,
      isSameIdea
    );

    const removalDifference = getDifference(
      allDisplayIdeas,
      allIdeas,
      isSameIdea
    );
    const likeDifference = getDifference(
      allIdeas,
      allDisplayIdeas,
      isSameLikedIdea
    );

    additionalDifference.map((differentIdea) => {
      let newIdeas;
      if (posting) {
        newIdeas = allDisplayIdeas.unshift(differentIdea);
      } else {
        newIdeas = allDisplayIdeas.push(differentIdea);
      }
      setPosting(false);
      setAllDisplayIdeas(newIdeas);
    });

    removalDifference.map((differentIdea) => {
      const newIdeas = allDisplayIdeas.filter(
        (idea) => idea.id !== differentIdea.id
      );
      setAllDisplayIdeas(newIdeas);
    });

    likeDifference.map((differentIdea) => {
      const newIdeas = allDisplayIdeas.map((idea) =>
        idea.id === differentIdea.id
          ? {
              ...idea,
              likes: [...differentIdea.likes],
              numOfLikes: differentIdea.numOfLikes,
            }
          : idea
      );
      setAllDisplayIdeas(newIdeas);
    });
  }, [allIdeas]);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem("userId", user.uid);
    }
  }, [user, loading]);

  useEffect(() => {
    dispatch(setLoadingPage(false));
    dispatch(setScrollUp(false));
    getFirstIdeas();
    document.addEventListener("click", () => {
      dispatch(setDropdown(false));
    });
    document.addEventListener("scroll", () => {
      if (window.pageYOffset > 400) {
        dispatch(setScrollUp(true));
      } else {
        dispatch(setScrollUp(false));
      }
    });
    dispatch(setDropdown(false));
  }, []);

  useEffect(() => {
    document.addEventListener("scroll", handleScroll);
    const scrollUpButton = document.querySelector("#scrollUp");
    scrollUpButton && (scrollUpButton.style.zIndex = 10);
  }, [latestDoc]);

  async function getFirstIdeas() {
    const ideasRef = collection(db, "ideas");
    const q = query(ideasRef, orderBy("timestamp", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setAllIdeas(
        querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
      setLatestDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
    });
    return unsubscribe;
  }

  async function getIdeas() {
    if (endIdeas === false) {
      const ideasRef = collection(db, "ideas");
      const q = query(
        ideasRef,
        orderBy("timestamp", "desc"),
        startAfter(latestDoc),
        limit(10)
      );
      const allLoadedIdeas = [];
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (querySnapshot.docs.length === 0) {
          setEndIdeas(true);
        } else {
          allLoadedIdeas = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setAllIdeas([...allIdeas, ...allLoadedIdeas]);
          setLatestDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        }
      });
      return unsubscribe;
    }
  }

  async function handleAddIdea() {
    try {
      if (idea.length === 0 || idea.length > 300) {
        errorModal("Invalid post. Please check again.");
        return;
      } else {
        setPosting(true);
        const ideasRef = collection(db, "ideas");
        await addDoc(ideasRef, {
          idea: idea,
          userId: user.uid,
          photoURL: user.photoURL,
          displayName: user.displayName,
          timestamp: serverTimestamp(),
          edited: false,
          likes: [],
          numOfLikes: 0,
        });
        setIdea("");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const debouncedHandleAddIdea = debounce(handleAddIdea, 300);

  function handleEnterPress(e) {
    if (e.keyCode === 13 && !e.shift && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      debouncedHandleAddIdea();
    }
  }

  function handleScroll() {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      endIdeas === false
    ) {
      setLoadingIcon(true);
      setTimeout(() => {
        latestDoc && getIdeas();
        setLoadingIcon(false);
      }, 1000);
    }
  }

  const postIdeaForm = (
    <>
      <form
        className={styles.postIdeaForm}
        onSubmit={(e) => {
          e.preventDefault();
          debouncedHandleAddIdea();
        }}
      >
        <div className={styles.postIdeaInput}>
          <img
            className={styles.postUser}
            src="https://i.ibb.co/dbBcVSW/profile-picture.png"
            onClick={() => {
              route.push("/profile");
            }}
          />
          <textarea
            id="postIdeaTextArea"
            placeholder="What's your bright idea?"
            className={styles.postIdeaArea}
            value={idea}
            rows="3"
            onChange={(e) => {
              setIdea(e.target.value);
              e.target.style.height = "inherit";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={handleEnterPress}
          ></textarea>
        </div>
        <div className={styles.postIdeaSubmitArea}>
          <p
            className={`${styles.textCount} ${
              idea.length ? styles.textShowCount : ""
            } ${idea.length > 300 ? styles.textOverCount : ""} `}
          >
            {idea.length}/300
          </p>

          <div className={styles.postIdeaButtons}>
            {idea && (
              <button
                className={styles.postIdeaCancelButton}
                onClick={(e) => {
                  e.preventDefault();
                  setIdea("");
                  document.querySelector("#postIdeaTextArea").style.height =
                    "inherit";
                }}
              >
                Cancel
              </button>
            )}
            <button
              className={styles.postIdeaSubmitButton}
              type="submit"
              disabled={idea.length === 0 || idea.length > 300}
            >
              Post
            </button>
          </div>
        </div>
      </form>
      <hr />
    </>
  );

  return (
    <div
      onClick={() => {
        dispatch(setDropdown(false));
      }}
      className={styles.dashboard}
    >
      <Nav isDashboard={true} />
      <main>
        {user && postIdeaForm}
        <div className={styles.latestIdeas} id="latestIdeas">
          {user && <h2 className={styles.latestIdeasTitle}>Latest Ideas</h2>}
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {allDisplayIdeas?.map((idea) => (
              <div
                className={styles.idea}
                onClick={() => dispatch(setLoadingPage(true))}
                key={idea.id}
              >
                <Idea {...idea} ideaPage={false} />
              </div>
            ))}
          </Masonry>
          {loadingIcon && !endIdeas && (
            <Lottie animationData={loader} className={styles.lottie} />
          )}
        </div>
      </main>
      {loadingPage && <Loading />}
      {scrollUp && (
        <div id="scrollUp">
          <ScrollUp />
        </div>
      )}
      <ToastContainer
        position="top-center"
        autoClose={2000}
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
        toastStyle={{ backgroundColor: "#206BFF" }}
      />
    </div>
  );
}

export default memo(Dashboard);
