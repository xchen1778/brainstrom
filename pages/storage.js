import { useState } from "react";
import { storage } from "../utils/firebase";

function storage() {
  const [imageUpload, setImageUpload] = useState(null);

  function uploadImage() {
    if (imageUpload === null) return;
  }

  return (
    <div>
      <input type="file" onChange={(e) => setImageUpload(e.target.files[0])} />
      <button onClick={uploadImage}>Upload</button>
    </div>
  );
}

export default storage;
