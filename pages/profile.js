import Link from "next/link";
import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import { db, auth } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setDropdown } from "../store/dropdown-slice";
import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
} from "firebase/firestore";
import Idea from "../components/Idea";

function Profile() {
  const [user, loading] = useAuthState(auth);
  const [myIdeas, setMyIdeas] = useState([]);
  const route = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user && !loading) {
      route.push("/");
    }
  }, [user, loading]);

  useEffect(() => {
    getMyIdeas();
  }, []);

  async function getMyIdeas(id) {
    const ideasRef = collection(db, "ideas");
    const q = query(
      ideasRef,
      orderBy("timestamp", "desc"),
      where("userId", "==", window.localStorage.getItem("userId"))
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMyIdeas(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    });
    return unsubscribe;
  }

  return (
    <>
      {loading || !user ? (
        <div>loading</div>
      ) : (
        <div
          onClick={() => {
            dispatch(setDropdown(false));
          }}
        >
          <Nav />
          <main>
            <div>
              <Link href={"/dashboard"}>
                <a>Back to Dashboard</a>
              </Link>
              <img src={user?.photoURL} />
              <h3>{user?.displayName}</h3>
              <p>{user?.email}</p>
            </div>
            <div>
              <h2>All my ideas</h2>
              {myIdeas?.map((idea) => (
                <Idea key={idea.id} {...idea} />
              ))}
            </div>
          </main>
        </div>
      )}
    </>
  );
}

export default Profile;
