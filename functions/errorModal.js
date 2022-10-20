import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

function errorModal(message) {
  toast.error(message, {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  });
}

export { errorModal };
