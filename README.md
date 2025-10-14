# 🐕 The Dog Bar - Website & Admin Portal

Modern website and admin portal for Florida's premier dog park & bar with locations in St. Petersburg and Sarasota.

[![Status](https://img.shields.io/badge/Status-Production_Ready-green)]()
[![Built with](https://img.shields.io/badge/Built_with-Vite_+_Tailwind-blue)]()

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup

Create `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📁 Project Structure

See [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) for complete directory organization.

**Key Directories:**
- **`/admin/`** - Admin portal (CMS)
- **`/pages/`** - Public website pages  
- **`/assets/`** - Static assets (CSS, JS, images)
- **`/docs/`** - Complete documentation
- **`/tests/`** - Security and functional testing

**Quick Overview:**
```
dogbar/
├── admin/                      # Admin portal
├── assets/                     # Static assets
├── docs/                       # Documentation
│   ├── security/               # Security docs
│   ├── deployment/             # Deployment docs
│   └── migrations/             # Database migrations
├── pages/                      # Public pages
├── tests/                      # Testing suite
├── index.html                  # St. Pete homepage
├── site.html                   # Sarasota homepage
└── package.json                # Dependencies
```

---

## 🏗️ Tech Stack

### Frontend

- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first styling (compiled via PostCSS)
- **Vanilla JavaScript** - ES6 modules, no framework dependencies
- **Vite** - Build tool for fast HMR and optimized production builds

### Backend

- **Supabase** - PostgreSQL database, authentication, file storage
- **Row Level Security (RLS)** - Database-level access control
- **Real-time subscriptions** - Live data updates

### Deployment

- **Vercel** - CI/CD with automatic deployments on push
- **Environment Variables** - Secure credential management

---

## 🗄️ Database

### Tables

- **events** - Food trucks, special events, recurring events
- **food_trucks** - Food truck library with menus and images
- **site_content** - Location-specific content (hours, contact, stats)
- **admin_logs** - Audit trail for admin actions
- **user_permissions** - Role-based access control

### Authentication

- Email/password authentication via Supabase Auth
- Admin portal with permission-based UI
- Session management with automatic token refresh

---

## 🚢 Deployment

### Vercel (Recommended)

The project is configured for Vercel with automatic deployments:

1. **Connect GitHub repo** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Deploy** - Automatic on push to main branch

Build configuration is already set in `vercel.json` and `vite.config.js`.

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy dist/ folder to any static hosting
# (Netlify, Cloudflare Pages, GitHub Pages, etc.)
```

---

## 📖 For AI Agents

### Getting Started

1. Read **`.docs/PROJECT-STATUS.md`** for current state
2. Check **`.docs/CURRENT-SPRINT.md`** for active tasks
3. Review **`.docs/AGENT-RULES.md`** for coding guidelines

### Key Information

- **Database:** Supabase (PostgreSQL)
- **Auth:** Row Level Security + custom permissions
- **Build:** Vite (HMR in dev, optimized prod builds)
- **CSS:** Tailwind (compiled, not CDN)
- **Components:** Modular vanilla JavaScript

### Common Tasks

- **Update events:** Use admin portal at `/admin/events.html`
- **Manage content:** Use admin portal at `/admin/site-settings.html`
- **Add features:** Follow component architecture in `assets/js/components/`
- **Test changes:** `npm run dev` → verify → push to deploy

---

## 🔧 Development

### Adding a New Page

1. Create HTML file in `pages/` or root
2. Add entry to `vite.config.js` input object
3. Include Tailwind CSS link: `<link rel="stylesheet" href="../assets/css/tailwind.output.css" />`
4. Load components via `app.js`

### Adding a Component

1. Create JS file in `assets/js/components/`
2. Export component class or functions
3. Import in `app.js` or page-specific script
4. Follow existing component patterns

### Database Changes

1. Update schema in Supabase dashboard
2. Update RLS policies if needed
3. Document changes in `.docs/supabase-setup.md`
4. Update admin portal interfaces

---

## 📊 Project Status

**Phase:** Production Ready ✅  
**Version:** 1.0.0  
**Last Updated:** October 14, 2025

### ✅ Completed

- Modern responsive website (mobile-first)
- Dual-location system (St. Pete & Sarasota)
- Full admin portal with CRUD operations
- Supabase integration with RLS
- Image upload and management
- Session management and auth
- Audit logging
- Production build pipeline
- **🔒 Security Audit Complete** - All critical vulnerabilities fixed
- **📚 Documentation Complete** - Comprehensive system documentation
- **🧪 Test Suite Created** - Automated security testing
- **📁 Project Organization** - Clean directory structure

### 🧪 Testing

**Security Testing:**
```bash
# Start dev server
npm run dev

# Navigate to security tests
open http://localhost:5173/tests/test-security.html

# Run complete security audit
# Click "Run Complete Security Audit" button
```

**Status:** ✅ **SECURED** - All critical vulnerabilities fixed

---

## 🔗 Links

- **Production:** Coming soon
- **Supabase Dashboard:** https://app.supabase.com
- **Repository:** Private

---

## 📝 License

Private - All rights reserved by The Dog Bar

---

**Built with ❤️ for dog lovers everywhere** 🐾
