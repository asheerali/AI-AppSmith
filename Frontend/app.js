class AppManager {
  constructor() {
    const style = document.createElement("styles");
    // const style = document.createElement("modern-styles");
    style.innerHTML = `
      .folder {
        display: block !important;
      }
      .folder-icon {
        display: inline-block !important;
      }
    `;
    document.head.appendChild(style);
    // File storage
    this.projectFiles = {
      "index.html": {
        content: this.getDefaultHtmlContent(),
        type: "html",
      },
    };

    // API endpoint
    // this.API_URL = "http://localhost:5000/api/generate";
    this.API_URL = host_api;

    // DOM elements for modals
    this.fileModal = document.getElementById("newFileModal");
    this.closeModalBtn = document.querySelector(".close-modal");
    this.cancelBtn = document.querySelector(".cancel-btn");
    this.createFileBtn = document.querySelector(".create-btn");
    this.newFileName = document.getElementById("newFileName");
    this.fileType = document.getElementById("fileType");

    // Preview content
    this.previewContent = document.getElementById("previewContent");

    // Initialize components
    this.initComponents();
    this.initPreview();
    this.initFolders();
    this.initModalEvents();
    this.initDownloadButtons();
  }

  initComponents() {
    // Initialize the header component
    this.headerComponent = new HeaderComponent(
      "header-component",
      this.projectFiles
    );

    // Initialize the editor component
    this.editorComponent = new EditorComponent(
      "editor-component",
      this.projectFiles
    );

    // Initialize the command component
    this.commandComponent = new CommandComponent("command-component");

    // Set up event handlers
    this.headerComponent.onTabChanged((fileName) => {
      this.editorComponent.switchFile(fileName);
      this.updatePreview();
    });

    this.commandComponent.onGenerateCommand((prompt) => {
      this.generateCode(prompt);
    });

    // Listen for new tab event
    document
      .getElementById("header-component")
      .addEventListener("newtab", () => {
        this.showFileModal();
      });

    // Listen for delete tab event
    document
      .getElementById("header-component")
      .addEventListener("deletetab", (e) => {
        this.deleteFile(e.detail.fileName);
      });

    // Listen for content changes in the editor for real-time preview updates
    document
      .getElementById("editor-component")
      .addEventListener("contentchanged", (e) => {
        // Use requestAnimationFrame to ensure UI updates are smooth
        requestAnimationFrame(() => {
          this.updatePreview();
          console.log(
            `Content changed in ${e.detail.fileName}, updating preview`
          );
        });
      });

    // Add keyboard shortcut for save (Ctrl+S)
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        this.saveCurrentFile();
      }
    });
  }

  initPreview() {
    this.updatePreview();
  }

  initFolders() {
    const folders = document.querySelectorAll(".folder");

    folders.forEach((folder) => {
      folder.addEventListener("click", function (e) {
        // Prevent click event from propagating to parent folders
        e.stopPropagation();

        // Toggle folder open/closed
        const icon = this.querySelector(".folder-icon");
        if (icon.textContent === "▶") {
          icon.textContent = "▼";
        } else {
          icon.textContent = "▶";
        }

        // Toggle visibility of child file list
        const fileList = this.querySelector(".file-list");
        if (fileList) {
          fileList.style.display =
            fileList.style.display === "none" ? "block" : "none";
        }
      });
    });

    // Set up file click handlers
    document.querySelectorAll(".file").forEach((file) => {
      file.addEventListener("click", (e) => {
        e.stopPropagation();
        const fileName = file.getAttribute("data-file");
        if (fileName && this.projectFiles[fileName]) {
          this.switchToFile(fileName);
        }
      });
    });
  }

  // Enhanced modal initialization for AppManager
  initModalEvents() {
    // Ensure all DOM elements are selected correctly
    this.fileModal = document.getElementById("newFileModal");
    this.closeModalBtn = document.querySelector("#newFileModal .close-modal");
    this.cancelBtn = document.querySelector("#newFileModal .cancel-btn");
    this.createFileBtn = document.querySelector("#newFileModal .create-btn");
    this.newFileName = document.getElementById("newFileName");
    this.fileType = document.getElementById("fileType");

    // Debug logging
    console.log("Modal Elements:", {
      fileModal: this.fileModal,
      closeModalBtn: this.closeModalBtn,
      cancelBtn: this.cancelBtn,
      createFileBtn: this.createFileBtn,
      newFileName: this.newFileName,
      fileType: this.fileType,
    });

    // Close modal events
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener("click", () => {
        this.closeFileModal();
      });
    } else {
      console.error("Close modal button not found");
    }

    if (this.cancelBtn) {
      this.cancelBtn.addEventListener("click", () => {
        this.closeFileModal();
      });
    } else {
      console.error("Cancel button not found");
    }

    // Create file event
    if (this.createFileBtn) {
      this.createFileBtn.addEventListener("click", () => {
        this.createNewFile();
      });
    } else {
      console.error("Create file button not found");
    }

    // Optional: Add keyboard support
    if (this.newFileName) {
      this.newFileName.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.createNewFile();
        }
      });
    }
  }
  // Complete download fix for app.js
  // Replace your entire initDownloadButtons and downloadProject methods with these:

  initDownloadButtons() {
    console.log("Initializing download buttons...");

    // Find the download button (try multiple possible IDs)
    let downloadBtn =
      document.getElementById("downloadProjectBtn") ||
      document.querySelector(".download-btn") ||
      document.querySelector('[href*="download"]') ||
      document.querySelector('button:contains("Download")');

    console.log("Download button found:", !!downloadBtn);

    if (downloadBtn) {
      // Remove any existing listeners
      downloadBtn.replaceWith(downloadBtn.cloneNode(true));
      downloadBtn =
        document.getElementById("downloadProjectBtn") ||
        document.querySelector(".download-btn");

      downloadBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Download project button clicked");
        this.downloadProject();
      });
      console.log("Download button listener attached");
    } else {
      console.warn("Download button not found, creating one...");
      this.createDownloadButton();
    }

    // Other buttons
    const downloadCurrentBtn = document.getElementById("downloadCurrentBtn");
    if (downloadCurrentBtn) {
      downloadCurrentBtn.addEventListener("click", () => {
        const currentFile = this.editorComponent.getCurrentFile();
        this.downloadFile(currentFile);
      });
    }

    const exportHtmlBtn = document.getElementById("exportHtmlBtn");
    if (exportHtmlBtn) {
      exportHtmlBtn.addEventListener("click", () => {
        this.exportAsSingleHtml();
      });
    }
  }

  // createDownloadButton() {
  //   const previewHeader = document.querySelector(".preview-header");
  //   if (previewHeader) {
  //     const downloadBtn = document.createElement("button");
  //     downloadBtn.id = "downloadProjectBtn";
  //     downloadBtn.className = "download-btn";
  //     downloadBtn.innerHTML = `
  //     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  //       <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
  //       <polyline points="7 10 12 15 17 10"></polyline>
  //       <line x1="12" y1="15" x2="12" y2="3"></line>
  //     </svg>
  //     Download ZIP
  //   `;

  //     previewHeader.insertBefore(downloadBtn, previewHeader.firstChild);

  //     downloadBtn.addEventListener("click", (e) => {
  //       e.preventDefault();
  //       console.log("Created download button clicked");
  //       this.downloadProject();
  //     });

  //     console.log("Download button created and added");
  //   }
  // }

  async downloadProject() {
    console.log("=== STARTING DOWNLOAD PROJECT ===");

    try {
      // Check if we're in the right context
      if (!this.projectFiles) {
        console.error("this.projectFiles is undefined");
        console.log("this:", this);
        throw new Error("Project files not found");
      }

      console.log("Project files available:", Object.keys(this.projectFiles));

      // Check libraries with detailed info
      console.log("JSZip type:", typeof JSZip);
      console.log("saveAs type:", typeof saveAs);

      if (typeof JSZip === "undefined") {
        console.error("JSZip library not loaded");
        alert("JSZip library not found. Please check if the script is loaded.");
        return;
      }

      if (typeof saveAs === "undefined") {
        console.error("FileSaver library not loaded");
        alert(
          "FileSaver library not found. Please check if the script is loaded."
        );
        return;
      }

      console.log("✓ All libraries loaded");

      // Create ZIP
      console.log("Creating new JSZip instance...");
      const zip = new JSZip();

      let fileCount = 0;
      for (const [fileName, fileData] of Object.entries(this.projectFiles)) {
        console.log(`Adding file: ${fileName}`);
        console.log(
          `Content preview: ${fileData.content.substring(0, 100)}...`
        );
        zip.file(fileName, fileData.content);
        fileCount++;
      }

      console.log(`✓ Added ${fileCount} files to ZIP`);

      // Generate ZIP
      console.log("Generating ZIP blob...");
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      });

      console.log(`✓ ZIP blob generated. Size: ${zipBlob.size} bytes`);
      console.log("ZIP blob type:", zipBlob.type);

      // Try download
      console.log("Attempting download with saveAs...");
      saveAs(zipBlob, "web-project.zip");
      console.log("✓ saveAs function called");

      // Show success message
      this.showNotification("Project download started!");
    } catch (error) {
      console.error("❌ Download failed:", error);
      console.error("Error stack:", error.stack);

      // Try fallback method
      console.log("Trying fallback download method...");
      try {
        await this.fallbackDownload();
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
        this.showNotification(
          `Download failed: ${fallbackError.message}`,
          "error"
        );
      }
    }

    console.log("=== DOWNLOAD PROJECT COMPLETE ===");
  }

  async fallbackDownload() {
    console.log("=== FALLBACK DOWNLOAD METHOD ===");

    const zip = new JSZip();

    // Add files
    for (const [fileName, fileData] of Object.entries(this.projectFiles)) {
      zip.file(fileName, fileData.content);
    }

    // Generate blob
    const content = await zip.generateAsync({ type: "blob" });
    console.log("Fallback ZIP generated, size:", content.size);

    // Create blob URL
    const blobUrl = URL.createObjectURL(content);
    console.log("Blob URL created:", blobUrl);

    // Create and trigger download link
    const downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    downloadLink.download = "web-project-fallback.zip";
    downloadLink.style.display = "none";

    // Add click handler for debugging
    downloadLink.onclick = function () {
      console.log("Download link clicked!");
      return true;
    };

    console.log("Adding download link to DOM...");
    document.body.appendChild(downloadLink);

    console.log("Triggering click...");
    downloadLink.click();

    // Alternative trigger methods
    setTimeout(() => {
      console.log("Trying alternative trigger...");
      const clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      downloadLink.dispatchEvent(clickEvent);
    }, 100);

    // Cleanup
    setTimeout(() => {
      console.log("Cleaning up...");
      if (document.body.contains(downloadLink)) {
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobUrl);
    }, 5000);

    this.showNotification("Fallback download attempted");
  }

  // Simple test method to verify download works
  testSimpleDownload() {
    console.log("Testing simple download...");

    // Test 1: Simple text file
    const testContent =
      "This is a test file created at " + new Date().toISOString();
    const testBlob = new Blob([testContent], { type: "text/plain" });

    if (typeof saveAs !== "undefined") {
      console.log("Testing saveAs with simple file...");
      saveAs(testBlob, "simple-test.txt");
    } else {
      console.log("saveAs not available, using manual method...");
      const url = URL.createObjectURL(testBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "simple-test-manual.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  // Add this method to create a fallback download button
  createFallbackDownloadButton() {
    const previewHeader = document.querySelector(".preview-header");
    if (previewHeader) {
      const downloadBtn = document.createElement("button");
      downloadBtn.id = "downloadProjectBtn";
      downloadBtn.className = "download-btn";
      downloadBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Download Project
    `;

      previewHeader.appendChild(downloadBtn);

      downloadBtn.addEventListener("click", () => {
        console.log("Fallback download button clicked");
        this.downloadProject();
      });
    }
  }

  // // Replace the downloadProject method with this updated version
  // async downloadProject() {
  //   console.log("Starting project download...");

  //   try {
  //     // Check if required libraries are available
  //     if (typeof JSZip === 'undefined') {
  //       throw new Error('JSZip library not loaded');
  //     }
  //     if (typeof saveAs === 'undefined') {
  //       throw new Error('FileSaver library not loaded');
  //     }

  //     const zip = new JSZip();
  //     console.log("JSZip instance created");

  //     // Add files to ZIP
  //     let fileCount = 0;
  //     for (const [fileName, fileData] of Object.entries(this.projectFiles)) {
  //       console.log(`Adding file: ${fileName}`);
  //       zip.file(fileName, fileData.content);
  //       fileCount++;
  //     }

  //     console.log(`Added ${fileCount} files to zip`);

  //     // Generate ZIP blob using the modern async API
  //     console.log("Generating ZIP blob...");
  //     const content = await zip.generateAsync({
  //       type: "blob",
  //       compression: "DEFLATE",
  //       compressionOptions: {
  //         level: 6
  //       }
  //     });

  //     console.log("ZIP blob generated, size:", content.size);

  //     // Use FileSaver.js to download
  //     saveAs(content, "web-project.zip");
  //     console.log("Download initiated");

  //     this.showNotification("Project downloaded successfully");
  //   } catch (error) {
  //     console.error("Download error:", error);
  //     this.showNotification(`Error downloading project: ${error.message}`, "error");

  //     // Fallback: try the old method
  //     this.fallbackDownload();
  //   }
  // }

  // Enhanced download method with extensive debugging
  // Replace your downloadProject method with this version

  async downloadProject() {
    console.log("=== DOWNLOAD PROJECT DEBUG START ===");

    try {
      // Step 1: Check libraries
      console.log("Checking libraries...");
      if (typeof JSZip === "undefined") {
        console.error("JSZip not available");
        alert("JSZip library not loaded. Please refresh the page.");
        return;
      }
      if (typeof saveAs === "undefined") {
        console.error("saveAs not available");
        alert("FileSaver library not loaded. Please refresh the page.");
        return;
      }
      console.log("✓ Libraries available");

      // Step 2: Check project files
      console.log("Checking project files...");
      console.log("Project files:", Object.keys(this.projectFiles));
      if (Object.keys(this.projectFiles).length === 0) {
        throw new Error("No files to download");
      }

      // Step 3: Create ZIP
      console.log("Creating ZIP...");
      const zip = new JSZip();

      let fileCount = 0;
      for (const [fileName, fileData] of Object.entries(this.projectFiles)) {
        console.log(
          `Adding file: ${fileName}, content length: ${fileData.content.length}`
        );
        zip.file(fileName, fileData.content);
        fileCount++;
      }
      console.log(`✓ Added ${fileCount} files to ZIP`);

      // Step 4: Generate ZIP blob
      console.log("Generating ZIP blob...");
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      });

      console.log(`✓ ZIP generated, size: ${content.size} bytes`);

      // Step 5: Attempt download
      console.log("Attempting download...");

      // Method 1: Try saveAs first
      try {
        console.log("Trying saveAs method...");
        saveAs(content, "web-project.zip");
        console.log("✓ saveAs called successfully");
        this.showNotification("Project download initiated");
      } catch (saveAsError) {
        console.error("saveAs failed:", saveAsError);
        throw saveAsError;
      }
    } catch (error) {
      console.error("Primary download failed:", error);
      console.log("Attempting fallback method...");

      // Fallback: Manual blob URL method
      try {
        await this.fallbackDownloadMethod();
      } catch (fallbackError) {
        console.error("Fallback download also failed:", fallbackError);
        this.showNotification(
          `Download failed: ${fallbackError.message}`,
          "error"
        );
      }
    }

    console.log("=== DOWNLOAD PROJECT DEBUG END ===");
  }

  // Enhanced fallback download method
  async fallbackDownloadMethod() {
    console.log("=== FALLBACK DOWNLOAD START ===");

    const zip = new JSZip();

    // Add files
    for (const [fileName, fileData] of Object.entries(this.projectFiles)) {
      zip.file(fileName, fileData.content);
    }

    // Generate blob
    const content = await zip.generateAsync({ type: "blob" });
    console.log("Fallback ZIP generated, size:", content.size);

    // Create download link manually
    const blobUrl = URL.createObjectURL(content);
    console.log("Blob URL created:", blobUrl);

    const downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    downloadLink.download = "web-project.zip";
    downloadLink.style.display = "none";

    // Add to DOM
    document.body.appendChild(downloadLink);
    console.log("Download link added to DOM");

    // Trigger click
    console.log("Triggering download...");
    downloadLink.click();

    // Cleanup
    setTimeout(() => {
      console.log("Cleaning up...");
      if (document.body.contains(downloadLink)) {
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobUrl);
      console.log("✓ Cleanup completed");
    }, 1000);

    this.showNotification("Download initiated (fallback method)");
    console.log("=== FALLBACK DOWNLOAD END ===");
  }

  // Alternative download method using data URL (for testing)
  async downloadProjectDataURL() {
    console.log("=== DATA URL DOWNLOAD START ===");

    try {
      const zip = new JSZip();

      for (const [fileName, fileData] of Object.entries(this.projectFiles)) {
        zip.file(fileName, fileData.content);
      }

      // Generate as base64
      const content = await zip.generateAsync({
        type: "base64",
      });

      console.log("Base64 ZIP generated, length:", content.length);

      // Create data URL
      const dataUrl = "data:application/zip;base64," + content;

      // Try to download using data URL
      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      downloadLink.download = "web-project.zip";
      downloadLink.style.display = "none";

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      this.showNotification("Download initiated (data URL method)");
      console.log("✓ Data URL download completed");
    } catch (error) {
      console.error("Data URL download failed:", error);
      throw error;
    }

    console.log("=== DATA URL DOWNLOAD END ===");
  }

  // Add this method to test different download approaches
  testAllDownloadMethods() {
    console.log("Testing all download methods...");

    // Test 1: Simple file download
    const testContent = "Hello World Test File";
    const testBlob = new Blob([testContent], { type: "text/plain" });

    if (typeof saveAs !== "undefined") {
      console.log("Test 1: Simple saveAs");
      saveAs(testBlob, "test.txt");
    }

    // Test 2: Manual blob URL
    setTimeout(() => {
      console.log("Test 2: Manual blob URL");
      const blobUrl = URL.createObjectURL(testBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "test-manual.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2000);

    // Test 3: Data URL
    setTimeout(() => {
      console.log("Test 3: Data URL");
      const dataUrl =
        "data:text/plain;charset=utf-8," + encodeURIComponent(testContent);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "test-data.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 4000);
  }

  // Fallback download method using blob URLs
  async fallbackDownload() {
    console.log("Attempting fallback download method...");

    try {
      const zip = new JSZip();

      // Add files to ZIP
      for (const [fileName, fileData] of Object.entries(this.projectFiles)) {
        zip.file(fileName, fileData.content);
      }

      // Generate ZIP blob
      const content = await zip.generateAsync({ type: "blob" });

      // Create blob URL and download link
      const blobUrl = URL.createObjectURL(content);
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = "web-project.zip";
      downloadLink.style.display = "none";

      // Append to body, click, and remove
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
      }, 100);

      this.showNotification(
        "Project downloaded successfully (fallback method)"
      );
    } catch (error) {
      console.error("Fallback download error:", error);
      this.showNotification(`Download failed: ${error.message}`, "error");
    }
  }

  // Enhanced downloadFile method
  downloadFile(fileName) {
    if (!this.projectFiles[fileName]) {
      this.showNotification("File not found", "error");
      return;
    }

    try {
      console.log(`Downloading single file: ${fileName}`);

      // Create a blob with the file content
      const mimeType = this.getMimeType(fileName);
      const blob = new Blob([this.projectFiles[fileName].content], {
        type: mimeType,
      });

      // Use FileSaver if available, otherwise fallback
      if (typeof saveAs !== "undefined") {
        saveAs(blob, fileName);
      } else {
        // Fallback method
        const blobUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = blobUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
      }

      this.showNotification(`${fileName} downloaded successfully`);
    } catch (error) {
      console.error(`Error downloading ${fileName}:`, error);
      this.showNotification(
        `Error downloading file: ${error.message}`,
        "error"
      );
    }
  }

  // Generate code from prompt
  async generateCode(prompt) {
    const currentFile = this.editorComponent.getCurrentFile();
    const currentContent = this.projectFiles[currentFile].content;

    // Show loading state
    this.commandComponent.setLoading(true);

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          currentFile: currentFile,
          currentContent: currentContent, // Send current content to API
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Update the project files
      this.projectFiles[currentFile].content = data.code;

      // Update the editor
      this.editorComponent.updateFile(currentFile, data.code);

      // Update the preview
      this.updatePreview();
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error("Generation error:", error);
    } finally {
      // Reset loading state
      this.commandComponent.setLoading(false);
    }
  }

  // Show file creation modal
  showFileModal() {
    // Re-select modal elements to ensure they exist
    this.fileModal = document.getElementById("newFileModal");
    this.newFileName = document.getElementById("newFileName");
    this.fileType = document.getElementById("fileType");

    if (!this.fileModal) {
      console.error("File modal not found");
      return;
    }

    this.fileModal.classList.add("show");

    if (this.newFileName) {
      this.newFileName.value = ""; // Clear previous input
      this.newFileName.focus();
    }

    // Reset file type to default
    if (this.fileType) {
      this.fileType.selectedIndex = 0;
    }
  }

  // Close file creation modal
  closeFileModal() {
    this.fileModal.classList.remove("show");
    this.newFileName.value = "";
  }

  // Create a new file
  createNewFile() {
    const fileName = this.newFileName.value.trim();
    const selectedType = this.fileType.value;

    if (!fileName) {
      alert("Please enter a file name");
      return;
    }

    // Add file extension if not provided
    let fullFileName = fileName;
    if (!fullFileName.includes(".")) {
      fullFileName += `.${selectedType}`;
    }

    // Check if file already exists
    if (this.projectFiles[fullFileName]) {
      alert("File already exists");
      return;
    }

    // Create default content
    const defaultContent = this.getDefaultContent(fullFileName, selectedType);

    // Add file to storage
    this.projectFiles[fullFileName] = {
      content: defaultContent,
      type: selectedType,
    };

    // Add file to UI
    this.headerComponent.addTab(fullFileName);
    this.addFileToSidebar(fullFileName);

    // Switch to the new file
    this.switchToFile(fullFileName);

    // Close modal
    this.closeFileModal();
  }

  // Delete a file
  deleteFile(fileName) {
    // Don't delete the last file if it's index.html
    if (
      fileName === "index.html" &&
      Object.keys(this.projectFiles).length === 1
    ) {
      alert("Cannot delete the last remaining file.");
      return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) {
      return;
    }

    // Get current active file
    const currentFile = this.editorComponent.getCurrentFile();

    // Remove file from project files
    delete this.projectFiles[fileName];

    // Remove file from sidebar
    const sidebarFile = document.querySelector(
      `.file[data-file="${fileName}"]`
    );
    if (sidebarFile) {
      sidebarFile.remove();
    }

    // If the deleted file was the active one, switch to another file
    if (currentFile === fileName) {
      const nextFile = Object.keys(this.projectFiles)[0];
      if (nextFile) {
        this.switchToFile(nextFile);
      }
    }

    // Refresh tabs
    this.headerComponent.render();
    this.headerComponent.setActiveTab(this.editorComponent.getCurrentFile());

    // Update preview
    this.updatePreview();
  }

  // Add file to sidebar
  addFileToSidebar(fileName) {
    const projectFilesList = document.querySelector(
      ".project-files .file-list"
    );
    const newFile = document.createElement("li");
    newFile.className = "file";
    newFile.setAttribute("data-file", fileName);
    newFile.textContent = fileName;

    projectFilesList.appendChild(newFile);

    // Add click event
    newFile.addEventListener("click", (e) => {
      e.stopPropagation();
      this.switchToFile(fileName);
    });
  }

  // Switch to a file
  switchToFile(fileName) {
    // Update header component
    this.headerComponent.setActiveTab(fileName);

    // Update editor component
    this.editorComponent.switchFile(fileName);

    // Update active file in sidebar
    document.querySelectorAll(".file").forEach((file) => {
      file.classList.remove("active-file");
      if (file.getAttribute("data-file") === fileName) {
        file.classList.add("active-file");
      }
    });

    // Update preview if it's an HTML file
    this.updatePreview();
  }

  // Save the current file
  saveCurrentFile() {
    const currentFile = this.editorComponent.getCurrentFile();
    const content = this.projectFiles[currentFile].content;

    // Here you could implement an actual save to server
    // For now, just show a confirmation message
    this.showNotification(`${currentFile} saved successfully`);

    console.log(`File ${currentFile} saved with content:`, content);
  }

  // Update the preview with the current HTML file
  updatePreview() {
    // Find the current file
    const currentFile = this.editorComponent.getCurrentFile();

    // Find an HTML file to preview
    let htmlFile = currentFile;
    if (!htmlFile.endsWith(".html")) {
      // Try to find index.html or another HTML file
      htmlFile =
        Object.keys(this.projectFiles).find((file) => file.endsWith(".html")) ||
        "";
    }

    if (htmlFile && this.projectFiles[htmlFile]) {
      // Create an iframe for isolated rendering
      this.previewContent.innerHTML = "";

      const iframe = document.createElement("iframe");
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";

      // Append the iframe to the preview container
      this.previewContent.appendChild(iframe);

      // Prepare the HTML content with CSS and JS
      const htmlContent = this.prepareHtmlWithAssets(htmlFile);

      // Write the code to the iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
    }
  }

  // Prepare HTML with all assets
  prepareHtmlWithAssets(htmlFile) {
    let htmlContent = this.projectFiles[htmlFile].content;

    // Check if we need to inject CSS
    const cssFiles = Object.keys(this.projectFiles).filter((file) =>
      file.endsWith(".css")
    );
    if (cssFiles.length > 0 && !htmlContent.includes("<style>")) {
      // Find where to inject CSS (before </head>)
      const headEnd = htmlContent.indexOf("</head>");
      if (headEnd !== -1) {
        let cssContent = "<style>\n";
        cssFiles.forEach((cssFile) => {
          cssContent += `/* ${cssFile} */\n${this.projectFiles[cssFile].content}\n\n`;
        });
        cssContent += "</style>\n";

        htmlContent =
          htmlContent.substring(0, headEnd) +
          cssContent +
          htmlContent.substring(headEnd);
      }
    }

    // Check if we need to inject JS
    const jsFiles = Object.keys(this.projectFiles).filter((file) =>
      file.endsWith(".js")
    );
    if (jsFiles.length > 0 && !htmlContent.includes("<script>")) {
      // Find where to inject JS (before </body>)
      const bodyEnd = htmlContent.indexOf("</body>");
      if (bodyEnd !== -1) {
        let jsContent = "<script>\n";
        jsFiles.forEach((jsFile) => {
          jsContent += `// ${jsFile}\n${this.projectFiles[jsFile].content}\n\n`;
        });
        jsContent += "</script>\n";

        htmlContent =
          htmlContent.substring(0, bodyEnd) +
          jsContent +
          htmlContent.substring(bodyEnd);
      }
    }

    return htmlContent;
  }

  // Download the entire project as zip
  //  async downloadProject() {
  //   try {
  //     const zip = new JSZip();

  //     // Add files to ZIP
  //     for (const [fileName, fileData] of Object.entries(this.projectFiles)) {
  //       zip.file(fileName, fileData.content);
  //     }

  //     // Generate ZIP blob
  //     const content = await zip.generateAsync({ type: "blob" });

  //     // Create a blob URL
  //     const blobUrl = URL.createObjectURL(content);

  //     // Create a download link
  //     const downloadLink = document.createElement("a");
  //     downloadLink.href = blobUrl;
  //     downloadLink.download = "web-project.zip";
  //     downloadLink.style.display = "none"; // Ensure it's not visible

  //     // Append, click, and remove
  //     document.body.appendChild(downloadLink);
  //     setTimeout(() => {
  //       downloadLink.click();
  //       URL.revokeObjectURL(blobUrl); // Free up memory
  //       downloadLink.remove();
  //     }, 100); // Give DOM time to process

  //     this.showNotification("Project downloaded successfully");
  //   } catch (error) {
  //     console.error("Download error:", error);
  //     this.showNotification("Error downloading project: " + error.message, "error");
  //   }
  // }
  async downloadProject() {
    try {
      const zip = new JSZip();

      // Add files to ZIP
      for (const [fileName, fileData] of Object.entries(this.projectFiles)) {
        zip.file(fileName, fileData.content);
      }

      // Generate ZIP blob
      const content = await zip.generateAsync({ type: "blob" });

      // Create a blob URL
      const blobUrl = URL.createObjectURL(content);

      // Create a download link
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = "web-project.zip";
      downloadLink.style.display = "none"; // Ensure it's not visible

      // Append, click, and remove
      document.body.appendChild(downloadLink);
      setTimeout(() => {
        downloadLink.click();
        URL.revokeObjectURL(blobUrl); // Free up memory
        downloadLink.remove();
      }, 100); // Give DOM time to process

      this.showNotification("Project downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      this.showNotification(
        "Error downloading project: " + error.message,
        "error"
      );
    }
  }

  // Download a single file
  downloadFile(fileName) {
    if (!this.projectFiles[fileName]) {
      this.showNotification("File not found", "error");
      return;
    }

    try {
      // Create a blob with the file content
      const mimeType = this.getMimeType(fileName);
      const blob = new Blob([this.projectFiles[fileName].content], {
        type: mimeType,
      });

      // Create download link and trigger download
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      this.showNotification(`${fileName} downloaded successfully`);
    } catch (error) {
      console.error(`Error downloading ${fileName}:`, error);
      this.showNotification(
        `Error downloading file: ${error.message}`,
        "error"
      );
    }
  }

  // Add these methods to your AppManager class in app.js
  // Only include these, not the entire file, to integrate with the popup

  // Add this to your initTemplateSystem method in AppManager class
  // or create the method if it doesn't exist
  // Add these methods to your AppManager class in app.js
  // Only include these, not the entire file, to integrate with the popup

  // Add this to your initTemplateSystem method in AppManager class
  // or create the method if it doesn't exist
  initTemplateSystem() {
    // Initialize template buttons
    const templateBtn = document.getElementById("templateBtn");
    if (templateBtn) {
      templateBtn.addEventListener("click", () => {
        const templateModal = document.getElementById("templateModal");
        if (templateModal) {
          templateModal.classList.add("show");
        }
      });
    }

    // Listen for template selection
    document.addEventListener("click", (e) => {
      const templateCard = e.target.closest(".template-card");
      if (templateCard) {
        const templateKey = templateCard.dataset.template;
        if (
          templateKey &&
          window.templateOptions &&
          window.templateOptions[templateKey]
        ) {
          // Show template prompt popup
          if (window.showTemplatePromptPopup) {
            window.showTemplatePromptPopup(window.templateOptions[templateKey]);
          }

          // Close the template selection modal
          const templateModal = document.getElementById("templateModal");
          if (templateModal) {
            templateModal.classList.remove("show");
          }
        }
      }
    });
  }

  // Generate code from prompt - Make sure it's accessible to the popup
  generateCode(prompt) {
    const currentFile = this.editorComponent.getCurrentFile();
    const currentContent = this.projectFiles[currentFile].content;

    // Show loading state
    this.commandComponent.setLoading(true);

    // Close the prompt popup if it's open
    if (window.closeTemplatePromptPopup) {
      window.closeTemplatePromptPopup();
    }

    fetch(this.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        currentFile: currentFile,
        currentContent: currentContent,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }

        // Update the project files
        this.projectFiles[currentFile].content = data.code;

        // Update the editor
        this.editorComponent.updateFile(currentFile, data.code);

        // Update the preview
        this.updatePreview();
      })
      .catch((error) => {
        alert(`Error: ${error.message}`);
        console.error("Generation error:", error);
      })
      .finally(() => {
        // Reset loading state
        this.commandComponent.setLoading(false);
      });
  }
  // Export as single HTML file
  exportAsSingleHtml() {
    try {
      // Find an HTML file to use as base
      const htmlFile =
        Object.keys(this.projectFiles).find((file) => file.endsWith(".html")) ||
        "";

      if (!htmlFile || !this.projectFiles[htmlFile]) {
        throw new Error("No HTML file found");
      }

      // Get the HTML with all assets
      const htmlContent = this.prepareHtmlWithAssets(htmlFile);

      // Create download link
      const blob = new Blob([htmlContent], { type: "text/html" });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = "exported-project.html";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      this.showNotification("Project exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      this.showNotification(
        "Error exporting project: " + error.message,
        "error"
      );
    }
  }

  // Get MIME type for file
  getMimeType(fileName) {
    const extension = fileName.split(".").pop().toLowerCase();
    const mimeTypes = {
      html: "text/html",
      css: "text/css",
      js: "text/javascript",
      json: "application/json",
      txt: "text/plain",
    };
    return mimeTypes[extension] || "text/plain";
  }

  // Show notification
  showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = "save-message";
    if (type === "error") {
      notification.style.backgroundColor = "#f44336";
    }
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 2000);
  }

  // Get default content for new files
  getDefaultContent(fileName, fileType) {
    switch (fileType) {
      case "html":
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName}</title>
</head>
<body>
    <h1>Welcome to ${fileName}</h1>
    <p>This is a new page. Start building your content here.</p>
</body>
</html>`;
      case "css":
        return `/* Styles for ${fileName} */

body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background-color: #f8f9fa;
    color: #333;
}

