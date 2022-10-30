import loader from "../public/loader.json";
import Lottie from "lottie-react";
import styles from "../styles/Loading.module.scss";

function Loading() {
  return (
    <div className={styles.loadingPage}>
      <Lottie animationData={loader} className={styles.loadingIcon} />
    </div>
  );
}

export default Loading;
