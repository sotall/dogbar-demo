# Dog Bar Project Structure

**Last Updated:** January 15, 2025  
**Purpose:** Complete project organization and file structure overview

---

## 📁 Directory Structure

```
Dogbar/
├── 📁 admin/                          # Admin portal (CMS)
│   ├── dashboard.html                 # Main admin dashboard
│   ├── events.html                    # Event management
│   ├── food-trucks.html               # Food truck management
│   ├── media.html                     # Media library
│   ├── users.html                     # User management
│   ├── site-settings.html             # Site content management
│   ├── logs.html                      # Audit logs
│   ├── schema-inspector.html          # Database inspector
│   └── 📁 shared/                     # Shared admin components
│       ├── navigation.html            # Navigation component
│       ├── navigation.js              # Navigation logic
│       ├── permissions.js             # Auth & permissions
│       ├── actions-registry.js        # RBAC actions & roles
│       ├── logger.js                  # Logging utility
│       ├── sanitize.js                # Input sanitization
│       ├── theme-manager.js           # Dark/light mode
│       └── media-selector.js          # Media upload component
│
├── 📁 assets/                         # Static assets
│   ├── 📁 css/                        # Stylesheets
│   │   ├── styles.css                 # Global styles
│   │   ├── tailwind.input.css         # Tailwind source
│   │   └── tailwind.output.css        # Compiled Tailwind
│   ├── 📁 js/                         # JavaScript files
│   │   ├── app.js                     # Main app logic
│   │   ├── config.js                  # Configuration
│   │   ├── 📁 components/             # Reusable components
│   │   │   ├── events.js              # Event display
│   │   │   ├── footer.js              # Footer component
│   │   │   ├── header.js              # Header component
│   │   │   ├── hero.js                # Hero section
│   │   │   ├── location-chooser.js    # Location selector
│   │   │   └── stats.js               # Statistics display
│   │   ├── 📁 social/                 # Social media components
│   │   │   ├── facebook.js
│   │   │   ├── instagram.js
│   │   │   ├── linkedin.js
│   │   │   ├── snapchat.js
│   │   │   ├── tiktok.js
│   │   │   ├── twitter.js
│   │   │   └── youtube.js
│   │   └── 📁 utils/                  # Utility functions
│   │       └── page-hero.js           # Page hero utilities
│   └── 📁 media/                      # Static media files
│       ├── dog_bar.png                # Logo
│       ├── logo.png                   # Logo variant
│       └── 📁 videos/                 # Video assets
│           └── 📁 hero/               # Hero videos
│               ├── sarasota-hero.mp4
│               └── st-pete-hero.mp4
│
├── 📁 docs/                           # Documentation
│   ├── API-ENDPOINTS.md               # API documentation
│   ├── DATABASE-SCHEMA.md             # Database documentation
│   ├── SYSTEM-ARCHITECTURE.md         # System architecture
│   ├── 📁 security/                   # Security documentation
│   │   ├── SECURITY-AUDIT-REPORT.md   # Security audit report
│   │   ├── SECURITY-AUDIT-SUMMARY.md  # Security summary
│   │   └── SECURITY-TESTING-GUIDE.md  # Security testing guide
│   ├── 📁 deployment/                 # Deployment documentation
│   │   ├── MEDIA-COMPONENT-UNIFICATION-COMPLETE.md
│   │   └── MEDIA-SELECTOR-STYLING-FIXED.md
│   └── 📁 migrations/                 # Database migrations
│       ├── role-permissions.sql       # RBAC system setup
│       ├── role-hierarchy-rls.sql     # Role hierarchy security
│       ├── rls-cleanup-and-secure.sql
│       ├── rls-optimized-policies.sql
│       ├── rls-restore-secure-policies.sql
│       └── rls-security-fixes.sql
│
├── 📁 pages/                          # Public pages
│   ├── calendar.html                  # Event calendar
│   ├── contact-us.html                # Contact page
│   ├── debug.html                     # Debug page
│   ├── menu.html                      # Menu page
│   └── party-booking.html             # Party booking
│
├── 📁 tests/                          # Testing suite
│   ├── README.md                      # Testing documentation
│   └── test-security.html             # Security test suite
│
├── 📁 supabase/                       # Supabase configuration
│   └── 📁 migrations/                 # Supabase migrations
│       └── create_page_hero_settings.sql
│
├── 📁 dist/                           # Production build (generated)
│   ├── admin/                         # Built admin pages
│   ├── assets/                        # Built assets
│   ├── pages/                         # Built public pages
│   ├── index.html                     # Built St. Pete homepage
│   └── site.html                      # Built Sarasota homepage
│
├── 📁 node_modules/                   # Dependencies (generated)
│
├── index.html                         # St. Pete homepage (source)
├── site.html                          # Sarasota homepage (source)
├── README.md                          # Project overview
├── PROJECT-STRUCTURE.md               # This file
├── CHANGELOG.md                       # Version history and changes
├── package.json                       # Dependencies & scripts
├── package-lock.json                  # Dependency lock file
├── vite.config.js                     # Vite configuration
├── tailwind.config.js                 # Tailwind CSS configuration
├── postcss.config.js                  # PostCSS configuration
└── vercel.json                        # Vercel deployment configuration
```

