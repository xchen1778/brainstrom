import { useEffect, useState } from "react";
import { db, storage } from "../utils/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { errorModal } from "../functions/errorModal";
import { debounce } from "../functions/debounce";
import styles from "../styles/Editidea.module.scss";
import PostImage from "./PostImage";
import { v4 as uuidv4 } from "uuid";
import { AiFillPicture } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import uploading from "../public/uploading.json";
import Lottie from "lottie-react";
import { getDifference } from "../functions/getDifference";

function EditIdea({ id, idea, images, setEditOn }) {
  const [editIdea, setEditIdea] = useState(idea);
  const [imagesUrl, setImagesUrl] = useState(images);
  const [uploadIconOn, setUploadIconOn] = useState(false);
  const [postIconOn, setPostIconOn] = useState(false);

  useEffect(() => {
    const editIdeaTextArea = document.querySelector("#editIdeaTextArea");
    const end = editIdeaTextArea.value.length;
    editIdeaTextArea.setSelectionRange(end, end);
    editIdeaTextArea.focus();
  }, []);

  async function handleEdit(id) {
    try {
      if (editIdea.length === 0 || editIdea.length > 300) {
        errorModal("Sorry, your idea can't be empty.");
        return;
      } else {
        setPostIconOn(true);
        const ideaRef = doc(db, "ideas", id);
        await updateDoc(ideaRef, {
          idea: editIdea,
          timestamp: serverTimestamp(),
          edited: true,
          images: imagesUrl,
        });
        const removalDifference = getDifference(images, imagesUrl, isSameImage);
        removalDifference.forEach(async (difference) => {
          const imageRef = ref(storage, difference.path);
          await deleteObject(imageRef);
        });
        setEditOn(false);
        setPostIconOn(false);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const debouncedHandleEdit = debounce(handleEdit, 300);

  function handleEnterPress(e) {
    if (e.keyCode === 13 && !e.shift && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleEdit(id);
    }
  }

  async function handleUploadImage(e) {
    if (e.target.files[0] === null) return;
    if (e.target.files[0] !== null && e.target.files[0]?.size > 3145728) {
      errorModal("The image file is too big. Maximum size is 3Mb.");
      return;
    } else if (imagesUrl.length >= 4) {
      errorModal(
        "You reached the maximum amount of images. Maximum amount is 4."
      );
      return;
    } else {
      setUploadIconOn(true);
      const newImage = `ideas/${uuidv4()}`;
      const imageRef = ref(storage, newImage);
      await uploadBytes(imageRef, e.target.files[0]);
      const url = await getDownloadURL(imageRef);
      setImagesUrl((prev) => [...prev, { path: newImage, url: url }]);
      setUploadIconOn(false);
    }
  }

  function isSameImage(a, b) {
    return a.path === b.path && a.url === b.url;
  }

  async function handleCancel(e) {
    e.preventDefault();
    document.querySelector("#editIdeaTextArea").style.height = "inherit";
    setEditIdea(idea);
    const additionalDifference = getDifference(imagesUrl, images, isSameImage);
    additionalDifference.forEach(async (difference) => {
      const imageRef = ref(storage, difference.path);
      await deleteObject(imageRef);
    });
    setEditOn(false);
  }

  return (
    <form className={styles.editForm}>
      <div className={styles.editIdeaInputSection}>
        <div className={styles.editIdeaInput}>
          <textarea
            value={editIdea}
            onChange={(e) => {
              setEditIdea(e.target.value);
              e.target.style.height = "inherit";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={handleEnterPress}
            className={styles.editArea}
            id="editIdeaTextArea"
            autofocus
          ></textarea>

          {images?.length !== 0 && (
            <>
              <hr />
              <div className={styles.postIdeaPictures}>
                {imagesUrl?.map((image) => (
                  <PostImage
                    key={image.path}
                    path={image.path}
                    url={image.url}
                    setImagesUrl={setImagesUrl}
                    postIdea={false}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <button onClick={handleCancel} className={styles.editIdeaCancelIcon}>
          <IoClose />
        </button>
      </div>

      <div className={styles.editAction}>
        <p className={styles.editTextCount}>{editIdea.length}/300</p>
        <div className={styles.editButtons}>
          <button
            onClick={handleCancel}
            className={styles.editIdeaCancelButton}
          >
            Cancel
          </button>

          <button
            className={styles.pictureButton}
            disabled={imagesUrl.length >= 4}
          >
            <input
              accept="image/*"
              type="file"
              title={imagesUrl.length >= 4 ? "Maximum is 4" : ""}
              className={styles.imageInput}
              onChange={handleUploadImage}
              disabled={imagesUrl.length >= 4}
            />
            {uploadIconOn ? (
              <Lottie animationData={uploading} className={styles.uploading} />
            ) : (
              <AiFillPicture />
            )}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              debouncedHandleEdit(id);
            }}
            disabled={editIdea.length > 300}
            className={styles.editIdeaDoneButton}
          >
            {postIconOn ? (
              <Lottie animationData={uploading} className={styles.uploading} />
            ) : (
              "Done"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default EditIdea;
