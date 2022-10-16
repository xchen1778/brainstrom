import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { db, auth } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDispatch } from "react-redux";
import { setDropdown } from "../store/dropdown-slice";
import { useRouter } from "next/router";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { errorModal } from "../functions/errorModal";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Idea from "../components/Idea";
import { debounce } from "../functions/debounce";

function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const dispatch = useDispatch();
  const route = useRouter();
  const [idea, setIdea] = useState("");
  const [allIdeas, setAllIdeas] = useState([]);

  useEffect(() => {
    if (!user && !loading) {
      route.push("/");
    } else if (user) {
      window.localStorage.setItem("userId", user.uid);
    }
  }, [user, loading]);

  useEffect(() => {
    getAllIdeas();
  }, []);

  async function getAllIdeas() {
    const ideasRef = collection(db, "ideas");
    const q = query(ideasRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setAllIdeas(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    });
    return unsubscribe;
  }

  async function handleAddIdea() {
    try {
      if (idea.length === 0 || idea.length > 300) {
        errorModal("Invalid post. Please check again.");
        return;
      } else {
        const ideasRef = collection(db, "ideas");
        await addDoc(ideasRef, {
          idea: idea,
          userId: user.uid,
          photoURL: user.photoURL,
          displayName: user.displayName,
          timestamp: serverTimestamp(),
          edited: false,
          likes: [],
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

  return (
    <div
      onClick={() => {
        dispatch(setDropdown(false));
      }}
    >
      <Nav />
      <main>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            debouncedHandleAddIdea();
          }}
        >
          <textarea
            placeholder="What's your idea?"
            className="bg-red-500"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={handleEnterPress}
          ></textarea>
          <p className={idea.length > 300 ? "text-red-500" : ""}>
            {idea.length}/300
          </p>
          <button
            type="submit"
            disabled={idea.length === 0 || idea.length > 300}
          >
            Submit
          </button>
        </form>
        <div>
          <h2>See what other people are saying</h2>
          {allIdeas?.map((idea) => (
            <Idea key={idea.id} {...idea} />
          ))}
        </div>
      </main>
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

export default Dashboard;
