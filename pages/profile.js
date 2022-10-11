import Link from "next/link";
import { useEffect } from "react";
import Nav from "../components/Nav";
import { auth } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setDropdown } from "../store/dropdown-slice";

function profile() {
  const [user, loading] = useAuthState(auth);
  const route = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user && !loading) {
      route.push("/");
    }
  }, [user, loading]);

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
              <h2>Your ideas</h2>
              <div>All the posts</div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}

export default profile;
