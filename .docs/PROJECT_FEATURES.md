# Project Features Documentation

**Purpose:** Complete implementation details for all features, sufficient for full project rebuild.

**Last Updated:** January 2025

---

## 🗄️ Database Schema

### Tables

#### events

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT NOT NULL CHECK (location IN ('st-pete', 'sarasota', 'both')),
  event_type TEXT NOT NULL CHECK (event_type IN ('food-truck', 'special-event', 'recurring')),
  is_featured BOOLEAN DEFAULT false,
  image_url TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'cancelled', 'deleted')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public read access for published events
CREATE POLICY "Public can view published events"
  ON events FOR SELECT
  USING (status = 'published');

-- Admin insert/update/delete
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM admin_users));
```

#### food_trucks

```sql
CREATE TABLE food_trucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  menu_image_url TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Similar RLS policies to events
```

#### site_content

```sql
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT UNIQUE NOT NULL CHECK (location IN ('st-pete', 'sarasota')),
  hours JSONB,
  phone TEXT,
  email TEXT,
  address TEXT,
  stats JSONB,
  hero_text TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Public read, admin write
```

#### admin_logs

```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin read-only
```

#### user_permissions

```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT UNIQUE NOT NULL,
  permissions JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Super admin only
```

### RPC Functions

#### is_admin_user

```sql
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE auth.uid() = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔐 Authentication System

### Files

- `admin/login.html` - Login UI
- `admin/shared/permissions.js` - Auth logic and RBAC

### Implementation

**Login Flow:**

1. User submits email/password in `admin/login.html`
2. Form handler calls `supabase.auth.signInWithPassword()`
3. Success: JWT token stored in localStorage
4. Redirect to return URL or dashboard
5. Failure: Show error message

**Session Management:**

```javascript
// admin/shared/permissions.js
class PermissionManager {
  async checkSession() {
    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession();

    if (!session || error || Date.now() >= session.expires_at * 1000) {
      this.clearSession();
      return false;
    }
    return true;
  }

  async initialize() {
    // Supabase client with auto-refresh
    this.supabase = window.supabase.createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

    // Validate session before loading page
    if (!(await this.checkSession())) {
      window.location.href = "login.html?expired=true";
      return false;
    }

    // Load user and check admin status
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    this.currentUser = user;

    // Check if user is admin via RPC
    const { data: isAdmin } = await this.supabase.rpc("is_admin_user", {
      user_id: user.id,
    });

    if (!isAdmin) {
      alert("Access denied");
      await this.logout();
      return false;
    }

    return true;
  }
}
```

**Logout:**

```javascript
async logout() {
  await this.supabase.auth.signOut();
  this.clearSession();
  window.location.href = "login.html";
}
```

---

## 📊 Event Management (Admin)

### Files

- `admin/events.html` - Events management UI
- `admin/shared/permissions.js` - Permission checks

### Features

#### 1. List Events

**Query:**

```javascript
const { data, error } = await supabase
  .from("events")
  .select("*")
  .order("date", { ascending: false });
```

**Filters:**

- Event type (tabs): all, food-truck, special-event, recurring
- Location dropdown: all, st-pete, sarasota, both
- Status dropdown: all, published, draft, cancelled
- Search: title and description

**Pagination:**

- Page size selector: 10, 20, 50, 100
- Previous/Next buttons
- Jump to page input
- Display: "Showing X-Y of Z"

#### 2. Create Event

**Form fields:**

- Title (required)
- Description (textarea)
- Date (required, date picker, min=today)
- Start time (time picker)
- End time (time picker)
- Location (dropdown: st-pete, sarasota, both)
- Event type (dropdown: food-truck, special-event, recurring)
- Status (dropdown: published, draft, cancelled)
- Image upload (optional)

**Validation:**

- Title: max 200 chars
- Description: max 2000 chars
- Date: cannot be in the past
- Times: end_time > start_time if both provided
- Image: max 5MB, formats: jpg, png, webp

**Insert:**

```javascript
const { data, error } = await supabase.from("events").insert({
  title,
  description,
  date,
  start_time,
  end_time,
  location,
  event_type,
  is_featured: false,
  image_url: uploadedImageUrl,
  status: "published",
});
```

