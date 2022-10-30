import { IoIosArrowUp } from "react-icons/io";
import styles from "../styles/ScrollUp.module.scss";

function ScrollUp() {
  return (
    <div
      className={styles.scrollUp}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <IoIosArrowUp />
    </div>
  );
}

export default ScrollUp;
