import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { auth } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDispatch } from "react-redux";
import { setDropdown } from "../store/dropdown-slice";
import { useRouter } from "next/router";

function dashboard() {
  const [user, loading] = useAuthState(auth);
  const dispatch = useDispatch();
  const route = useRouter();
  const [idea, setIdea] = useState("");

  useEffect(() => {
    console.log(user);
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
            <form>
              <textarea
                placeholder="What's your idea?"
                className="bg-red-500"
                velue={idea}
                onChange={(e) => setIdea(e.target.value)}
              ></textarea>
              <p className={idea.length > 300 ? "text-red-500" : ""}>
                {idea.length}/300
              </p>
              <button>Submit</button>
            </form>
          </main>
        </div>
      )}
    </>
  );
}

export default dashboard;
