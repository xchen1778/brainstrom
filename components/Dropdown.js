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
        Your Ideas
      </button>
      <button
        onClick={() => {
          auth.signOut();
          route.push("/");
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

export default Dropdown;
