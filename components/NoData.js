import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setLoadingPage } from "../store/loadingPage-slice";
import styles from "../styles/Nodata.module.scss";

function NoData({ method }) {
  const route = useRouter();
  const dispatch = useDispatch();

  return (
    <div className={styles.noData}>
      <div className={styles.noDataMessage}>
        <h4 className={styles.noDataTitle}>No idea found.</h4>
        <p className={styles.noDataText}>You haven&apos;t {method} any idea.</p>
      </div>
      <button
        className={styles.noDataButton}
        onClick={() => {
          route.push("/dashboard");
          dispatch(setLoadingPage(true));
        }}
      >
        Dashboard
      </button>
    </div>
  );
}

export default NoData;
