import { useEffect, useState } from "react";
import styles from "../styles/Postimage.module.scss";
import { IoCloseOutline } from "react-icons/io5";
import { storage } from "../utils/firebase";
import { ref, deleteObject } from "firebase/storage";

function PostImage({ path, url, setImagesUrl, postIdea }) {
  const [hoverOn, setHoverOn] = useState(false);

  async function handleRemove() {
    if (postIdea) {
      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
    }
    setImagesUrl((prev) => prev.filter((image) => image.path !== path));
  }

  return (
    <div
      className={styles.postIdea}
      onMouseEnter={() => {
        setHoverOn(true);
      }}
      onMouseLeave={() => {
        setHoverOn(false);
      }}
      onClick={handleRemove}
    >
      <img className={styles.postIdeaPicture} src={url} />
      <div
        className={`${styles.postIdeaPictureHover} ${
          hoverOn ? styles.showPostIdeaPictureHover : ""
        }`}
      >
        <IoCloseOutline />
      </div>
    </div>
  );
}

export default PostImage;
