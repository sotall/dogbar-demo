// Reusable Media Selector Component
// Provides a grid of media files with pagination, filtering, and optional selection
// Can be used in modal mode (for selection) or page mode (for browsing)

class MediaSelector {
  constructor(options = {}) {
    // Configuration
    this.containerId = options.containerId || 'mediaGrid';
    this.mode = options.mode || 'modal'; // 'modal' or 'page'
    this.selectionCallback = options.selectionCallback || null;
    this.showDefaultMedia = options.showDefaultMedia || false;
    this.allowedTypes = options.allowedTypes || ['image', 'video'];
    this.pageSize = options.pageSize || 20;
    this.supabaseClient = options.supabaseClient || window.supabase;
    this.supabaseUrl = options.supabaseUrl || '';
    
    // State
    this.allFiles = [];
    this.filteredFiles = [];
    this.currentPage = 1;
    this.searchTerm = '';
    this.typeFilter = 'all';
    this.sortBy = 'newest';
    this.isLoading = false;
    
    // Default media from repo
    this.defaultMedia = [
      {
        name: 'St. Pete Hero Video',
        url: '/assets/media/videos/hero/st-pete-hero.mp4',
        type: 'video',
        isDefault: true
      },
      {
        name: 'Sarasota Hero Video',
        url: '/assets/media/videos/hero/sarasota-hero.mp4',
        type: 'video',
        isDefault: true
      }
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

    // Load media files
    await this.loadMedia();

    // Render the component
    this.render();
  }

  // Load media from Supabase
  async loadMedia() {
    this.isLoading = true;
    
    try {
      const { data, error } = await this.supabaseClient.storage
        .from('media')
        .list('', {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      // Filter to allowed file types
      const validExtensions = {
        image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        video: ['mp4', 'webm', 'mov']
      };

      const allowedExtensions = [];
      if (this.allowedTypes.includes('image')) {
        allowedExtensions.push(...validExtensions.image);
      }
      if (this.allowedTypes.includes('video')) {
        allowedExtensions.push(...validExtensions.video);
      }

      this.allFiles = data
        .filter(file => {
          const ext = file.name.split('.').pop().toLowerCase();
          return allowedExtensions.includes(ext);
        })
        .map(file => {
          const ext = file.name.split('.').pop().toLowerCase();
          const isVideo = validExtensions.video.includes(ext);
          return {
            name: file.name,
            url: `${this.supabaseUrl}/storage/v1/object/public/media/${file.name}`,
            type: isVideo ? 'video' : 'image',
            size: file.metadata?.size || 0,
            created_at: file.created_at,
            isDefault: false
          };
        });

      // Add default media if enabled
      if (this.showDefaultMedia) {
        this.allFiles = [...this.defaultMedia, ...this.allFiles];
      }

      this.isLoading = false;
      this.applyFilters();
    } catch (error) {
      console.error('Error loading media:', error);
      this.isLoading = false;
      this.allFiles = this.showDefaultMedia ? [...this.defaultMedia] : [];
      this.applyFilters();
    }
  }

  // Apply filters and sorting
  applyFilters() {
    let filtered = [...this.allFiles];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (this.typeFilter !== 'all') {
      filtered = filtered.filter(file => file.type === this.typeFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'oldest':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });

    this.filteredFiles = filtered;

    // Reset to page 1 if current page is out of bounds
    const totalPages = Math.ceil(this.filteredFiles.length / this.pageSize);
    if (this.currentPage > totalPages && totalPages > 0) {
      this.currentPage = 1;
    }
  }

  // Get thumbnail URL with Supabase transform
  getThumbnailUrl(file) {
    if (file.isDefault) {
      // Default media - return as-is
      return file.url;
    }

    if (file.type === 'video') {
      // Videos - return full URL (could add poster frame support)
      return file.url;
    }

    // Images - use Supabase transform for thumbnails
    return `${file.url}?width=300&height=200&resize=cover`;
  }

  // Render the component
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <!-- Filters -->
      <div class="sticky top-0 bg-white z-10 pb-4 mb-4 border-b border-gray-200">
        <div class="flex flex-col lg:flex-row lg:items-center gap-3">
          <div class="flex-1 min-w-[200px]">
            <input
              type="text"
              id="${this.containerId}-search"
              placeholder="Search by file name..."
              value="${this.searchTerm}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <label class="text-sm text-gray-600">Type:</label>
            <select
              id="${this.containerId}-type"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all" ${this.typeFilter === 'all' ? 'selected' : ''}>All Types</option>
              <option value="image" ${this.typeFilter === 'image' ? 'selected' : ''}>Images</option>
              <option value="video" ${this.typeFilter === 'video' ? 'selected' : ''}>Videos</option>
            </select>
            <label class="text-sm text-gray-600">Sort:</label>
            <select
              id="${this.containerId}-sort"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="newest" ${this.sortBy === 'newest' ? 'selected' : ''}>Newest First</option>
              <option value="oldest" ${this.sortBy === 'oldest' ? 'selected' : ''}>Oldest First</option>
              <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Name A-Z</option>
              <option value="size" ${this.sortBy === 'size' ? 'selected' : ''}>Size</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div id="${this.containerId}-grid" class="mb-4">
        ${this.renderGrid()}
      </div>

      <!-- Pagination -->
      <div class="sticky bottom-0 bg-white z-10 pt-4 mt-4 border-t border-gray-200">
        ${this.renderPagination()}
      </div>
    `;

    // Attach event listeners
    this.attachEventListeners();
  }

  // Render the grid of media items
  renderGrid() {
    if (this.isLoading) {
      return `
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p class="text-gray-600 mt-4">Loading media files...</p>
        </div>
      `;
    }

    if (this.filteredFiles.length === 0) {
      return `
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p class="text-gray-500 text-lg font-medium">No media files found</p>
          <p class="text-sm text-gray-400 mt-2">Try adjusting your filters or upload new files</p>
        </div>
      `;
    }

    // Pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const pageFiles = this.filteredFiles.slice(startIndex, endIndex);

    return `
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        ${pageFiles.map((file, index) => this.renderMediaItem(file, startIndex + index)).join('')}
      </div>
    `;
  }

  // Render a single media item
  renderMediaItem(file, index) {
    const thumbnailUrl = this.getThumbnailUrl(file);
    const isVideo = file.type === 'video';

    return `
      <div 
        class="relative group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-emerald-500"
        data-media-index="${index}"
        data-media-url="${file.url}"
        data-media-type="${file.type}"
        data-media-name="${file.name}"
      >
        <div class="aspect-video bg-gray-100 flex items-center justify-center">
          ${isVideo ? `
            <video src="${thumbnailUrl}" class="w-full h-full object-cover" muted preload="metadata"></video>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="bg-black/60 rounded-full p-3">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          ` : `
            <img src="${thumbnailUrl}" alt="${file.name}" class="w-full h-full object-cover" loading="lazy" />
          `}
        </div>
        <div class="p-3">
          <p class="text-sm font-medium text-gray-900 truncate" title="${file.name}">${file.name}</p>
          <p class="text-xs text-gray-500 mt-1">${file.type}${file.isDefault ? ' • Default' : ''}</p>
        </div>
        ${this.mode === 'modal' ? `
          <div class="absolute inset-0 bg-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">
              Select
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Render pagination controls
  renderPagination() {
    const totalPages = Math.ceil(this.filteredFiles.length / this.pageSize);
    
    if (totalPages <= 1) {
      return `
        <div class="flex items-center justify-between text-sm text-gray-600">
          <span>Showing ${this.filteredFiles.length} items</span>
        </div>
      `;
    }

    const startItem = (this.currentPage - 1) * this.pageSize + 1;
    const endItem = Math.min(this.currentPage * this.pageSize, this.filteredFiles.length);

    return `
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm text-gray-600">
          Showing <span class="font-medium">${startItem}-${endItem}</span> of 
          <span class="font-medium">${this.filteredFiles.length}</span> items
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Page Size -->
          <select 
            id="${this.containerId}-pageSize"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          >
            <option value="12" ${this.pageSize === 12 ? 'selected' : ''}>12 per page</option>
            <option value="20" ${this.pageSize === 20 ? 'selected' : ''}>20 per page</option>
            <option value="36" ${this.pageSize === 36 ? 'selected' : ''}>36 per page</option>
            <option value="50" ${this.pageSize === 50 ? 'selected' : ''}>50 per page</option>
          </select>

          <!-- Previous Button -->
          <button 
            id="${this.containerId}-prevPage"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            ${this.currentPage === 1 ? 'disabled' : ''}
          >
            Previous
          </button>

          <!-- Page Jump -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Page</span>
            <input 
              type="number" 
              id="${this.containerId}-pageJump"
              min="1" 
              max="${totalPages}" 
              value="${this.currentPage}"
              class="w-16 px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <span class="text-sm text-gray-600">of ${totalPages}</span>
          </div>

          <!-- Next Button -->
          <button 
            id="${this.containerId}-nextPage"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            ${this.currentPage === totalPages ? 'disabled' : ''}
          >
            Next
          </button>
        </div>
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
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
        this.render();
      });
    }

    // Type filter
    const typeFilter = document.getElementById(`${this.containerId}-type`);
    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => {
        this.typeFilter = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
        this.render();
      });
    }

    // Sort
    const sortSelect = document.getElementById(`${this.containerId}-sort`);
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.applyFilters();
        this.render();
      });
    }

    // Page size
    const pageSizeSelect = document.getElementById(`${this.containerId}-pageSize`);
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        this.pageSize = parseInt(e.target.value);
        this.currentPage = 1;
        this.render();
      });
    }

    // Previous page
    const prevBtn = document.getElementById(`${this.containerId}-prevPage`);
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
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
      nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(this.filteredFiles.length / this.pageSize);
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.render();
          this.scrollToTop();
        }
      });
    }

    // Page jump
    const pageJumpInput = document.getElementById(`${this.containerId}-pageJump`);
    if (pageJumpInput) {
      pageJumpInput.addEventListener('change', (e) => {
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

    // Media item clicks (for selection in modal mode)
    if (this.mode === 'modal' && this.selectionCallback) {
      const container = document.getElementById(this.containerId);
      container.addEventListener('click', (e) => {
        const mediaCard = e.target.closest('[data-media-index]');
        if (mediaCard) {
          const url = mediaCard.dataset.mediaUrl;
          const type = mediaCard.dataset.mediaType;
          const name = mediaCard.dataset.mediaName;
          this.handleSelection({ url, type, name });
        }
      });
    }
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
      const scrollableParent = container.closest('.overflow-y-auto');
      if (scrollableParent) {
        scrollableParent.scrollTop = 0;
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
if (typeof window !== 'undefined') {
  window.MediaSelector = MediaSelector;
}

