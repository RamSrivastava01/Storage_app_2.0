import {
    FaDownload,
    FaEdit,
    FaTrash,
    FaTimesCircle,
} from "react-icons/fa";
import { createPortal } from "react-dom";

function ContextMenu({
    item,
    contextMenuPos,
    isUploadingItem,
    handleCancelUpload,
    handleDeleteFile,
    handleDeleteDirectory,
    openRenameModal,
    BASE_URL,
  }) {
    const menuStyle = {
      top: contextMenuPos.y,
      left: Math.max(8, contextMenuPos.x),
    };

    // Directory context menu
    if (item.isDirectory) {
      return createPortal(
        <div
          className="context-menu"
          style={menuStyle}
        >
          <div
            className="context-menu-item"
            onClick={() => openRenameModal("directory", item.id, item.name)}
          >
            <FaEdit />
            <span>Rename</span>
          </div>
          <div
            className="context-menu-item danger-item"
            onClick={() => handleDeleteDirectory(item.id)}
          >
            <FaTrash />
            <span>Delete</span>
          </div>
        </div>,
        document.body,
      );
    } else {
      // File context menu
      if (isUploadingItem && item.isUploading) {
        // Only show "Cancel"
        return createPortal(
          <div
            className="context-menu"
            style={menuStyle}
          >
            <div
              className="context-menu-item danger-item"
              onClick={() => handleCancelUpload(item.id)}
            >
              <FaTimesCircle />
              <span>Cancel</span>
            </div>
          </div>,
          document.body,
        );
      } else {
        // Normal file
        return createPortal(
          <div
            className="context-menu"
            style={menuStyle}
          >
            <div
              className="context-menu-item"
              onClick={() =>
                (window.location.href = `${BASE_URL}/file/${item.id}?action=download`)
              }
            >
              <FaDownload />
              <span>Download</span>
            </div>
            <div
              className="context-menu-item"
              onClick={() => openRenameModal("file", item.id, item.name)}
            >
              <FaEdit />
              <span>Rename</span>
            </div>
            <div
              className="context-menu-item danger-item"
              onClick={() => handleDeleteFile(item.id)}
            >
              <FaTrash />
              <span>Delete</span>
            </div>
          </div>,
          document.body,
        );
      }
    }
  }
  
  export default ContextMenu;
  
