import { useSelector, useDispatch } from "react-redux";
import { setDropdown } from "../store/dropdown-slice";
import Link from "next/link";
import { auth } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Dropdown from "./Dropdown";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useRouter } from "next/router";
import styles from "../styles/Nav.module.scss";
import { animated, useTransition } from "react-spring";

function Nav() {
  const [user, loading] = useAuthState(auth);
  const dropdown = useSelector((store) => store.dropdown);
  const dispatch = useDispatch();
  const route = useRouter();
  const transitionUser = useTransition(dropdown, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return (
    <div className={styles.topNav}>
      <nav className={styles.nav}>
        <Link href={"/"}>
          <a className={styles.logoLink}>
            <img className={styles.logo} src="/brainstorm-logo.png" />
          </a>
        </Link>
        {user ? (
          <button
            className={styles.userProfile}
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setDropdown(!dropdown));
            }}
          >
            <img className={styles.userPhoto} src={user?.photoURL} />
            {dropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </button>
        ) : (
          <button
            onClick={() => route.push("/")}
            className={styles.signInUpButton}
          >
            Sign in / up
          </button>
        )}
      </nav>
      {transitionUser(
        (style, item) =>
          item && (
            <animated.div style={style}>
              <Dropdown />
            </animated.div>
          )
      )}
    </div>
  );
}

export default Nav;
