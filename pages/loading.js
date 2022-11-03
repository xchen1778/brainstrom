import { useRouter } from "next/router";
import { useEffect } from "react";
import Loading from "../components/Loading";

function LoadingPage() {
  const route = useRouter();
  const { uId, uName, uPic } = route.query;

  useEffect(() => {
    window.localStorage.setItem("uId", undefined);
    if (uId) {
      setTimeout(() => {
        route.push({
          pathname: "/profile",
          query: { uId, uName, uPic },
        });
      }, 100);
    }
  }, []);

  return <Loading />;
}

export default LoadingPage;
