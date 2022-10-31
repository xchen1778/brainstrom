import { useState } from "react";
import styles from "../styles/Postimage.module.scss";
import { IoClose } from "react-icons/io5";
import { storage } from "../utils/firebase";
import { ref, deleteObject } from "firebase/storage";

function PostImage({ path, url, setImagesUrl }) {
  const [hoverOn, setHoverOn] = useState(false);

  async function handleRemove() {
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
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
        <IoClose />
      </div>
    </div>
  );
}

export default PostImage;
