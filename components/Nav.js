import { useSelector, useDispatch } from "react-redux";
import { setDropdown } from "../store/dropdown-slice";
import Link from "next/link";
import { auth } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Dropdown from "./Dropdown";

function Nav() {
  const [user, loading] = useAuthState(auth);
  const dropdown = useSelector((store) => store.dropdown);
  const dispatch = useDispatch();

  return (
    <nav className="flex items-center">
      <Link href="/dashboard">
        <a>Brainstorm</a>
      </Link>
      <button
        onClick={(e) => {
          e.stopPropagation();
          dispatch(setDropdown(true));
        }}
      >
        <img src={user?.photoURL} />
      </button>
      {dropdown && <Dropdown />}
    </nav>
  );
}

export default Nav;