h1 {
    color: #0066ff;
}`;
      case "js":
        return `// JavaScript for ${fileName}

document.addEventListener('DOMContentLoaded', function() {
    console.log('${fileName} loaded!');
    
    // Your code here
});`;
      default:
        return `// Content for ${fileName}`;
    }
  }

  // Get default HTML content
  getDefaultHtmlContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>AI App Smith</title>
      <style>
        body {
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(to right, #121212, #1e1e1e);
          color: #e0e0e0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          flex-direction: column;
          position: relative;
        }
        
        .headline {
          font-size: 2.5rem;
          font-weight: 600;
          color: #00aaff;
        }
        
        .subline {
          font-size: 1.1rem;
          color: #bbbbbb;
          margin: 10px 0 20px;
        }
        
        .pulse {
          width: 40px;
          height: 40px;
          background: #00aaff;
          border-radius: 50%;
          animation: pulse 2s infinite ease-in-out;
          margin-top: 30px;
        }
        @keyframes pulse {
          0%   { transform: scale(1);   opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        /* Arrow container */
        .arrow {
          position: fixed;
          bottom: 15px;           /* above the Generate button */
          left: 70px;             /* near left side to point right */
          width: 48px;
          height: 48px;
          animation: bounce 1.5s infinite;
          z-index: 10;
        }
        /* Horizontal bounce */
        @keyframes bounce {
          0%, 100% { transform: translateX(0); }
          50%      { transform: translateX(8px); }
        }
    
        /* Tooltip text (optional) */
        .tooltip {
          position: fixed;
          bottom: 120px;
          left: 20px;
          color: #ccc;
          font-size: 12px;
          font-style: italic;
        }
    
        /* SVG arrow drawing */
        .arrow svg {
          width: 100%;
          height: 100%;
          fill: none;
          stroke: #00aaff;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
      </style>
    </head>
    <body>
      <div>
        <div class="headline">Let’s build something amazing.</div>
        <div class="subline">Describe your website below and click <strong>Generate</strong></div>
        <div class="pulse"></div>
      </div>
    
      <!-- (Optional) Tooltip above the arrow -->
      <div class="tooltip">Click Generate </div>
    
      <!-- 
           The arrow with a single pivot on the left:
           - Middle line (straight right) 
           - Upper line (diagonal up)
           - Lower line (diagonal down)
      -->
      <div class="arrow">
        <svg viewBox="0 0 20 24">
          <!-- 
               Lines from (2,12) => pivot
                 - to (14,12)  (straight line to the right)
                 - to (6,8)    (up/left)
                 - to (6,16)   (down/left)
          -->
          <path d="M2 12 L14 12 M2 12 L6 8 M2 12 L6 16" />
        </svg>
      </div>
    </body>
    </html>`;
  }
}

// Debug utility for AppManager
class AppManagerDebug {
  constructor(appManager) {
    this.appManager = appManager;
  }

  // Comprehensive debug logging for file operations
  logFileOperations() {
    console.group("📁 File Operations Debug");
    console.log(
      "Total Files:",
      Object.keys(this.appManager.projectFiles).length
    );
    console.log("Current Files:", Object.keys(this.appManager.projectFiles));
    console.log(
      "Current Active File:",
      this.appManager.editorComponent.getCurrentFile()
    );
    console.groupEnd();
  }

  // Debug modal and file creation process
  debugNewFileModal() {
    console.group("🔍 New File Modal Debug");

    // Check modal elements
    const elements = {
      fileModal: document.getElementById("newFileModal"),
      closeModalBtn: document.querySelector(".close-modal"),
      cancelBtn: document.querySelector(".cancel-btn"),
      createFileBtn: document.querySelector(".create-btn"),
      newFileName: document.getElementById("newFileName"),
      fileType: document.getElementById("fileType"),
    };

    console.log("Modal Elements:");
    Object.entries(elements).forEach(([name, element]) => {
      console.log(`${name}: ${element ? "✅ Found" : "❌ Missing"}`);
    });

    // Check event listeners
    console.log("\nEvent Listener Check:");
    if (elements.createFileBtn) {
      console.log(
        "Create File Button Event Listeners:",
        elements.createFileBtn.hasAttribute("data-listeners")
          ? "✅ Attached"
          : "❌ Not Attached"
      );
    }

    console.groupEnd();
  }

  // Detailed preview debug
  debugPreview() {
    console.group("🖥️ Preview Debug");

    const previewContent = document.getElementById("previewContent");
    const iframe = previewContent
      ? previewContent.querySelector("iframe")
      : null;

    console.log(
      "Preview Container:",
      previewContent ? "✅ Found" : "❌ Missing"
    );
    console.log("Iframe in Preview:", iframe ? "✅ Exists" : "❌ Not Found");

    if (iframe) {
      try {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow.document;
        console.log("Iframe Content:", iframeDoc.body.innerHTML);
      } catch (error) {
        console.error("Cannot access iframe content:", error);
      }
    }

    console.groupEnd();
  }

  // Comprehensive system check
  performFullSystemCheck() {
    console.group("🔬 Full System Diagnostic");

    // Check core components
    const components = {
      headerComponent: this.appManager.headerComponent,
      editorComponent: this.appManager.editorComponent,
      commandComponent: this.appManager.commandComponent,
    };

    console.log("Core Components:");
    Object.entries(components).forEach(([name, component]) => {
      console.log(`${name}: ${component ? "✅ Initialized" : "❌ Missing"}`);
    });

    // File system check
    this.logFileOperations();

    // Modal debug
    this.debugNewFileModal();

    // Preview debug
    this.debugPreview();

    console.groupEnd();
  }

  // Add debug methods to global window for console access
  attachGlobalDebugMethods() {
    window.debugAppManager = {
      logFiles: () => this.logFileOperations(),
      checkModal: () => this.debugNewFileModal(),
      checkPreview: () => this.debugPreview(),
      fullSystemCheck: () => this.performFullSystemCheck(),
    };
  }
}

// Modify AppManager to include debug functionality
document.addEventListener("DOMContentLoaded", function () {
  // Wait a bit to ensure AppManager is fully initialized
  setTimeout(() => {
    if (window.appManager) {
      const appManagerDebugger = new AppManagerDebug(window.appManager);
      appManagerDebugger.attachGlobalDebugMethods();

      // Optional: Perform initial system check
      appManagerDebugger.performFullSystemCheck();
    }
  }, 100);
});

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", function () {
  window.appManager = new AppManager();
});

// design new templates
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("universalSiteModal");
  const openBtn = document.getElementById("openGeneralGenerator");
  const closeBtn = document.getElementById("closeUniversalModal");
  const genBtn = document.getElementById("generateUniversalSite");

  if (openBtn) openBtn.onclick = () => modal.classList.add("show");
  if (closeBtn) closeBtn.onclick = () => modal.classList.remove("show");
  window.onclick = (e) => e.target === modal && modal.classList.remove("show");

  genBtn.onclick = () => {
    const values = {
      description: document.getElementById("genDescription").value,
      color: document.getElementById("genColor").value,
      gradient: `linear-gradient(to right, ${
        document.getElementById("genGradientStart").value
      }, ${document.getElementById("genGradientEnd").value})`,

      font: document.getElementById("genFont").value,
      hero: document.getElementById("genHero").value,
      about: document.getElementById("genAbout").value,
      features: document.getElementById("genFeatures").value,
      contact: document.getElementById("genContact").value,
      notes: document.getElementById("genNotes").value,
    };

    const base = templateOptions.universal.prompt;
    const prompt = fillUniversalPrompt(base, values);

    const promptInput = document.getElementById("promptInput");
    const textarea = document.getElementById("prompt-popup-textarea");

    if (promptInput && textarea) {
      promptInput.value = prompt;
      textarea.value = prompt;

      const appManager = window.appManager;
      if (appManager?.generateCode) {
        appManager.generateCode(prompt);
      }
    }

    modal.classList.remove("show");
  };
});
