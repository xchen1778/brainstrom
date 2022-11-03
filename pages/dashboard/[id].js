import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { setLoadingPage } from "../../store/loadingPage-slice";
import { setScrollUp } from "../../store/scrollUp-slice";
import { setDropdown } from "../../store/dropdown-slice";
import Nav from "../../components/Nav";
import Head from "next/head";
import Idea from "../../components/Idea";
import { db } from "../../utils/firebase";
import Comments from "../../components/Comments";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import styles from "../../styles/IdeaDetails.module.scss";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollUp from "../../components/ScrollUp";
import { HiArrowLeft } from "react-icons/hi";
import Loading from "../../components/Loading";

function IdeaDetails({ id }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const scrollUp = useSelector((store) => store.scrollUp);
  const loadingPage = useSelector((store) => store.loadingPage);
  const [thisIdea, setThisIdea] = useState({});
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("uId", undefined);
    dispatch(setScrollUp(false));
    async function getThisIdea() {
      const ideaRef = doc(db, "ideas", id);
      const unsubscribe = onSnapshot(ideaRef, (doc) => {
        setThisIdea({ ...doc.data() });
        setIsAuthor(
          doc.data()?.userId === window.localStorage.getItem("userId")
        );
      });
      return unsubscribe;
    }
    getThisIdea();
    dispatch(setLoadingPage(false));
    dispatch(setDropdown(false));
    document.addEventListener("scroll", () => {
      if (window.pageYOffset > 400) {
        dispatch(setScrollUp(true));
      } else {
        dispatch(setScrollUp(false));
      }
    });
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

  return (
    <div
      className={styles.ideaDetails}
      onClick={() => {
        dispatch(setDropdown(false));
      }}
    >
      <Head>
        <title>Idea | Brainstorm</title>
      </Head>
      <Nav />
      <div
        className={styles.backToDashboard}
        onClick={() => {
          dispatch(setLoadingPage(true));
          router.push("/dashboard");
        }}
      >
        <span className={styles.backToDashboardContent}>
          <HiArrowLeft />
          Dashboard
        </span>
      </div>
      <Idea
        {...thisIdea}
        id={id}
        isAuthor={isAuthor}
        ideaPage={true}
        className={styles.idea}
      />
      <hr />
      <Comments id={id} />
      {scrollUp && <ScrollUp />}
      {loadingPage && <Loading />}
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

export default IdeaDetails;

export const getStaticPaths = async () => {
  const ideasRef = collection(db, "ideas");
  const ideasSnap = await getDocs(ideasRef);
  const paths = ideasSnap.docs.map((doc) => {
    return { params: { id: doc.id } };
  });
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async (context) => {
  const id = context.params.id;
  return {
    props: { id },
  };
};