**Image Upload:**

```javascript
const file = document.getElementById("imageInput").files[0];
const fileName = `${Date.now()}_${file.name}`;

const { data, error } = await supabase.storage
  .from("media")
  .upload(fileName, file);

const {
  data: { publicUrl },
} = supabase.storage.from("media").getPublicUrl(fileName);
```

#### 3. Update Event

- Same form as create, pre-populated with existing data
- Image upload optional (preserves existing if not replaced)
- Updates `updated_at` timestamp automatically

#### 4. Delete Event

- Soft delete: sets `status = 'deleted'`
- Confirmation modal required
- Does NOT delete associated image (intentional)
- Audit logged to `admin_logs`

---

## 📱 Public Events Display

### Files

- `assets/js/components/events.js` - Events component
- `site.html` - Main site page

### Implementation

**Fetch Published Events:**

```javascript
class EventsComponent {
  async loadEvents() {
    const { data, error } = await this.supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(10);

    this.events = data || [];
    this.render();
  }
}
```

**Display:**

- Card grid layout
- Each card shows: image, title, date, time, location badge
- Click to expand for full description
- Lazy load images using Intersection Observer
- Mobile responsive (1 col mobile, 2 cols tablet, 3 cols desktop)

---

## 📚 Media Library

### Files

- `admin/media.html` - Media management UI

### Features

#### 1. Upload

- Drag-and-drop zone
- Click to browse
- Multiple file upload
- Progress bars for each file
- Formats: jpg, png, gif, webp, mp4, mov
- Max size: 50MB per file

**Upload Logic:**

```javascript
const files = Array.from(fileInput.files);

for (const file of files) {
  const fileName = `${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from("media")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });
}
```

#### 2. List Files

**Query:**

```javascript
const { data, error } = await supabase.storage.from("media").list("", {
  limit: 500,
  sortBy: { column: "created_at", order: "desc" },
});
```

**Display:**

- Grid layout with thumbnails
- File info: name, size, type, date
- Hover actions: view, delete
- Image caching using in-memory Map

**Caching:**

```javascript
const imageCache = new Map();

function getCachedImage(url) {
  if (imageCache.has(url)) return imageCache.get(url);

  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = reject;
    img.src = url;
  });

  imageCache.set(url, promise);
  return promise;
}
```

#### 3. Filters

- Search by filename
- Filter by type: all, image, video
- Sort by: name, date, size

#### 4. Bulk Selection

- "Select All" checkbox (selects current page)
- Individual checkboxes per item (visible on hover)
- Selection toolbar shows count
- Clear selection button
- Delete selected button

#### 5. Delete

- Single or bulk delete
- Confirmation modal with file list
- Progress modal during deletion
- Dynamic grid update as files delete

---

## 🎨 Navigation (Admin)

### Files

- `admin/shared/navigation.html` - Menu template
- `admin/shared/navigation.js` - Menu logic

### Implementation

**Loading:**

```javascript
class NavigationComponent {
  async init() {
    // Fetch navigation HTML
    const response = await fetch("shared/navigation.html");
    const html = await response.text();
    document.body.insertAdjacentHTML("afterbegin", html);

    // Wait for PermissionManager to be ready
    await this.waitForPermissionManager();

    // Highlight current page
    this.highlightCurrentPage();

    // Attach event listeners
    this.attachEventListeners();

    // Update user email
    this.updateUserEmail();
  }
}
```

**Mobile Menu:**

- Hamburger button visible on all screen sizes
- Email and logout hidden on mobile (<768px)
- Drawer slides in from right
- Backdrop closes menu on click

---

## 🔄 Environment Configuration

### Files

- `.env.local` - Local development (gitignored)
- `vercel.json` - Production config
- `assets/js/config.js` - Config accessor

### Access Pattern

```javascript
// All files use import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vite injects at build time
```

---

## 🚀 Build & Deployment

### Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server (localhost:5173)
npm run build            # Production build to dist/
npm run preview          # Preview production build
```

### Vercel Deployment

1. Push to GitHub
2. Vercel auto-detects changes
3. Runs `npm run build`
4. Injects environment variables
5. Deploys `dist/` to CDN
6. Updates live site

### Build Output

