import {
   FaFolder,
   FaFilePdf,
   FaFileImage,
   FaFileVideo,
   FaFileArchive,
   FaFileCode,
   FaFileAlt,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import ContextMenu from "../components/ContextMenu";

function DirectoryItem({
   item,
   handleRowClick,
   activeContextMenu,
   contextMenuPos,
   handleContextMenu,
   getFileIcon,
   isUploading,
   uploadProgress,
   handleCancelUpload,
   handleDeleteFile,
   handleDeleteDirectory,
   openRenameModal,
   BASE_URL,
}) {
   // Convert the file icon string to the actual Icon component
   function renderFileIcon(iconString) {
      switch (iconString) {
         case "pdf":
            return <FaFilePdf />;
         case "image":
            return <FaFileImage />;
         case "video":
            return <FaFileVideo />;
         case "archive":
            return <FaFileArchive />;
         case "code":
            return <FaFileCode />;
         case "alt":
         default:
            return <FaFileAlt />;
      }
   }

   const isUploadingItem = item.id.startsWith("temp-");
   const fileExtension = item.isDirectory
      ? "Folder"
      : item.extension || item.name.split(".").pop() || "File";
   const itemTypeLabel = item.isDirectory ? "Folder" : "File";

   return (
      <div
         className="list-item hoverable-row"
         onClick={() =>
            !(activeContextMenu || isUploading)
               ? handleRowClick(
                    item.isDirectory ? "directory" : "file",
                    item.id,
                 )
               : null
         }
         onContextMenu={(e) => handleContextMenu(e, item.id)}
      >
         <div className="item-left-container">
            <div className="item-left">
               <div
                  className={`item-icon-shell ${item.isDirectory ? "folder-shell" : "file-shell"}`}
               >
                  {item.isDirectory ? (
                     <FaFolder className="folder-icon" />
                  ) : (
                     renderFileIcon(getFileIcon(item.name))
                  )}
               </div>
               <div className="item-copy">
                  <span className="item-name">
                     <span className="item-title">{item.name}</span>
                     <span
                        className={`item-type-pill ${item.isDirectory ? "folder-pill" : "file-pill"}`}
                     >
                        {itemTypeLabel}
                     </span>
                  </span>
                  <span className="item-meta">
                     {isUploadingItem
                        ? "Uploading"
                        : fileExtension.replace(".", "").toUpperCase()}
                  </span>
               </div>
            </div>

            {/* Three dots for context menu */}
            <div
               className="context-menu-trigger"
               onClick={(e) => handleContextMenu(e, item.id)}
            >
               <BsThreeDotsVertical />
            </div>
         </div>

         {/* PROGRESS BAR: shown if an item is in queue or actively uploading */}
         {isUploadingItem && (
            <div className="progress-container">
               <span className="progress-value">
                  {Math.floor(uploadProgress)}%
               </span>
               <div
                  className={`progress-bar ${uploadProgress === 100 ? "complete" : ""}`}
                  style={{
                     width: `${uploadProgress}%`,
                  }}
               ></div>
            </div>
         )}

         {/* Context menu, if active */}
         {activeContextMenu === item.id && (
            <ContextMenu
               item={item}
               contextMenuPos={contextMenuPos}
               isUploadingItem={isUploadingItem}
               handleCancelUpload={handleCancelUpload}
               handleDeleteFile={handleDeleteFile}
               handleDeleteDirectory={handleDeleteDirectory}
               openRenameModal={openRenameModal}
               BASE_URL={BASE_URL}
            />
         )}
      </div>
   );
}

export default DirectoryItem;
