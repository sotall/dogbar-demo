# Media Organization Guide

**Purpose:** Guide for organizing images, videos, and other media assets in the Dog Bar project.

---

## 📁 Current Structure

```
dogbar-modern/
└── uploads/
    ├── YYYY/MM/          ← Organized by date (WordPress legacy)
    ├── dogbar-st.pete.mp4
    ├── elementor/        ← WordPress plugin assets (can be removed)
    ├── page_builder_framework/  ← WordPress plugin assets (can be removed)
    └── sb_instagram_feed_images/  ← Instagram cache (can be removed)
```

---

## 🎯 Recommended New Structure

### Option 1: Keep Date-Based (Current System)

**Best for:** Maintaining compatibility with existing content

```
uploads/
├── 2025/
│   ├── 01/
│   │   ├── dogbar-sarasota.mp4
│   │   └── dogbar-sarasota.webm
│   ├── 08/
│   │   ├── latin_lunchbox_menu_820x1024.jpg
│   │   └── img_6138_768x1024.jpeg
│   └── ...
├── dogbar-st.pete.mp4       ← Hero videos (root level)
└── dogbar-sarasota.mp4
```

**Pros:**

- Already in use
- Matches existing content
- Easy chronological tracking

**Cons:**

- Hard to find specific content types
- Mixed content in same folders

---

### Option 2: Type-Based Organization ⭐ RECOMMENDED FOR NEW CONTENT

**Best for:** Easy finding and organizing by content type

```
uploads/
├── videos/
│   ├── hero/
│   │   ├── dogbar-st-pete.mp4
│   │   ├── dogbar-st-pete.webm
│   │   ├── dogbar-sarasota.mp4
│   │   └── dogbar-sarasota.webm
│   ├── events/
│   │   ├── yoga-promo.mp4
│   │   └── party-highlight.mp4
│   └── promos/
│       └── food-truck-clips/
│
├── images/
│   ├── events/
│   │   ├── yoga_2_1_1024x1024.png
│   │   ├── birthday_1.jpg
│   │   └── trivia-night.jpg
│   ├── food-trucks/
│   │   ├── menus/
│   │   │   ├── latin_lunchbox_menu_820x1024.jpg
│   │   │   ├── johnny_nevadas_menu_3.16_1024x577.png
│   │   │   └── got_lobstah_menu_298x400.jpg
│   │   └── logos/
│   │       ├── latin_lunchbox_logo_1024x1024.jpg
│   │       └── kielbasa_bus_logo.png
│   ├── branding/
│   │   ├── logo.png
│   │   ├── logo-white.png
│   │   └── favicon.ico
│   ├── hero/
│   │   ├── dog_bar.png
│   │   └── video_cover.png
│   └── dogs/
│       ├── member-profiles/
│       └── instagram-feed/
│
└── legacy/                  ← Archive old WordPress structure
    └── YYYY/MM/            ← Keep for reference if needed
```

**Pros:**

- Easy to find specific content
- Better organization for admin portal
- Clearer purpose for each folder
- Easier for non-technical staff

**Cons:**

- Requires reorganization of existing content
- Old URLs would break (need redirects)

---

## 🚀 Implementation Strategy

### Phase 1: Keep Existing, Add New Structure ⭐ RECOMMENDED