```
dist/
├── index.html
├── site.html
├── admin/*.html
├── assets/
│   ├── *.css (minified)
│   └── *.js (minified, code-split)
└── env-config.js
```

---

## 📝 Audit Logging

### Implementation

All admin actions logged to `admin_logs` table with:

- user_id (who)
- action (what: create, update, delete)
- table_name (where)
- record_id (which)
- changes (diff of old vs new)
- created_at (when)

**Example:**

```javascript
await supabase.from("admin_logs").insert({
  user_id: currentUser.id,
  action: "update",
  table_name: "events",
  record_id: eventId,
  changes: { title: { old: "Old Title", new: "New Title" } },
});
```

---

## 📸 Unified Media Selector Component

**Feature:** Reusable media management component supporting both modal selection and full page library management.

**Purpose:** Provide a single, consistent media interface across the admin portal, eliminating code duplication and ensuring feature parity.

### Files Involved

- `admin/shared/media-selector.js` - Unified MediaSelector class (~2000 lines)
- `admin/media.html` - Media library page (now ~220 lines, down from ~2400)
- `admin/site-settings.html` - Uses MediaSelector for hero background selection

### Component Modes

#### Modal Mode (`mode: "modal"`)

Used for media selection (e.g., hero backgrounds in site-settings):

```javascript
const mediaSelector = new MediaSelector({
  containerId: "mediaSelectorGrid",
  mode: "modal",
  selectionCallback: selectMedia, // Called when user selects a file
  showDefaultMedia: true,
  pageSize: 12,
  supabaseClient: supabase,
  supabaseUrl: supabaseUrl,
});
```

**Features:**
- Media grid display
- Search, filter, sort
- Pagination
- Click to select
- Calls callback with selected file

#### Page Mode (`mode: "page"`)

Used for full media library management (admin/media.html):

```javascript
const mediaManager = new MediaSelector({
  containerId: "mediaGrid",
  mode: "page",
  allowUpload: true,
  allowDelete: true,
  allowBulkSelection: true,
  showViewToggle: true,
  showViewer: true,
  pageSize: 20,
  supabaseClient: supabase,
  supabaseUrl: supabaseUrl,
});
```

**Features:**
- All modal mode features, plus:
- Drag-and-drop file upload
- Bulk selection with checkboxes
- Bulk delete
- Grid/list view toggle
- Full-screen image/video viewer with keyboard navigation
- Individual file delete
- Select all/clear selection

### Key Methods

#### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerId` | string | `"mediaGrid"` | DOM element ID to render into |
| `mode` | string | `"modal"` | `"modal"` or `"page"` |
| `selectionCallback` | function | `null` | Called on file selection (modal mode) |
| `allowUpload` | boolean | `false` | Show upload area (page mode) |
| `allowDelete` | boolean | `false` | Show delete buttons (page mode) |
| `allowBulkSelection` | boolean | `false` | Show checkboxes for bulk ops (page mode) |
| `showViewToggle` | boolean | `false` | Show grid/list toggle (page mode) |
| `showViewer` | boolean | `false` | Enable full-screen viewer (page mode) |
| `pageSize` | number | `20` | Items per page |
| `supabaseClient` | object | `window.supabase` | Supabase client instance |
| `supabaseUrl` | string | `""` | Supabase project URL |

#### Public Methods

- `async init()` - Initialize component, load media, render
- `async loadMedia()` - Fetch media from Supabase storage
- `async refresh()` - Reload media and re-render
- `applyFilters()` - Apply search, type, and sort filters
- `render()` - Re-render the entire component
- `openViewer(index)` - Open full-screen viewer (page mode)
- `closeViewer()` - Close viewer
- `handleUpload(files)` - Upload files to storage (page mode)
- `showDeleteModal(files)` - Show delete confirmation (page mode)
- `processDeletions(files)` - Delete files with progress modal (page mode)

### State Management

The component maintains internal state:

```javascript
{
  allFiles: [],           // All media from storage
  filteredFiles: [],      // After search/filter/sort
  currentPage: 1,         // Current pagination page
  searchTerm: "",         // Search query
  typeFilter: "all",      // "all", "image", or "video"
  sortBy: "newest",       // "newest", "oldest", "name", "size"
  viewMode: "grid",       // "grid" or "list" (page mode)
  selectedFiles: Set(),   // IDs of selected files (page mode)
  imageCache: Map()       // In-memory image cache for performance
}
```

