import Head from "next/head";
import { useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
} from "firebase/auth";
import { auth } from "../utils/firebase";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Home() {
  const route = useRouter();
  const [user, loading] = useAuthState(auth);
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  const twitterProvider = new TwitterAuthProvider();

  async function googleLogin() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      route.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  async function facebookLogin() {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      route.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  async function twitterLogin() {
    try {
      const result = await signInWithPopup(auth, twitterProvider);
      route.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (user && !loading) {
      route.push("/dashboard");
    }
  }, [user, loading]);

  return (
    <>
      {loading || user ? (
        <div>loading</div>
      ) : (
        <div>
          <Head>
            <title>Sign In | Brainstorm</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main>
            <h1>Brainstorm</h1>
            <button onClick={googleLogin}>Sign In with Google</button>
            <button onClick={facebookLogin}>Sign In with Facebook</button>
            <button onClick={twitterLogin}>Sign In with Twitter</button>
          </main>
        </div>
      )}
    </>
  );
}