1. **Keep current `YYYY/MM/` structure** for existing content (don't break URLs)
2. **Create new folders** for new uploads going forward
3. **Gradually migrate** high-traffic images as needed

```
uploads/
├── 2019/ ... 2025/         ← KEEP (legacy content, stable URLs)
├── videos/                 ← NEW (future uploads)
├── images/                 ← NEW (future uploads)
└── legacy/                 ← OPTIONAL (move old WordPress plugin files here)
```

### Phase 2: Supabase Storage (Future Admin Portal)

When building the admin portal, use **Supabase Storage** for new uploads:

**Supabase Buckets:**

```
supabase-storage/
├── event-images/           ← New event photos
├── event-videos/           ← Event video content
├── food-truck-menus/       ← Menu PDFs and images
├── food-truck-logos/       ← Food truck branding
├── dog-profiles/           ← Member dog photos (Phase 2)
└── vaccine-documents/      ← Vaccine records (Phase 2)
```

---

## 📝 Naming Conventions

### For New Uploads

**Images:**

```
{category}-{description}-{size}.{ext}
Examples:
- event-yoga-session-1024x1024.jpg
- food-truck-latin-lunchbox-menu-820x1024.jpg
- logo-dogbar-white-512x512.png
```

**Videos:**

```
{location}-{purpose}-{version}.{ext}
Examples:
- st-pete-hero-video-v2.mp4
- sarasota-hero-video-v1.webm
- event-halloween-promo-30s.mp4
```

### File Size Guidelines

**Images:**

- **Hero/Feature:** 1920px width max, <500KB (WebP preferred)
- **Event Cards:** 800px width, <200KB
- **Thumbnails:** 400px width, <100KB
- **Logos:** SVG preferred, or PNG with transparency

**Videos:**

- **Hero Background:** <5MB, compressed, muted
- **Event Promos:** <10MB, 30-60 seconds
- **Format:** MP4 (H.264) for compatibility, WebM for smaller size

---

## 🗑️ Cleanup Recommendations

### Safe to Remove (WordPress Plugin Assets)

```
uploads/
├── elementor/                    ← DELETE (WordPress plugin)
├── page_builder_framework/       ← DELETE (WordPress plugin)
└── sb_instagram_feed_images/     ← DELETE (Instagram cache, regenerates)
```

**Action:** Move to `legacy/` folder or delete entirely.

---

## 🔗 Integration with Supabase

### Setup Supabase Storage Buckets

**1. Create Buckets in Supabase Dashboard:**

```sql
-- Run in Supabase SQL Editor
-- Public bucket for event images (accessible via URL)
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true);

-- Public bucket for food truck content
INSERT INTO storage.buckets (id, name, public) VALUES ('food-truck-content', 'food-truck-content', true);

-- Private bucket for dog profiles (members only)
INSERT INTO storage.buckets (id, name, public) VALUES ('dog-profiles', 'dog-profiles', false);
```

**2. Set Storage Policies:**

```sql
-- Allow public read access to event images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'event-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'event-images');
```

**3. Upload from Admin Portal:**

```javascript
// Upload image to Supabase Storage
const file = event.target.files[0];
const { data, error } = await supabase.storage
  .from("event-images")
  .upload(`${Date.now()}-${file.name}`, file);

// Get public URL
const {
  data: { publicUrl },
} = supabase.storage.from("event-images").getPublicUrl(data.path);
```

---

## 📊 Current Usage Analysis

### By Content Type (Approximate)

- **Food Truck Menus:** 15+ files (~45%)
- **Event Photos:** 10+ files (~30%)
- **Branding/Logos:** 5+ files (~15%)
- **Hero Images/Videos:** 3+ files (~10%)

### By Year

- **2025:** Most recent (10+ files)
- **2024:** Active year (20+ files)
- **2019-2023:** Legacy content (15+ files)

---

## ✅ Action Items

### Immediate (This Session)

1. **Keep existing structure** - Don't break current URLs
2. **Document where new files go** - Use this guide
3. **Clean up WordPress plugin folders** - Move to `legacy/` or delete

### Short Term (Next 1-2 Sessions)

1. **Create Supabase Storage buckets** - For new uploads via admin portal
2. **Set up upload policies** - Public vs private buckets
3. **Build image upload interface** - In admin portal

### Long Term (Phase 2)

1. **Migrate high-traffic images** - To Supabase Storage
2. **Implement CDN** - For faster global delivery
3. **Add image optimization** - Auto-resize and compress on upload

---

## 🎨 Quick Reference

### Where to Put New Content

| Content Type     | Location                            | Example                   |
| ---------------- | ----------------------------------- | ------------------------- |
| Hero Videos      | `uploads/videos/hero/`              | `st-pete-hero-v2.mp4`     |
| Event Photos     | `uploads/images/events/`            | `yoga-session-2025.jpg`   |
| Food Truck Menus | `uploads/images/food-trucks/menus/` | `latin-lunchbox-menu.jpg` |
| Food Truck Logos | `uploads/images/food-trucks/logos/` | `kielbasa-bus-logo.png`   |
| Brand Assets     | `uploads/images/branding/`          | `logo-white.png`          |

### Where Admin Portal Uploads Go

| Content Type       | Supabase Bucket      | Public?              |
| ------------------ | -------------------- | -------------------- |
| Event Images       | `event-images`       | ✅ Yes               |
| Food Truck Content | `food-truck-content` | ✅ Yes               |
| Dog Profiles       | `dog-profiles`       | ❌ No (members only) |
| Vaccine Docs       | `vaccine-documents`  | ❌ No (private)      |

---

**Last Updated:** January 2025  
**Status:** Hybrid system (filesystem + Supabase Storage)  
**Migration:** Gradual, maintaining backward compatibility
