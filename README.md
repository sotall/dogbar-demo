# 🐕 The Dog Bar - Modern Website & Admin Portal

**Florida's Premier Dog Park & Bar** - St. Petersburg & Sarasota

[![Status](https://img.shields.io/badge/Status-In_Development-yellow)]()
[![Phase](https://img.shields.io/badge/Phase-1A_Database_Integration-blue)]()
[![License](https://img.shields.io/badge/License-Private-red)]()

---

## 📚 Documentation

### 📖 Start Here

- **[PROJECT-PLAN.md](../PROJECT-PLAN.md)** - Complete project strategy, technical architecture, and long-term vision
- **[PROJECT-STATUS.md](PROJECT-STATUS.md)** - Current progress, technical setup, and session history
- **[CURRENT-SPRINT.md](CURRENT-SPRINT.md)** - Active tasks and immediate priorities
- **[MEDIA-ORGANIZATION.md](MEDIA-ORGANIZATION.md)** - Guide for organizing images, videos, and media assets

### 📝 Additional Resources

- **[TODO.md](../TODO.md)** - Original task list and design guidelines (being phased out)
- **[COCKTAIL MENU.docx](../COCKTAIL%20MENU.docx)** - Current drinks menu content

---

## 🌐 Live Sites

### Production (Current)

- **St. Pete:** https://dogbarstpete.com
- **Sarasota:** https://dbsrq.com

### Development (New Modern Site)

- **Demo:** https://sotall.github.io/dogbar-demo/
- **GitHub:** https://github.com/sotall/dogbar-demo

---

## 📁 Project Structure

```
dogbar-modern/
│
├── 📄 Documentation
│   ├── README.md                    ← You are here
│   ├── PROJECT-STATUS.md            ← Current status & session tracking
│   ├── CURRENT-SPRINT.md            ← Active tasks
│   ├── MEDIA-ORGANIZATION.md        ← Media files guide
│   └── ../PROJECT-PLAN.md           ← Strategic plan (in parent folder)
│
├── 🌐 Public Pages
│   ├── index.html                   ← Location chooser (landing page)
│   ├── site.html                    ← Main website (dynamic, location-aware)
│   ├── calendar.html                ← Events calendar
│   ├── party-booking.html           ← Party booking system
│   ├── food-menu.html               ← Food menu
│   ├── drinks-menu-st-pete.html     ← St. Pete drinks menu
│   └── drinks-menu-sarasota.html    ← Sarasota drinks menu
│
├── 🧩 Shared Components
│   └── shared/
│       ├── components/
│       │   ├── header.js            ← Navigation header
│       │   ├── hero.js              ← Hero section with video
│       │   ├── stats.js             ← Stats bar
│       │   ├── events.js            ← Events display
│       │   ├── footer.js            ← Footer
│       │   └── location-chooser.js  ← Location switcher
│       ├── styles.css               ← Global styles
│       └── app.js                   ← Main application controller
│
├── ⚙️ Configuration
│   └── config/
│       ├── st-pete.json             ← St. Pete location config
│       └── sarasota.json            ← Sarasota location config
│
└── 📦 Assets
    └── uploads/                     ← Images, videos, and media files
        ├── YYYY/MM/                 ← Legacy date-based structure (keep for compatibility)
        ├── videos/                  ← New video uploads (recommended)
        ├── images/                  ← New image uploads (recommended)
        │   ├── events/              ← Event photos
        │   ├── food-trucks/         ← Food truck menus & logos
        │   └── branding/            ← Logo, brand assets
        └── dogbar-st.pete.mp4       ← Hero videos (root level)
```

---

## 🔧 Technical Stack

### Frontend

- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first styling
- **Vanilla JavaScript** - No framework dependencies
- **Component Architecture** - Modular, reusable code

### Backend

- **Supabase** - PostgreSQL database, authentication, file storage
- **Database:** 3 tables (events, food_trucks, site_content)
- **Storage:** Image uploads with compression
- **Auth:** Email/password for admin portal

### Hosting & Deployment

- **Current:** GitHub Pages (static hosting)
- **Future:** Vercel/Netlify (for admin portal with serverless functions)
- **Version Control:** Git + GitHub
- **CI/CD:** Automatic deployments on push to main

---

## 🗄️ Database Schema

### Events Table

Stores all events (food trucks, special events, recurring)

```sql
id, title, description, date, start_time, end_time,
location, event_type, is_featured, image_url, status
```

### Food Trucks Table

Library of all food trucks

```sql
id, name, description, logo_url, menu_image_url,
website, is_active
```

### Site Content Table

Location-specific content (hours, contact, stats)

```sql
id, location, hours, phone, email, address,
stats, hero_text
```

---

## 🚀 Quick Start

### For Developers

**1. Clone the repository:**

```bash
git clone https://github.com/sotall/dogbar-demo.git
cd dogbar-demo/dogbar-modern
```

**2. Install dependencies:**

```bash
# No npm packages needed! Pure HTML/CSS/JS
# Just open in a browser or use a local server
python -m http.server 8000
# Or use VS Code Live Server extension
```

**3. Open in browser:**

```
http://localhost:8000/index.html
```

### For AI Agents

**1. Read these docs first:**

- Start with [PROJECT-STATUS.md](PROJECT-STATUS.md) for current state
- Check [CURRENT-SPRINT.md](CURRENT-SPRINT.md) for active tasks
- Reference [PROJECT-PLAN.md](../PROJECT-PLAN.md) for strategy

**2. Key information:**

- Supabase URL: `https://pkomfbezaollhvcpezaw.supabase.co`
- Anon Key: Check PROJECT-STATUS.md
- Database: 3 tables (events, food_trucks, site_content)

**3. Common tasks:**

- Update events: Modify in Supabase dashboard
- Add pages: Follow component architecture pattern
- Test changes: Push to GitHub → auto-deploys

---

## 📊 Project Status

### ✅ Completed

- Modern website structure with component architecture
- Responsive design (mobile-first)
- Dual-location system (St. Pete & Sarasota)
- Supabase database setup
- Sample data loaded

### 🚧 In Progress

- Website-database integration
- Admin portal foundation
- Image upload system

### ⏳ Planned

- Event management interface
- Food truck scheduler
- User authentication & roles
- Mobile apps (iOS & Android)

---

## 🎯 Project Goals

### Phase 1A: Database Integration (Current)

Connect website to Supabase and replace hardcoded JSON with real database calls.

### Phase 1B: Admin Portal (Next)

Build login, event management, image uploads, and site settings.

### Phase 2: Mobile Apps (Future)

Native iOS/Android apps for members to manage dogs, memberships, and check-ins.

---

## 🔐 Access & Credentials

### Supabase Dashboard

- **URL:** https://app.supabase.com
- **Login:** Via GitHub account
- **Project:** dogbar

### GitHub Repository

- **URL:** https://github.com/sotall/dogbar-demo
- **Branch:** main
- **Auto-deploy:** On push to main

---

## 📞 Support

### For Session Recovery

1. Read [PROJECT-STATUS.md](PROJECT-STATUS.md) - Current status
2. Check [CURRENT-SPRINT.md](CURRENT-SPRINT.md) - Active tasks
3. Review Supabase dashboard - Verify data

### Common Issues

**Problem:** Website not loading data
**Solution:** Check Supabase connection in browser console

**Problem:** Changes not appearing on live site
**Solution:** Wait 2-3 minutes for GitHub Pages to rebuild

**Problem:** Git push rejected
**Solution:** Pull latest changes first: `git pull origin main`

---

## 📈 Key Metrics

- **Mobile Traffic:** 75% (design mobile-first!)
- **Locations:** 2 (St. Pete & Sarasota)
- **Database Tables:** 3 (events, food_trucks, site_content)
- **Sample Events:** 5 loaded
- **Components:** 6 (header, hero, stats, events, footer, location-chooser)

---

## 🤝 Contributing

This is a private project built collaboratively with AI agents. Development follows an iterative approach:

1. **Plan** - Define requirements
2. **Build** - Implement features
3. **Test** - Verify functionality
4. **Deploy** - Push to production
5. **Iterate** - Refine based on feedback

---

## 📜 License

Private - All rights reserved by The Dog Bar

---

## 🙏 Acknowledgments

- **AI Agents:** Claude (Anthropic) for development assistance
- **Tech Stack:** Supabase, Tailwind CSS, GitHub
- **Design Inspiration:** DOG PPL Brooklyn, Apple.com, Stripe.com

---

**Last Updated:** January 2025  
**Current Phase:** Phase 1A - Database Integration  
**Next Milestone:** Admin Portal Foundation

---

## 🗺️ Navigation Map

```
dogbar-modern/
│
├── 📖 READ THIS FIRST
│   └── README.md ← You are here
│
├── 📊 CHECK CURRENT STATUS
│   └── PROJECT-STATUS.md
│
├── 📋 SEE ACTIVE TASKS
│   └── CURRENT-SPRINT.md
│
└── 📚 UNDERSTAND THE VISION
    └── ../PROJECT-PLAN.md
```

**Start your session:** Read PROJECT-STATUS.md → Check CURRENT-SPRINT.md → Begin coding!
