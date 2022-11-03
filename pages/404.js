import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import styles from "../styles/NotFound.module.scss";

function NotFound() {
  const route = useRouter();

  useEffect(() => {
    window.localStorage.setItem("uId", undefined);
    setTimeout(() => {
      route.back();
    }, 1000);
  }, []);

  return (
    <div className={styles.notFoundPage}>
      <Head>
        <title>404 Not Found | Brainstorm</title>
      </Head>
      <nav className={styles.nav}>
        <a
          className={styles.logoLink}
          onClick={() => {
            if (!user) {
              dispatch(setLoadingPage(true));
              route.push("/");
            } else {
              if (!isDashboard) {
                dispatch(setLoadingPage(true));
                route.push("/dashboard");
              }
            }
          }}
        >
          <img className={styles.logo} src="/brainstorm-logo.png" />
        </a>
      </nav>
      <div className={styles.notFoundText}>
        <h1 className={styles.notFoundTitle}>oops!</h1>
        <p className={styles.notFoundContent}>No idea found here.</p>
      </div>
    </div>
  );
}

export default NotFound;