### Media File Structure

```javascript
{
  id: "filename.jpg",             // Unique identifier
  name: "filename.jpg",           // Display name
  url: "https://...public/media/filename.jpg", // Full URL
  type: "image" | "video",        // Media type
  size: 1048576,                  // Size in bytes
  created_at: "2025-01-14T...",  // Upload timestamp
  isDefault: false                // True for hardcoded repo files
}
```

### Performance Optimizations

1. **Image Caching**: In-memory `Map` cache for faster subsequent loads
2. **Lazy Loading**: Native `loading="lazy"` on images
3. **Async Decoding**: `decoding="async"` to prevent main thread blocking
4. **Pagination**: Only render current page items
5. **CSS-based Thumbnails**: Falls back to CSS sizing when Supabase transforms unavailable (free tier)

### Modals and UI Elements

#### Page Mode UI Elements

1. **Upload Area**: Drag-and-drop zone with file input
2. **Bulk Toolbar**: Shows selection count, clear, and delete buttons
3. **View Toggle**: Switch between grid and list views
4. **Full-Screen Viewer**: 
   - Image/video display
   - Previous/next navigation
   - Delete button
   - Keyboard controls (arrow keys, ESC)
5. **Delete Confirmation Modal**: Shows files to be deleted with previews
6. **Deletion Progress Modal**: Live progress bar during bulk delete

### Integration Example (Page Mode)

```html
<!-- admin/media.html -->
<div id="mediaGrid"></div>

<script type="module">
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  
  const mediaManager = new MediaSelector({
    containerId: "mediaGrid",
    mode: "page",
    allowUpload: true,
    allowDelete: true,
    allowBulkSelection: true,
    showViewToggle: true,
    showViewer: true,
    pageSize: 20,
    supabaseClient: supabase,
    supabaseUrl: SUPABASE_URL,
  });
  
  await mediaManager.init();
  
  // Refresh button
  document.getElementById("refreshBtn").addEventListener("click", () => {
    mediaManager.refresh();
  });
</script>
```

### Integration Example (Modal Mode)

```html
<!-- admin/site-settings.html -->
<div id="mediaSelectorGrid"></div>

<script>
  let mediaSelector = null;
  
  function openMediaModal() {
    if (!mediaSelector) {
      mediaSelector = new MediaSelector({
        containerId: "mediaSelectorGrid",
        mode: "modal",
        selectionCallback: (url, type, name) => {
          console.log("Selected:", url, type, name);
          // Handle selection
        },
        showDefaultMedia: true,
        pageSize: 12,
        supabaseClient: supabase,
        supabaseUrl: supabaseUrl,
      });
    }
    await mediaSelector.init();
  }
</script>
```

### Benefits

✅ **Single Source of Truth**: One component for all media displays
✅ **Consistent UI**: Same look and feel everywhere
✅ **Reduced Code**: Eliminated ~2200 lines of duplicate code
✅ **Easier Maintenance**: Fix bugs once, applies everywhere
✅ **Feature Parity**: All features available in appropriate contexts
✅ **Scalable**: Easy to add new features to both modes

### Edge Cases Handled

1. **No files**: Shows empty state with helpful message
2. **Upload errors**: Logs errors, shows alerts
3. **Delete errors**: Continues with remaining files, logs errors
4. **Supabase transforms disabled**: Falls back to CSS-based sizing
5. **Large file lists**: Pagination prevents performance issues
6. **Video playback**: Pauses video when closing viewer
7. **Keyboard navigation**: ESC closes viewer, arrows navigate

### Dependencies

- Supabase JS SDK (v2)
- Tailwind CSS (for styling)
- Modern browser with ES6+ support
- Supabase Storage bucket named `media`

### Supabase Storage Configuration

The component expects a Supabase Storage bucket named `media` with public access:

```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Authenticated users can upload
CREATE POLICY "Authenticated can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Authenticated users can delete their uploads
CREATE POLICY "Authenticated can delete media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND auth.role() = 'authenticated');
```

---

**This document will be updated as features are added or modified.**
