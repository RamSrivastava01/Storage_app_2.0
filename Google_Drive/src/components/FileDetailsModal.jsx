import { useEffect } from "react";

function formatFileSize(bytes) {
   if (bytes === 0) return "0 Bytes";
   if (!Number.isFinite(bytes) || bytes < 0) return "Unavailable";

   const units = ["Bytes", "KB", "MB", "GB", "TB"];
   const unitIndex = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1,
   );
   const size = bytes / 1024 ** unitIndex;
   return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function FileDetailsModal({ file, onClose }) {
   // const [details, setDetails] = useState({
   //    path: "/",
   //    size: 0,
   //    createdAt: "",
   //    updatedAt: "",
   //    numberOfFiles: "",
   //    numberOfFolders: "",
   // });
   console.log({ file });

   //TODO: has to complete the file modal in the context with setting the file in the frontend;
   useEffect(() => {
      function handleKeyDown(event) {
         if (event.key === "Escape") onClose();
      }

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
   }, [onClose]);

   function formatDate(dateValue) {
      if (!dateValue) return "Not available";
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
   }

   return (
      <div className="modal-overlay" onClick={onClose}>
         <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
         >
            <h2>File details</h2>
            <p>
               <strong>Name:</strong> {file.name}
            </p>
            <p>
               <strong>Size:</strong> {formatFileSize(file.size)}
            </p>
            <p>
               <strong>Type:</strong> {file.extension || file.name.split(".").pop()}
            </p>
            <p>
               <strong>Created:</strong> {formatDate(file.createdAt)}
            </p>
            <p>
               <strong>Last Modified:</strong> {formatDate(file.updatedAt)}
            </p>
            <div className="modal-buttons">
               <button
                  className="secondary-button"
                  type="button"
                  onClick={onClose}
               >
                  Close
               </button>
            </div>
         </div>
      </div>
   );
}

export default FileDetailsModal;
