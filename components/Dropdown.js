import { useRouter } from "next/router";
import { auth } from "../utils/firebase";

function Dropdown() {
  const route = useRouter();
  return (
    <div className="flex flex-col">
      <button
        onClick={() => {
          route.push("/profile");
        }}
      >
        Profile
      </button>
      <button
        onClick={() => {
          auth.signOut();
          window.localStorage.removeItem("userId");
          route.push("/");
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

export default Dropdown;
