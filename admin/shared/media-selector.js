// Unified Media Selector Component
// Provides a complete media management solution with two modes:
// - 'modal': For selecting media (used in site-settings hero backgrounds)
// - 'page': Full media library management (upload, delete, view, bulk operations)

class MediaSelector {
  constructor(options = {}) {
    // Configuration
    this.containerId = options.containerId || "mediaGrid";
    this.mode = options.mode || "modal"; // 'modal' or 'page'
    this.selectionCallback = options.selectionCallback || null;
    this.showDefaultMedia = options.showDefaultMedia || false;
    this.allowedTypes = options.allowedTypes || ["image", "video"];
    this.pageSize = options.pageSize || 20;
    this.supabaseClient = options.supabaseClient || window.supabase;
    this.supabaseUrl = options.supabaseUrl || "";

    // Page mode features
    this.allowUpload = options.allowUpload || false;
    this.allowDelete = options.allowDelete || false;
    this.allowBulkSelection = options.allowBulkSelection || false;
    this.showViewToggle = options.showViewToggle || false;
    this.showViewer = options.showViewer || false;
    this.showCleanup = options.showCleanup || false;

    // State
    this.allFiles = [];
    this.filteredFiles = [];
    this.currentPage = 1;
    this.searchTerm = "";
    this.typeFilter = "all";
    this.sortBy = "newest";
    this.isLoading = false;
    this.transformSupported = null;
    this.viewMode = "grid"; // 'grid' or 'list'

    // Bulk selection state
    this.selectedFiles = new Set();

    // Viewer state
    this.viewerIndex = 0;

    // Image cache for better performance
    this.imageCache = new Map();

    // Default media from repo
    this.defaultMedia = [
      {
        name: "St. Pete Hero Video",
        url: "/assets/media/videos/hero/st-pete-hero.mp4",
        type: "video",
        isDefault: true,
      },
      {
        name: "Sarasota Hero Video",
        url: "/assets/media/videos/hero/sarasota-hero.mp4",
        type: "video",
        isDefault: true,
      },
    ];
  }

