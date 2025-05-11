// Enhanced file download utilities for AI App Smith
// This script provides reliable file download functionality

// Helper function to safely download a file using Blob
function downloadFileFromBlob(content, fileName, mimeType) {
  try {
    // Create a blob with the file content
    const blob = new Blob([content], { type: mimeType || "text/plain" });

    // Create object URL
    const url = window.URL.createObjectURL(blob);

    // Create download link
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.style.display = "none";

    // Add to document, trigger click, then clean up
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Small timeout to ensure the browser has time to process the download
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(url);
    }, 200);

    return true;
  } catch (error) {
    console.error(`Download error for ${fileName}:`, error);
    return false;
  }
}

// Function to get appropriate MIME type for a file
function getMimeType(fileName) {
  const extension = fileName.split(".").pop().toLowerCase();
  const mimeTypes = {
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    json: "application/json",
    txt: "text/plain",
    md: "text/markdown",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    pdf: "application/pdf",
    zip: "application/zip",
  };

  return mimeTypes[extension] || "text/plain";
}

// Download a single file
async function downloadSingleFile(content, fileName) {
  const mimeType = getMimeType(fileName);
  const success = downloadFileFromBlob(content, fileName, mimeType);

  return success;
}

// Export functions to window
window.downloadUtils = {
  downloadSingleFile,
  downloadFileFromBlob,
  getMimeType,
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Download utilities initialized");
});
