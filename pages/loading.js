import { useRouter } from "next/router";
import { useEffect } from "react";
import Loading from "../components/Loading";

function loading() {
  const route = useRouter();
  const { uId, uName, uPic } = route.query;

  useEffect(() => {
    if (uId && uName && uPic) {
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

export default loading;