  // Initialize the component
  async init() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container element #${this.containerId} not found`);
      return;
    }

    // Render loading state
    this.renderLoading();

    // Test if Supabase image transforms are supported (only once)
    if (this.transformSupported === null) {
      await this.testTransformSupport();
    }

    // Load media files
    await this.loadMedia();

    // Create viewer and modals if in page mode
    if (this.mode === "page") {
      this.createPageModeUI();
    }

    // Render the component
    this.render();
  }

  // Test if Supabase image transformations are enabled
  async testTransformSupport() {
    this.transformSupported = false;
    console.log(
      "ℹ️ Image transformations disabled (Pro plan feature) - using CSS-based thumbnails"
    );
  }

  // Load media from Supabase
  async loadMedia() {
    this.isLoading = true;

    try {
      const { data, error } = await this.supabaseClient.storage
        .from("media")
        .list("", {
          limit: 1000,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error;

      const validExtensions = {
        image: ["jpg", "jpeg", "png", "gif", "webp"],
        video: ["mp4", "webm", "mov"],
      };

      const allowedExtensions = [];
      if (this.allowedTypes.includes("image")) {
        allowedExtensions.push(...validExtensions.image);
      }
      if (this.allowedTypes.includes("video")) {
        allowedExtensions.push(...validExtensions.video);
      }

      this.allFiles = data
        .filter((file) => {
          const ext = file.name.split(".").pop().toLowerCase();
          return allowedExtensions.includes(ext);
        })
        .map((file) => {
          const ext = file.name.split(".").pop().toLowerCase();
          const isVideo = validExtensions.video.includes(ext);
          return {
            id: file.name,
            name: file.name,
            url: `${this.supabaseUrl}/storage/v1/object/public/media/${file.name}`,
            type: isVideo ? "video" : "image",
            size: file.metadata?.size || 0,
            created_at: file.created_at,
            isDefault: false,
          };
        });

      if (this.showDefaultMedia) {
        this.allFiles = [...this.defaultMedia, ...this.allFiles];
      }

      this.isLoading = false;
      this.applyFilters();
    } catch (error) {
      console.error("Error loading media:", error);
      this.isLoading = false;
      this.allFiles = this.showDefaultMedia ? [...this.defaultMedia] : [];
      this.applyFilters();
    }
  }

  // Apply filters and sorting
  applyFilters() {
    let filtered = [...this.allFiles];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((file) =>
        file.name.toLowerCase().includes(term)
      );
    }

    if (this.typeFilter !== "all") {
      filtered = filtered.filter((file) => file.type === this.typeFilter);
    }

    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case "newest":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case "oldest":
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });

    this.filteredFiles = filtered;

    const totalPages = Math.ceil(this.filteredFiles.length / this.pageSize);
    if (this.currentPage > totalPages && totalPages > 0) {
      this.currentPage = 1;
    }
  }

  // Cache image in memory
  getCachedImage(url) {
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    this.imageCache.set(url, promise);
    return promise;
  }

  // Get thumbnail URL
  getThumbnailUrl(file) {
    if (file.isDefault || file.type === "video") {
      return file.url;
    }

    if (this.transformSupported) {
      return `${file.url}?width=300&height=200&resize=cover`;
    } else {
      return file.url;
    }
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  // Create page mode UI elements (modals, etc.)
  createPageModeUI() {
    if (this.showViewer) {
      this.createViewerModal();
    }
    if (this.allowDelete) {
      this.createDeleteModal();
      this.createDeletionProgressModal();
    }
  }

  // Create viewer modal
  createViewerModal() {
    const existingViewer = document.getElementById("mediaViewer");
    if (existingViewer) return;

    const viewerHTML = `
      <div id="mediaViewer" class="fixed inset-0 z-50 hidden opacity-0 transition-opacity duration-200">
        <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
        <div class="absolute inset-0 flex flex-col">
          <button id="viewerCloseBtn" class="absolute top-4 right-4 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-emerald-600/80 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <div class="px-8 pt-8 pb-4 text-white">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 id="viewerTitle" class="text-2xl font-semibold truncate">File name</h3>
                <p id="viewerMeta" class="text-sm text-gray-300 mt-1">File details</p>
              </div>
              ${
                this.allowDelete
                  ? `
                <div class="flex items-center gap-3">
                  <button id="viewerDeleteBtn" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/80 hover:bg-red-600 transition text-white">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Delete
                  </button>
                </div>
              `
                  : ""
              }
            </div>
          </div>

          <div class="relative flex-1 flex items-center justify-center px-6 pb-10">
            <button id="viewerPrevBtn" class="absolute left-4 md:left-8 p-3 md:p-4 rounded-full bg-black/50 text-white hover:bg-emerald-600/80 transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>

            <img id="viewerImage" src="" alt="Expanded media" class="max-h-[65vh] md:max-h-[70vh] object-contain border border-gray-700/60 bg-gray-800/60 shadow-xl" />
            <video id="viewerVideo" controls class="hidden max-h-[65vh] md:max-h-[70vh] object-contain border border-gray-700/60 bg-gray-800/60 shadow-xl">
              <source src="" type="video/mp4" />
            </video>

            <button id="viewerNextBtn" class="absolute right-4 md:right-8 p-3 md:p-4 rounded-full bg-black/50 text-white hover:bg-emerald-600/80 transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          <div class="px-8 pb-6 text-gray-400 text-sm">
            <p>Use the arrow keys or on-screen controls to navigate. Press Esc to close.</p>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", viewerHTML);
    this.attachViewerListeners();
  }

  // Create delete confirmation modal
  createDeleteModal() {
    const existingModal = document.getElementById("deleteModal");
    if (existingModal) return;

    const modalHTML = `
      <div id="deleteModal" class="fixed inset-0 z-50 hidden opacity-0 transition-opacity duration-200">
        <div class="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"></div>
        <div class="absolute inset-0 flex items-center justify-center px-4">
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div class="flex items-start gap-4 px-6 pt-6">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </div>
              <div class="flex-1">
                <h3 id="deleteModalTitle" class="text-lg font-semibold text-gray-900">Delete Files</h3>
                <p id="deleteModalDetail" class="text-sm text-gray-600 mt-1">This action cannot be undone.</p>
              </div>
            </div>

            <div id="deleteModalList" class="px-6 py-4 space-y-2 max-h-60 overflow-y-auto"></div>
            <p id="deleteModalExtra" class="hidden px-6 text-sm text-gray-500"></p>

            <div class="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
              <button id="deleteModalCancelBtn" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition">
                Cancel
              </button>
              <button id="deleteModalConfirmBtn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.attachDeleteModalListeners();
  }

  // Create deletion progress modal
  createDeletionProgressModal() {
    const existingModal = document.getElementById("deletionProgressModal");
    if (existingModal) return;

    const modalHTML = `
      <div id="deletionProgressModal" class="fixed inset-0 z-50 hidden opacity-0 transition-opacity duration-200">
        <div class="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"></div>
        <div class="absolute inset-0 flex items-center justify-center px-4">
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Deleting Files</h3>
              <p id="deletionProgressText" class="text-sm text-gray-600">Please wait...</p>
              <div class="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div id="deletionProgressBar" class="bg-red-600 h-full transition-all duration-300" style="width: 0%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  // Render the component
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    let html = "";

    // Upload area (page mode only)
    if (this.mode === "page" && this.allowUpload) {
      html += this.renderUploadArea();
    }

    // Bulk selection toolbar (page mode only)
    if (
      this.mode === "page" &&
      this.allowBulkSelection &&
      this.selectedFiles.size > 0
    ) {
      html += this.renderBulkToolbar();
    }

    // ONE DARK container wrapping filters, header, AND grid
    html += `<div class="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-lg shadow-xl overflow-hidden">`;

    // Filters section (with padding, border bottom)
    html += `<div class="p-6 border-b border-gray-700">`;
    html += this.renderFiltersAndPagination();
    html += `</div>`;

    // Header section (with padding, border bottom) - page mode only
    if (this.mode === "page") {
      html += `<div class="p-6 border-b border-gray-700">`;
      html += this.renderMediaHeaderContent();
      html += `</div>`;
    }

    // Grid section (same dark background, blends with container)
    html += `<div id="${this.containerId}-grid" class="p-6">`;
    html += this.renderGrid();
    html += `</div>`;

    // Close main container
    html += `</div>`;

    container.innerHTML = html;
    this.attachEventListeners();
  }

  // Render upload area
  renderUploadArea() {
    return `
      <div class="mb-8">
        <div id="${this.containerId}-uploadArea" class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white hover:bg-emerald-50 hover:border-emerald-500 transition-all cursor-pointer">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p class="text-lg font-medium text-gray-900 mb-2">Upload Media Files</p>
          <p class="text-gray-600">Drag and drop files here, or click to browse</p>
          <p class="text-sm text-gray-500 mt-2">PNG, JPG, GIF, MP4 up to 10MB each</p>
        </div>
        <input type="file" id="${this.containerId}-fileInput" multiple accept="image/*,video/*" class="hidden" />
      </div>
    `;
  }

  // Render bulk selection toolbar
  renderBulkToolbar() {
    return `
      <div id="${
        this.containerId
      }-bulkToolbar" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-blue-800 font-medium">
            <span id="${this.containerId}-selectedCount">${
      this.selectedFiles.size
    }</span> items selected
          </span>
        </div>
        <div class="flex gap-2">
          <button id="${
            this.containerId
          }-clearSelection" class="px-4 py-2 border-2 border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 hover:border-gray-400 transition font-medium">
            Clear Selection
          </button>
          ${
            this.allowDelete
              ? `
            <button id="${this.containerId}-deleteSelected" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete Selected
            </button>
          `
              : ""
          }
        </div>
      </div>
    `;
  }

  // Render filters and pagination combined
  renderFiltersAndPagination() {
    const totalPages = Math.ceil(this.filteredFiles.length / this.pageSize);
    const startItem =
      this.filteredFiles.length === 0
        ? 0
        : (this.currentPage - 1) * this.pageSize + 1;
    const endItem = Math.min(
      this.currentPage * this.pageSize,
      this.filteredFiles.length
    );

    return `
      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          id="${this.containerId}-search"
          placeholder="Search by file name..."
          value="${this.searchTerm}"
          class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
      </div>

      <!-- Filters and Pagination Row -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Left: Filters -->
        <div class="flex flex-wrap items-center gap-3">
          <label class="text-sm font-medium text-gray-300">Type:</label>
          <select
            id="${this.containerId}-type"
            class="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          >
            <option value="all" ${
              this.typeFilter === "all" ? "selected" : ""
            }>All Types</option>
            <option value="image" ${
              this.typeFilter === "image" ? "selected" : ""
            }>Images</option>
            <option value="video" ${
              this.typeFilter === "video" ? "selected" : ""
            }>Videos</option>
          </select>

          <label class="text-sm font-medium text-gray-300">Sort:</label>
          <select
            id="${this.containerId}-sort"
            class="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          >
            <option value="newest" ${
              this.sortBy === "newest" ? "selected" : ""
            }>Newest First</option>
            <option value="oldest" ${
              this.sortBy === "oldest" ? "selected" : ""
            }>Oldest First</option>
            <option value="name" ${
              this.sortBy === "name" ? "selected" : ""
            }>Name A-Z</option>
            <option value="size" ${
              this.sortBy === "size" ? "selected" : ""
            }>Size</option>
          </select>

          <label class="text-sm font-medium text-gray-300">Per Page:</label>
          <select 
            id="${this.containerId}-pageSize"
            class="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          >
            <option value="12" ${
              this.pageSize === 12 ? "selected" : ""
            }>12</option>
            <option value="20" ${
              this.pageSize === 20 ? "selected" : ""
            }>20</option>
            <option value="36" ${
              this.pageSize === 36 ? "selected" : ""
            }>36</option>
            <option value="50" ${
              this.pageSize === 50 ? "selected" : ""
            }>50</option>
          </select>
        </div>

        <!-- Right: Pagination -->
        ${
          totalPages > 1
            ? `
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-300 font-medium">
            ${startItem}-${endItem} of ${this.filteredFiles.length}
          </span>

          <button 
            id="${this.containerId}-prevPage"
            class="px-3 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            ${this.currentPage === 1 ? "disabled" : ""}
          >
            Previous
          </button>

          <div class="flex items-center gap-2">
            <input 
              type="number" 
              id="${this.containerId}-pageJump"
              min="1" 
              max="${totalPages}" 
              value="${this.currentPage}"
              class="w-16 px-2 py-2 bg-white border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
            <span class="text-sm text-gray-300">of ${totalPages}</span>
          </div>

          <button 
            id="${this.containerId}-nextPage"
            class="px-3 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            ${this.currentPage === totalPages ? "disabled" : ""}
          >
            Next
          </button>
        </div>
        `
            : `
        <span class="text-sm text-gray-300 font-medium">
          ${this.filteredFiles.length} items
        </span>
        `
        }
      </div>
    `;
  }

  // Render media header content (without container wrapper)
  renderMediaHeaderContent() {
    return `
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          ${
            this.allowBulkSelection
              ? `
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="${this.containerId}-selectAll"
                class="w-5 h-5 text-emerald-600 rounded border-gray-500 bg-gray-700 focus:ring-emerald-500 focus:ring-2 cursor-pointer"
              />
              <span class="text-sm font-medium text-gray-300">Select All</span>
            </label>
          `
              : ""
          }
          <h3 class="text-lg font-semibold text-white">Media Files</h3>
        </div>
        <div class="flex items-center gap-4">
          <span id="${
            this.containerId
          }-fileCount" class="text-sm text-gray-300">${
      this.filteredFiles.length
    } files</span>
          ${
            this.showViewToggle
              ? `
            <div class="flex gap-2">
              <button
                id="${this.containerId}-gridView"
                class="p-2 rounded-lg ${
                  this.viewMode === "grid"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                }"
                title="Grid View"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </button>
              <button
                id="${this.containerId}-listView"
                class="p-2 rounded-lg ${
                  this.viewMode === "list"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                }"
                title="List View"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;
  }

  // Render the grid/list of media items
  renderGrid() {
    if (this.isLoading) {
      return `
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p class="text-gray-300 mt-4">Loading media files...</p>
        </div>
      `;
    }

    if (this.filteredFiles.length === 0) {
      return `
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p class="text-gray-300 text-lg font-medium">No media files found</p>
          <p class="text-sm text-gray-400 mt-2">Try adjusting your filters or upload new files</p>
        </div>
      `;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const pageFiles = this.filteredFiles.slice(startIndex, endIndex);

    if (this.viewMode === "list" && this.mode === "page") {
      return this.renderListView(pageFiles, startIndex);
    } else {
      return this.renderGridView(pageFiles, startIndex);
    }
  }

  // Render grid view
  renderGridView(pageFiles, startIndex) {
    return `
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        ${pageFiles
          .map((file, index) => this.renderMediaItem(file, startIndex + index))
          .join("")}
      </div>
    `;
  }

  // Render list view
  renderListView(pageFiles, startIndex) {
    return `
      <div class="space-y-2">
        ${pageFiles
          .map((file, index) =>
            this.renderMediaItemList(file, startIndex + index)
          )
          .join("")}
      </div>
    `;
  }

  // Render a single media item (grid)
  renderMediaItem(file, index) {
    const thumbnailUrl = this.getThumbnailUrl(file);
    const isVideo = file.type === "video";
    const isSelected = this.selectedFiles.has(file.id);

    return `
      <div 
        class="relative group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border-2 ${
          isSelected
            ? "border-emerald-500"
            : "border-transparent hover:border-emerald-500"
        }"
        data-media-index="${index}"
        data-media-id="${file.id}"
        data-media-url="${file.url}"
        data-media-type="${file.type}"
        data-media-name="${file.name}"
      >
        ${
          this.mode === "page" && this.allowBulkSelection
            ? `
          <div class="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              class="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 media-checkbox"
              data-media-id="${file.id}"
              ${isSelected ? "checked" : ""}
            />
          </div>
        `
            : ""
        }
        
        <div class="aspect-video bg-gray-100 flex items-center justify-center">
          ${
            isVideo
              ? `
            <video src="${thumbnailUrl}" class="w-full h-full object-cover" muted preload="metadata" loading="lazy"></video>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="bg-black/60 rounded-full p-3">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          `
              : `
            <img 
              src="${thumbnailUrl}" 
              alt="${file.name}" 
              class="w-full h-full object-cover" 
              loading="lazy"
              decoding="async"
            />
          `
          }
        </div>
        <div class="p-3">
          <p class="text-sm font-medium text-gray-900 truncate" title="${
            file.name
          }">${file.name}</p>
          <p class="text-xs text-gray-500 mt-1">${file.type}${
      file.isDefault ? " • Default" : ""
    }</p>
        </div>
        ${
          this.mode === "modal"
            ? `
          <div class="absolute inset-0 bg-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">
              Select
            </button>
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  // Render a single media item (list)
  renderMediaItemList(file, index) {
    const isVideo = file.type === "video";
    const isSelected = this.selectedFiles.has(file.id);

    return `
      <div 
        class="flex items-center gap-4 bg-white p-4 rounded-lg border ${
          isSelected ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
        } hover:border-emerald-300 transition cursor-pointer"
        data-media-index="${index}"
        data-media-id="${file.id}"
        data-media-url="${file.url}"
        data-media-type="${file.type}"
        data-media-name="${file.name}"
      >
        ${
          this.allowBulkSelection
            ? `
          <input
            type="checkbox"
            class="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 media-checkbox"
            data-media-id="${file.id}"
            ${isSelected ? "checked" : ""}
          />
        `
            : ""
        }
        
        <div class="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
          ${
            isVideo
              ? `
            <video src="${file.url}" class="w-full h-full object-cover" muted preload="metadata"></video>
          `
              : `
            <img src="${file.url}" alt="${file.name}" class="w-full h-full object-cover" loading="lazy" />
          `
          }
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">${file.name}</p>
          <p class="text-xs text-gray-500 mt-1">${
            file.type
          } • ${this.formatFileSize(file.size)}</p>
        </div>
        
        ${
          this.allowDelete
            ? `
          <button
            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition delete-btn"
            data-media-id="${file.id}"
            title="Delete file"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        `
            : ""
        }
      </div>
    `;
  }

  // Render loading state
  renderLoading() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p class="text-gray-600 mt-4">Loading media files...</p>
      </div>
    `;
  }

  // Attach event listeners
  attachEventListeners() {
    // Search
    const searchInput = document.getElementById(`${this.containerId}-search`);
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
        this.render();
      });
    }

    // Type filter
    const typeFilter = document.getElementById(`${this.containerId}-type`);
    if (typeFilter) {
      typeFilter.addEventListener("change", (e) => {
        this.typeFilter = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
        this.render();
      });
    }

    // Sort
    const sortSelect = document.getElementById(`${this.containerId}-sort`);
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.sortBy = e.target.value;
        this.applyFilters();
        this.render();
      });
    }

    // Page size
    const pageSizeSelect = document.getElementById(
      `${this.containerId}-pageSize`
    );
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", (e) => {
        this.pageSize = parseInt(e.target.value);
        this.currentPage = 1;
        this.render();
      });
    }

    // Previous page
    const prevBtn = document.getElementById(`${this.containerId}-prevPage`);
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.render();
          this.scrollToTop();
        }
      });
    }

    // Next page
    const nextBtn = document.getElementById(`${this.containerId}-nextPage`);
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const totalPages = Math.ceil(this.filteredFiles.length / this.pageSize);
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.render();
          this.scrollToTop();
        }
      });
    }

    // Page jump
    const pageJumpInput = document.getElementById(
      `${this.containerId}-pageJump`
    );
    if (pageJumpInput) {
      pageJumpInput.addEventListener("change", (e) => {
        const page = parseInt(e.target.value);
        const totalPages = Math.ceil(this.filteredFiles.length / this.pageSize);
        if (page >= 1 && page <= totalPages) {
          this.currentPage = page;
          this.render();
          this.scrollToTop();
        } else {
          e.target.value = this.currentPage;
        }
      });
    }

    // View toggle
    const gridViewBtn = document.getElementById(`${this.containerId}-gridView`);
    const listViewBtn = document.getElementById(`${this.containerId}-listView`);
    if (gridViewBtn) {
      gridViewBtn.addEventListener("click", () => {
        this.viewMode = "grid";
        this.render();
      });
    }
    if (listViewBtn) {
      listViewBtn.addEventListener("click", () => {
        this.viewMode = "list";
        this.render();
      });
    }

    // Select all checkbox
    const selectAllCheckbox = document.getElementById(
      `${this.containerId}-selectAll`
    );
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", (e) => {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageFiles = this.filteredFiles.slice(startIndex, endIndex);

        if (e.target.checked) {
          pageFiles.forEach((file) => this.selectedFiles.add(file.id));
        } else {
          pageFiles.forEach((file) => this.selectedFiles.delete(file.id));
        }
        this.render();
      });
    }

    // Individual checkboxes
    const checkboxes = document.querySelectorAll(".media-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        e.stopPropagation();
        const fileId = checkbox.dataset.mediaId;
        if (checkbox.checked) {
          this.selectedFiles.add(fileId);
        } else {
          this.selectedFiles.delete(fileId);
        }
        this.render();
      });
    });

    // Clear selection
    const clearSelectionBtn = document.getElementById(
      `${this.containerId}-clearSelection`
    );
    if (clearSelectionBtn) {
      clearSelectionBtn.addEventListener("click", () => {
        this.selectedFiles.clear();
        this.render();
      });
    }

    // Delete selected
    const deleteSelectedBtn = document.getElementById(
      `${this.containerId}-deleteSelected`
    );
    if (deleteSelectedBtn) {
      deleteSelectedBtn.addEventListener("click", () => {
        const filesToDelete = this.allFiles.filter((f) =>
          this.selectedFiles.has(f.id)
        );
        this.showDeleteModal(filesToDelete);
      });
    }

    // Delete individual file (list view)
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const fileId = btn.dataset.mediaId;
        const file = this.allFiles.find((f) => f.id === fileId);
        if (file) {
          this.showDeleteModal([file]);
        }
      });
    });

    // Upload area
    const uploadArea = document.getElementById(
      `${this.containerId}-uploadArea`
    );
    const fileInput = document.getElementById(`${this.containerId}-fileInput`);
    if (uploadArea && fileInput) {
      uploadArea.addEventListener("click", () => fileInput.click());
      uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.currentTarget.classList.add("border-emerald-500", "bg-emerald-50");
      });
      uploadArea.addEventListener("dragleave", (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove("border-emerald-500", "bg-emerald-50");
      });
      uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove("border-emerald-500", "bg-emerald-50");
        const files = e.dataTransfer.files;
        this.handleUpload(files);
      });
      fileInput.addEventListener("change", (e) => {
        const files = e.target.files;
        this.handleUpload(files);
      });
    }

    // Media item clicks
    const container = document.getElementById(this.containerId);
    if (container) {
      container.addEventListener("click", (e) => {
        // Don't trigger if clicking checkbox or delete button
        if (
          e.target.closest(".media-checkbox") ||
          e.target.closest(".delete-btn")
        ) {
          return;
        }

        const mediaCard = e.target.closest("[data-media-index]");
        if (mediaCard) {
          const index = parseInt(mediaCard.dataset.mediaIndex);
          const url = mediaCard.dataset.mediaUrl;
          const type = mediaCard.dataset.mediaType;
          const name = mediaCard.dataset.mediaName;

          if (this.mode === "modal" && this.selectionCallback) {
            this.handleSelection({ url, type, name });
          } else if (this.mode === "page" && this.showViewer) {
            this.openViewer(index);
          }
        }
      });
    }
  }

  // Attach viewer listeners
  attachViewerListeners() {
    const closeBtn = document.getElementById("viewerCloseBtn");
    const prevBtn = document.getElementById("viewerPrevBtn");
    const nextBtn = document.getElementById("viewerNextBtn");
    const deleteBtn = document.getElementById("viewerDeleteBtn");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeViewer());
    }
    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.navigateViewer(-1));
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.navigateViewer(1));
    }
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        const file = this.filteredFiles[this.viewerIndex];
        this.closeViewer();
        this.showDeleteModal([file]);
      });
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      const viewer = document.getElementById("mediaViewer");
      if (!viewer || viewer.classList.contains("hidden")) return;

      if (e.key === "Escape") this.closeViewer();
      if (e.key === "ArrowLeft") this.navigateViewer(-1);
      if (e.key === "ArrowRight") this.navigateViewer(1);
    });
  }

  // Attach delete modal listeners
  attachDeleteModalListeners() {
    const cancelBtn = document.getElementById("deleteModalCancelBtn");
    const confirmBtn = document.getElementById("deleteModalConfirmBtn");

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.closeDeleteModal());
    }
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => this.confirmDelete());
    }
  }

  // Handle file upload
  async handleUpload(files) {
    if (!files || files.length === 0) return;

    console.log(`Uploading ${files.length} files...`);

    for (const file of files) {
      try {
        const { data, error } = await this.supabaseClient.storage
          .from("media")
          .upload(file.name, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) {
          console.error(`Error uploading ${file.name}:`, error);
          alert(`Failed to upload ${file.name}`);
        } else {
          console.log(`Uploaded: ${file.name}`);
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }

    // Reload media
    await this.loadMedia();
    this.render();
  }

  // Open viewer
  openViewer(index) {
    this.viewerIndex = index;
    const file = this.filteredFiles[index];
    if (!file) return;

    const viewer = document.getElementById("mediaViewer");
    const viewerImage = document.getElementById("viewerImage");
    const viewerVideo = document.getElementById("viewerVideo");
    const viewerTitle = document.getElementById("viewerTitle");
    const viewerMeta = document.getElementById("viewerMeta");

    if (file.type === "video") {
      viewerImage.classList.add("hidden");
      viewerVideo.classList.remove("hidden");
      viewerVideo.querySelector("source").src = file.url;
      viewerVideo.load();
    } else {
      viewerVideo.classList.add("hidden");
      viewerImage.classList.remove("hidden");
      viewerImage.src = file.url;
    }

    viewerTitle.textContent = file.name;
    viewerMeta.textContent = `${file.type} • ${this.formatFileSize(file.size)}`;

    viewer.classList.remove("hidden");
    setTimeout(() => {
      viewer.classList.remove("opacity-0");
      viewer.classList.add("opacity-100");
    }, 10);
  }

  // Close viewer
  closeViewer() {
    const viewer = document.getElementById("mediaViewer");
    const viewerVideo = document.getElementById("viewerVideo");

    viewer.classList.remove("opacity-100");
    viewer.classList.add("opacity-0");

    if (viewerVideo) {
      viewerVideo.pause();
    }

    setTimeout(() => {
      viewer.classList.add("hidden");
    }, 200);
  }

  // Navigate viewer
  navigateViewer(direction) {
    this.viewerIndex += direction;
    if (this.viewerIndex < 0) this.viewerIndex = this.filteredFiles.length - 1;
    if (this.viewerIndex >= this.filteredFiles.length) this.viewerIndex = 0;
    this.openViewer(this.viewerIndex);
  }

  // Show delete modal
  showDeleteModal(files) {
    const modal = document.getElementById("deleteModal");
    const title = document.getElementById("deleteModalTitle");
    const detail = document.getElementById("deleteModalDetail");
    const list = document.getElementById("deleteModalList");
    const extra = document.getElementById("deleteModalExtra");

    title.textContent =
      files.length > 1
        ? `Delete ${files.length} files?`
        : `Delete "${files[0].name}"?`;
    detail.textContent =
      files.length > 1
        ? "These files will be permanently removed from storage. This action cannot be undone."
        : "This file will be permanently removed from storage. This action cannot be undone.";

    list.innerHTML = files
      .slice(0, 3)
      .map(
        (file) => `
        <div class="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2">
          <div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100">
            <img src="${file.url}" alt="${
          file.name
        }" class="h-full w-full object-cover" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900 truncate">${
              file.name
            }</p>
            <p class="text-xs text-gray-500">${this.formatFileSize(
              file.size
            )}</p>
          </div>
        </div>
      `
      )
      .join("");

    if (files.length > 3) {
      extra.textContent = `+ ${files.length - 3} more files`;
      extra.classList.remove("hidden");
    } else {
      extra.classList.add("hidden");
    }

    this.pendingDelete = files;

    modal.classList.remove("hidden");
    setTimeout(() => {
      modal.classList.remove("opacity-0");
      modal.classList.add("opacity-100");
    }, 10);
  }

  // Close delete modal
  closeDeleteModal() {
    const modal = document.getElementById("deleteModal");
    modal.classList.remove("opacity-100");
    modal.classList.add("opacity-0");
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 200);
    this.pendingDelete = null;
  }

  // Confirm delete
  async confirmDelete() {
    if (!this.pendingDelete) return;

    const files = this.pendingDelete;
    this.pendingDelete = null;
    this.closeDeleteModal();

    await this.processDeletions(files);
  }

  // Process deletions
  async processDeletions(files) {
    const progressModal = document.getElementById("deletionProgressModal");
    const progressText = document.getElementById("deletionProgressText");
    const progressBar = document.getElementById("deletionProgressBar");

    if (progressModal) {
      progressModal.classList.remove("hidden");
      progressModal.classList.add("opacity-100");
      progressModal.classList.remove("opacity-0");
    }

    const total = files.length;
    let completed = 0;

    for (const file of files) {
      try {
        const displayName =
          file.name.length > 30 ? `${file.name.slice(0, 27)}...` : file.name;
        if (progressText) {
          progressText.textContent = `Deleting ${
            completed + 1
          } of ${total}: ${displayName}`;
        }

        if (!file.isDefault) {
          const { error } = await this.supabaseClient.storage
            .from("media")
            .remove([file.name]);
          if (error) throw error;
        }

        this.selectedFiles.delete(file.id);
        completed++;

        if (progressBar) {
          const percentage = (completed / total) * 100;
          progressBar.style.width = `${percentage}%`;
        }
      } catch (error) {
        console.error(`Error deleting ${file.name}:`, error);
      }
    }

    // Hide progress modal
    if (progressModal) {
      setTimeout(() => {
        progressModal.classList.remove("opacity-100");
        progressModal.classList.add("opacity-0");
        setTimeout(() => {
          progressModal.classList.add("hidden");
        }, 200);
      }, 500);
    }

    // Reload media
    await this.loadMedia();
    this.render();
  }

  // Handle media selection (modal mode)
  handleSelection(file) {
    if (this.selectionCallback) {
      this.selectionCallback(file.url, file.type, file.name);
    }
  }

  // Scroll to top of container
  scrollToTop() {
    const container = document.getElementById(this.containerId);
    if (container) {
      const scrollableParent = container.closest(
        ".overflow-y-auto, .overflow-y-scroll"
      );
      if (scrollableParent) {
        scrollableParent.scrollTop = 0;
      } else {
        container.scrollTop = 0;
      }
    }
  }

  // Refresh media list
  async refresh() {
    await this.loadMedia();
    this.render();
  }
}

// Export for use in other files
if (typeof window !== "undefined") {
  window.MediaSelector = MediaSelector;
}