---

## 🎯 File Organization Principles

### 1. **Separation of Concerns**

- **Admin Portal:** All admin functionality in `/admin/`
- **Public Site:** All public pages in `/pages/` and root
- **Assets:** All static files in `/assets/`
- **Documentation:** All docs in `/docs/` with subcategories
- **Tests:** All testing files in `/tests/`

### 2. **Logical Grouping**

- **Security:** All security-related docs in `/docs/security/`
- **Deployment:** All deployment docs in `/docs/deployment/`
- **Migrations:** All database migrations in `/docs/migrations/`
- **Components:** Reusable components in `/assets/js/components/`

### 3. **Clear Naming**

- **Descriptive filenames:** `test-security.html`, `media-selector.js`
- **Consistent patterns:** All admin pages end with `.html`
- **Version control friendly:** No spaces in filenames

---

## 📚 Documentation Structure

### Core Documentation

- **`README.md`** - Project overview and getting started
- **`PROJECT-STRUCTURE.md`** - This file (complete structure overview)
- **`docs/FEATURES-OVERVIEW.md`** - Complete features and capabilities
- **`docs/SYSTEM-ARCHITECTURE.md`** - High-level system design
- **`docs/DATABASE-SCHEMA.md`** - Complete database documentation
- **`docs/API-ENDPOINTS.md`** - API reference and examples

### Security Documentation

- **`docs/security/SECURITY-AUDIT-REPORT.md`** - Complete security audit
- **`docs/security/SECURITY-AUDIT-SUMMARY.md`** - Security summary
- **`docs/security/SECURITY-TESTING-GUIDE.md`** - Testing procedures

### Deployment Documentation

- **`docs/deployment/`** - Deployment guides and completion reports

### Database Migrations

- **`docs/migrations/`** - All SQL migration files with version control

---

## 🧪 Testing Structure

### Test Organization

- **`tests/`** - All testing files and documentation
- **`tests/test-security.html`** - Automated security test suite
- **`tests/README.md`** - Testing procedures and documentation

### Test Categories

1. **Security Tests** - Automated vulnerability testing
2. **Functional Tests** - Manual feature testing
3. **Performance Tests** - Load and speed testing
4. **Cross-browser Tests** - Compatibility testing

---

## 🚀 Development Workflow

### File Locations

- **Source files:** Root directory and `/admin/`, `/pages/`, `/assets/`
- **Built files:** `/dist/` (generated by Vite)
- **Documentation:** `/docs/` with organized subdirectories
- **Tests:** `/tests/` with comprehensive test suite

### Configuration Files

- **`package.json`** - Dependencies and scripts
- **`vite.config.js`** - Build configuration
- **`tailwind.config.js`** - CSS framework configuration
- **`vercel.json`** - Deployment configuration

---

## 📋 Maintenance Guidelines

### Adding New Files

1. **Admin features:** Add to `/admin/` directory
2. **Public pages:** Add to `/pages/` directory
3. **Components:** Add to `/assets/js/components/`
4. **Documentation:** Add to appropriate `/docs/` subdirectory
5. **Tests:** Add to `/tests/` directory

### File Naming

- **HTML files:** Use kebab-case (`event-management.html`)
- **JavaScript files:** Use camelCase (`eventManager.js`)
- **CSS files:** Use kebab-case (`admin-styles.css`)
- **Documentation:** Use UPPER-CASE (`SECURITY-GUIDE.md`)

### Documentation Updates

- **Update this file** when adding new directories
- **Update README.md** for major structural changes
- **Update relevant docs** when adding new features

---

## 🔍 Quick Reference

### Key Directories

- **`/admin/`** - Admin portal (CMS)
- **`/pages/`** - Public website pages
- **`/assets/`** - Static assets (CSS, JS, images)
- **`/docs/`** - All documentation
- **`/tests/`** - Testing suite
- **`/dist/`** - Production build

### Key Files

- **`index.html`** - St. Pete homepage
- **`site.html`** - Sarasota homepage
- **`package.json`** - Project configuration
- **`vercel.json`** - Deployment configuration

### Documentation

- **`README.md`** - Start here
- **`PROJECT-STRUCTURE.md`** - This file
- **`docs/SYSTEM-ARCHITECTURE.md`** - System design
- **`docs/DATABASE-SCHEMA.md`** - Database reference

---

**Last Updated:** January 15, 2025  
**Version:** 2.0  
**Maintainer:** Development Team
