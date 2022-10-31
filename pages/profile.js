import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import { db, auth } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { setDropdown } from "../store/dropdown-slice";
import { setLoadingPage } from "../store/loadingPage-slice";
import ScrollUp from "../components/ScrollUp";
import Loading from "../components/Loading";
import { errorModal } from "../functions/errorModal";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  startAfter,
  limit,
  updateDoc,
} from "firebase/firestore";
import Idea from "../components/Idea";
import { deleteUser, updateEmail, updateProfile } from "firebase/auth";
import Blackscreen from "../components/Blackscreen";
import styles from "../styles/Profile.module.scss";
import { HiArrowLeft } from "react-icons/hi";
import { FaGoogle, FaFacebookF, FaTwitter, FaGithub } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { animated, useTransition } from "react-spring";
import loader from "../public/loader.json";
import Lottie from "lottie-react";
import { setScrollUp } from "../store/scrollUp-slice";
import NoData from "../components/NoData";
import { IoCamera } from "react-icons/io5";
import { storage } from "../utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function Profile() {
  const [user, loading] = useAuthState(auth);
  const [myIdeas, setMyIdeas] = useState([]);
  const [showMyIdeas, setShowMyIdeas] = useState(true);
  const [latestMyIdeas, setLatestMyIdeas] = useState(0);
  const [endMyIdeas, setEndMyIdeas] = useState(false);
  const [likedIdeas, setLikedIdeas] = useState([]);
  const [showLikedIdeas, setShowLikedIdeas] = useState(false);
  const [amountLikedIdeas, setAmountLikedIdeas] = useState(10);
  const [commentedIdeas, setCommentedIdeas] = useState([]);
  const [showCommentedIdeas, setShowCommentedIdeas] = useState(false);
  const [amountCommentedIdeas, setAmountCommentedIdeas] = useState(10);
  const [editOn, setEditOn] = useState(false);
  const [changeName, setChangeName] = useState("");
  const [changeEmail, setChangeEmail] = useState("");
  const [signInViaEmail, setSignInViaEmail] = useState(false);
  const [deleteOn, setDeleteOn] = useState(false);
  const route = useRouter();
  const dispatch = useDispatch();
  const loadingPage = useSelector((store) => store.loadingPage);
  const transitionDelete = useTransition(deleteOn, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });
  const [loadingIcon, setLoadingIcon] = useState(false);
  const [loadingIdeaIcon, setLoadingIdeaIcon] = useState(false);
  const [showChangeProfile, setShowChangeProfile] = useState(false);
  const scrollUp = useSelector((store) => store.scrollUp);

  useEffect(() => {
    if (!user && !loading) {
      route.push("/");
      dispatch(setLoadingPage(true));
    }
  }, [user, loading]);

  useEffect(() => {
    getFirstMyIdeas();
    getLikedIdeas();
    getCommentedIdeas();
    dispatch(setLoadingPage(false));
    dispatch(setScrollUp(false));
    document.addEventListener("scroll", () => {
      if (window.pageYOffset > 400) {
        dispatch(setScrollUp(true));
      } else {
        dispatch(setScrollUp(false));
      }
    });
    setLoadingIcon(true);
    setTimeout(() => {
      setLoadingIcon(false);
    }, 1000);
  }, []);

  useEffect(() => {
    document.addEventListener("scroll", handleMyIdeasScroll);
  }, [latestMyIdeas]);

  useEffect(() => {
    if (editOn) {
      document.querySelector("#changeName").focus();
    }
  }, [editOn]);

  async function getFirstMyIdeas() {
    const ideasRef = collection(db, "ideas");
    const q = query(
      ideasRef,
      orderBy("timestamp", "desc"),
      where("userId", "==", window.localStorage.getItem("userId")),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMyIdeas(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
      setLatestMyIdeas(querySnapshot.docs[querySnapshot.docs.length - 1]);
    });
    return unsubscribe;
  }

  async function getMyIdeas() {
    if (endMyIdeas === false) {
      const ideasRef = collection(db, "ideas");
      const q = query(
        ideasRef,
        orderBy("timestamp", "desc"),
        where("userId", "==", window.localStorage.getItem("userId")),
        startAfter(latestMyIdeas),
        limit(10)
      );
      const allLoadedMyIdeas = [];
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (querySnapshot.docs.length === 0) {
          setEndMyIdeas(true);
        } else {
          allLoadedMyIdeas = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setMyIdeas([...myIdeas, ...allLoadedMyIdeas]);
          setLatestMyIdeas(querySnapshot.docs[querySnapshot.docs.length - 1]);
        }
      });
      return unsubscribe;
    }
  }

  async function getLikedIdeas() {
    const ideasRef = collection(db, "ideas");
    const q = query(ideasRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setLikedIdeas(
        querySnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .filter((idea) =>
            idea.likes.some(
              (like) => like === window.localStorage.getItem("userId")
            )
          )
      );
    });
    return unsubscribe;
  }

  async function getCommentedIdeas() {
    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef,
      orderBy("timestamp", "desc"),
      where("userId", "==", window.localStorage.getItem("userId"))
    );
    const querySnapshot = await getDocs(q);
    const allCommentedIdeas = Array.from(
      new Set(querySnapshot.docs.map((doc) => doc.data().ideaId))
    );

    const allLoadedCommentedIdeas = [];
    allCommentedIdeas.map(async (ideaId) => {
      const ideaRef = doc(db, "ideas", ideaId);
      const ideaSnap = await getDoc(ideaRef);
      if (!commentedIdeas.some((idea) => idea.id === ideaSnap.id)) {
        allLoadedCommentedIdeas.push({ ...ideaSnap.data(), id: ideaId });
      }
      setCommentedIdeas([...commentedIdeas, ...allLoadedCommentedIdeas]);
    });
  }

  function handleMyIdeasScroll() {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      endMyIdeas === false
    ) {
      setLoadingIdeaIcon(true);
      setTimeout(() => {
        latestMyIdeas && getMyIdeas();
        setLoadingIdeaIcon(false);
      }, 1000);
    }
  }

  function handleLikedIdeasScroll() {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      amountLikedIdeas < likedIdeas.length
    ) {
      setLoadingIdeaIcon(true);
      setTimeout(() => {
        setAmountLikedIdeas((amount) => amount + 10);
        setLoadingIdeaIcon(false);
      }, 1000);
    }
  }

  function handleCommentedIdeasScroll() {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      amountCommentedIdeas < commentedIdeas.length
    ) {
      setLoadingIdeaIcon(true);
      setTimeout(() => {
        setAmountCommentedIdeas((amount) => amount + 10);
        setLoadingIdeaIcon(false);
      }, 1000);
    }
  }

  function determineService(url) {
    if (url) {
      if (url.includes("googleusercontent")) {
        return (
          <div className={styles.userSignIn}>
            Signed in via {<FaGoogle className={styles.brandIcon} />}
          </div>
        );
      } else if (url.includes("facebook")) {
        return (
          <div className={styles.userSignIn}>
            Signed in via {<FaFacebookF />}
          </div>
        );
      } else if (url.includes("twimg")) {
        return (
          <div className={styles.userSignIn}>Signed in via {<FaTwitter />}</div>
        );
      } else if (url.includes("github")) {
        return (
          <div className={styles.userSignIn}>Signed in via {<FaGithub />}</div>
        );
      } else {
        setSignInViaEmail(true);
        return;
      }
    }
  }

  async function handleUpdate() {
    console.log("run");
    try {
      if (changeName.trim().length === 0) {
        errorModal("Sorry, name can't be empty.");
        throw "Sorry, name can't be empty.";
      } else if (changeName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: changeName });

        //find all ideas and change the displayName
        const ideasRef = collection(db, "ideas");
        const q1 = query(
          ideasRef,
          where("userId", "==", window.localStorage.getItem("userId"))
        );
        const ideasSnap = await getDocs(q1);
        ideasSnap.forEach(async (idea) => {
          await updateDoc(doc(db, "ideas", idea.id), {
            displayName: changeName,
          });
        });

        //find all comments and change the displayName
        const commentsRef = collection(db, "comments");
        const q2 = query(
          commentsRef,
          where("userId", "==", window.localStorage.getItem("userId"))
        );
        const commentsSnap = await getDocs(q2);
        commentsSnap.forEach(async (comment) => {
          await updateDoc(doc(db, "comments", comment.id), {
            displayName: changeName,
          });
        });
      }
      if (changeEmail !== user.email) {
        await updateEmail(auth.currentUser, changeEmail);
      }
      setEditOn(false);
    } catch (error) {
      console.log(error);
      switch (error.code) {
        case "auth/email-already-in-use":
          errorModal("There is already an account with this email address.");
          break;
        case "auth/invalid-email":
          errorModal("Please enter a valid email address.");
          break;
      }
    }
  }

  async function handleDelete() {
    dispatch(setLoadingPage(true));

    //delete all the ideas
    const q1 = query(collection(db, "ideas"), where("userId", "==", user.uid));
    const querySnapshot1 = await getDocs(q1);
    querySnapshot1.forEach(async (idea) => {
      await deleteDoc(doc(db, "ideas", idea.id));
    });

    //delete all the comments
    const q2 = query(
      collection(db, "comments"),
      where("userId", "==", user.uid)
    );
    const querySnapshot2 = await getDocs(q2);
    querySnapshot2.forEach(async (comment) => {
      await deleteDoc(doc(db, "comments", comment.id));
    });

    deleteUser(auth.currentUser);
    auth.signOut();
    route.push("/");
  }

  async function handleChange(e) {
    if (e.target.files[0] === null) return;
    if (e.target.files[0] !== null && e.target.files[0].size > 3145728) {
      errorModal("The image file is too big.");
      return;
    } else {
      const imageRef = ref(
        storage,
        `profiles/${window.localStorage.getItem("userId")})`
      );
      await uploadBytes(imageRef, e.target.files[0]);
      const url = await getDownloadURL(imageRef);
      updateProfile(auth.currentUser, {
        photoURL: url,
      });
      dispatch(setLoadingPage(true));
      window.location.reload(false);
    }
  }

  return (
    <div
      className={styles.profilePage}
      onClick={() => {
        dispatch(setDropdown(false));
      }}
    >
      <Nav isProfile={true} />
      <main className={styles.profileContent}>
        <section className={styles.userSection}>
          <div
            className={styles.backToDashboard}
            onClick={() => {
              dispatch(setLoadingPage(true));
              route.push("/dashboard");
            }}
          >
            <span className={styles.backToDashboardContent}>
              <HiArrowLeft />
              Dashboard
            </span>
          </div>

          <div className={styles.userInfo}>
            <div
              className={styles.userProfile}
              onMouseEnter={() => {
                signInViaEmail && setShowChangeProfile(true);
              }}
              onMouseLeave={() => {
                signInViaEmail && setShowChangeProfile(false);
              }}
            >
              <img src={user?.photoURL} className={styles.userProfilePic} />
              {signInViaEmail && (
                <div
                  className={`${styles.userChangeProfile} ${
                    showChangeProfile ? styles.userShowChangeProfile : ""
                  }`}
                >
                  <IoCamera className={styles.imageIcon} />
                  <input
                    accept="image/*"
                    type="file"
                    title=""
                    className={styles.imageInput}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
            {editOn ? (
              <form className={styles.changeForm}>
                <input
                  className={styles.changeName}
                  type="text"
                  placeholder="Name"
                  value={changeName}
                  onChange={(e) => setChangeName(e.target.value)}
                  id="changeName"
                />
                <input
                  className={styles.changeEmail}
                  type="text"
                  placeholder="Email"
                  value={changeEmail}
                  onChange={(e) => setChangeEmail(e.target.value)}
                />
                <div className={styles.changeButtons}>
                  <button
                    className={styles.doneButton}
                    onClick={(e) => {
                      e.preventDefault();
                      handleUpdate();
                    }}
                  >
                    Done
                  </button>
                  <button
                    className={styles.cancelButton}
                    onClick={(e) => {
                      e.preventDefault();
                      setEditOn(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h3 className={styles.userName}>{user?.displayName}</h3>
                {signInViaEmail ? (
                  <>
                    <p className={styles.userEmail}>{user?.email}</p>
                    <button
                      className={styles.userEditButton}
                      onClick={() => {
                        setEditOn(true);
                        setChangeName(user.displayName);
                        setChangeEmail(user.email);
                      }}
                    >
                      <FaRegEdit />
                    </button>
                  </>
                ) : (
                  determineService(user?.photoURL)
                )}
                <button
                  className={`${styles.userDeleteButton} ${
                    signInViaEmail ? styles.buttonLeftSpace : ""
                  }`}
                  onClick={() => setDeleteOn(true)}
                >
                  <RiDeleteBinLine />
                </button>
              </div>
            )}

            {transitionDelete(
              (style, item) =>
                item && (
                  <animated.div style={style}>
                    <Blackscreen />
                    <div className={styles.deleteModal}>
                      <h4 className={styles.deleteTitle}>
                        Do you want to delete your account?
                      </h4>
                      <div className={styles.deleteButtons}>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete()}
                        >
                          Yes
                        </button>
                        <button onClick={() => setDeleteOn(false)}>No</button>
                      </div>
                    </div>
                  </animated.div>
                )
            )}
          </div>
        </section>
        <hr className={styles.sectionLine} />
        <section className={styles.ideasSection}>
          <div className={styles.ideasNavigator}>
            <button
              className={showMyIdeas ? styles.activeNavigator : ""}
              onClick={() => {
                setShowLikedIdeas(false);
                setShowCommentedIdeas(false);
                setShowMyIdeas(true);
              }}
            >
              My ideas
            </button>
            <button
              className={showLikedIdeas ? styles.activeNavigator : ""}
              onClick={() => {
                setShowMyIdeas(false);
                setShowCommentedIdeas(false);
                setShowLikedIdeas(true);
                document.addEventListener("scroll", handleLikedIdeasScroll);
              }}
            >
              Liked ideas
            </button>
            <button
              className={showCommentedIdeas ? styles.activeNavigator : ""}
              onClick={() => {
                setShowMyIdeas(false);
                setShowLikedIdeas(false);
                setShowCommentedIdeas(true);
                document.addEventListener("scroll", handleCommentedIdeasScroll);
              }}
            >
              Commented ideas
            </button>
          </div>

          <div className={styles.ideasContent}>
            {showMyIdeas &&
              (myIdeas.length ? (
                myIdeas.map((idea) => (
                  <Idea key={idea.id} {...idea} profilePage={true} />
                ))
              ) : loadingIcon ? (
                <Lottie animationData={loader} className={styles.lottie} />
              ) : (
                <NoData method={"posted"} />
              ))}
            {showLikedIdeas &&
              (likedIdeas.length ? (
                likedIdeas
                  .slice(0, amountLikedIdeas)
                  .map((idea) => (
                    <Idea key={idea.id} {...idea} profilePage={true} />
                  ))
              ) : loadingIcon ? (
                <Lottie animationData={loader} className={styles.lottie} />
              ) : (
                <NoData method={"liked"} />
              ))}
            {showCommentedIdeas &&
              (commentedIdeas.length ? (
                commentedIdeas
                  .slice(0, amountCommentedIdeas)
                  .map((idea) => (
                    <Idea key={idea.id} {...idea} profilePage={true} />
                  ))
              ) : loadingIcon ? (
                <Lottie animationData={loader} className={styles.lottie} />
              ) : (
                <NoData method={"commented on"} />
              ))}
          </div>
          {loadingIdeaIcon && !endMyIdeas && showMyIdeas && (
            <Lottie animationData={loader} className={styles.loadingIdea} />
          )}
          {loadingIdeaIcon &&
            amountLikedIdeas < likedIdeas.length &&
            showLikedIdeas && (
              <Lottie animationData={loader} className={styles.loadingIdea} />
            )}
          {loadingIdeaIcon &&
            amountCommentedIdeas < commentedIdeas.length &&
            showCommentedIdeas && (
              <Lottie animationData={loader} className={styles.loadingIdea} />
            )}
        </section>
      </main>
      {loadingPage && <Loading />}
      {scrollUp && <ScrollUp />}
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

export default Profile;
