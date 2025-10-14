# Dog Bar System Architecture

**Last Updated:** October 14, 2025  
**Project:** Dog Bar St. Pete & Sarasota  
**Technology Stack:** Supabase + Vite + Vanilla JavaScript

---

## 🏗️ High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Public Site   │    │   Admin Portal  │    │   Mobile App    │
│   (St. Pete)    │    │   (Dashboard)   │    │   (Future)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      Supabase Cloud       │
                    │  ┌─────────────────────┐  │
                    │  │   PostgreSQL DB     │  │
                    │  │   (Row Level        │  │
                    │  │    Security)        │  │
                    │  └─────────────────────┘  │
                    │  ┌─────────────────────┐  │
                    │  │   Supabase Auth     │  │
                    │  │   (JWT Tokens)      │  │
                    │  └─────────────────────┘  │
                    │  ┌─────────────────────┐  │
                    │  │   Supabase Storage  │  │
                    │  │   (Media Files)     │  │
                    │  └─────────────────────┘  │
                    │  ┌─────────────────────┐  │
                    │  │   Supabase Realtime │  │
                    │  │   (Live Updates)    │  │
                    │  └─────────────────────┘  │
                    └───────────────────────────┘
```

---

## 🎯 System Components

### 1. Frontend Applications

#### Public Website (`/`)
- **Technology:** Vanilla HTML/CSS/JavaScript
- **Purpose:** Public-facing website for both locations
- **Features:**
  - Event calendar and listings
  - Food truck schedules
  - Contact information
  - Location-specific content
- **Files:**
  - `index.html` - St. Pete homepage
  - `site.html` - Sarasota homepage
  - `pages/calendar.html` - Event calendar
  - `pages/contact-us.html` - Contact page
  - `assets/js/components/` - Reusable components

#### Admin Portal (`/admin/`)
- **Technology:** Vanilla HTML/CSS/JavaScript + Tailwind CSS
- **Purpose:** Content management system for admins
- **Features:**
  - Event management (CRUD)
  - Food truck management
  - Site content editing
  - User management
  - Media library
  - Analytics dashboard
- **Files:**
  - `admin/dashboard.html` - Main dashboard
  - `admin/events.html` - Event management
  - `admin/food-trucks.html` - Food truck management
  - `admin/media.html` - Media library
  - `admin/shared/` - Shared components

### 2. Backend Services (Supabase)

#### Database Layer
- **Technology:** PostgreSQL with Row Level Security
- **Purpose:** Data storage and access control
- **Features:**
  - User authentication and authorization
  - Event and content management
  - Audit logging
  - Data validation and constraints

#### Authentication Service
- **Technology:** Supabase Auth
- **Purpose:** User authentication and session management
- **Features:**
  - JWT token-based authentication
  - Role-based access control
  - Session management
  - Password reset functionality

#### Storage Service
- **Technology:** Supabase Storage
- **Purpose:** File storage and management
- **Features:**
  - Image and video uploads
  - File type validation
  - CDN distribution
  - Access control policies

#### Real-time Service
- **Technology:** Supabase Realtime
- **Purpose:** Live updates and notifications
- **Features:**
  - Live event updates
  - Real-time notifications
  - Collaborative editing (future)

---

## 🔐 Security Architecture

### Authentication Flow

```
1. User Login
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   Client    │───▶│  Supabase   │───▶│ PostgreSQL  │
   │             │    │    Auth     │    │   Database  │
   └─────────────┘    └─────────────┘    └─────────────┘
         │                    │                    │
         │ 2. JWT Token       │ 3. Verify User     │
         │◀───────────────────┼────────────────────│
         │                    │ 4. Return Token    │
         │                    │◀───────────────────│
```

### Authorization Layers

1. **Client-Side Validation**
   - JavaScript checks for valid session
   - Redirects to login if not authenticated
   - Role-based UI elements

2. **API-Level Security**
   - JWT token validation on every request
   - Row Level Security (RLS) policies
   - Function-level access control

3. **Database-Level Security**
   - RLS policies on all tables
   - Admin-only access to sensitive data
   - Public read access to published content

### Security Policies

```sql
-- Example RLS Policy
CREATE POLICY "Admins can read admin_users"
ON admin_users FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);
```

---

## 📊 Data Flow

### Public Site Data Flow

```
1. User visits public site
   ┌─────────────┐
   │   Browser   │
   └──────┬──────┘
          │
2. Load page with JavaScript
   ┌─────────────┐    ┌─────────────┐
   │   HTML/JS   │───▶│  Supabase   │
   │   Client    │    │    API      │
   └─────────────┘    └──────┬──────┘
          │                   │
3. Fetch published events     │
   ┌─────────────┐    ┌──────▼──────┐
   │   Events    │◀───│ PostgreSQL  │
   │   Display   │    │   Database  │
   └─────────────┘    └─────────────┘
```

### Admin Portal Data Flow

```
1. Admin logs in
   ┌─────────────┐    ┌─────────────┐
   │   Admin     │───▶│  Supabase   │
   │   Portal    │    │    Auth     │
   └─────────────┘    └──────┬──────┘
          │                   │
2. JWT token stored           │
   ┌─────────────┐    ┌──────▼──────┐
   │  Local      │◀───│   JWT       │
   │  Storage    │    │   Token     │
   └─────────────┘    └─────────────┘
          │
3. API calls with token
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   Admin     │───▶│  Supabase   │───▶│ PostgreSQL  │
   │   Portal    │    │    API      │    │   Database  │
   └─────────────┘    └─────────────┘    └─────────────┘
```

---

## 🗂️ File Structure

```
Dogbar/
├── admin/                          # Admin portal
│   ├── dashboard.html              # Main dashboard
│   ├── events.html                 # Event management
│   ├── food-trucks.html            # Food truck management
│   ├── media.html                  # Media library
│   ├── users.html                  # User management
│   ├── site-settings.html          # Site content management
│   ├── logs.html                   # Audit logs
│   ├── schema-inspector.html       # Database inspector
│   └── shared/                     # Shared admin components
│       ├── navigation.html         # Navigation component
│       ├── navigation.js           # Navigation logic
│       ├── permissions.js          # Auth & permissions
│       ├── logger.js               # Logging utility
│       ├── sanitize.js             # Input sanitization
│       ├── theme-manager.js        # Dark/light mode
│       └── media-selector.js       # Media upload component
├── assets/                         # Static assets
│   ├── css/
│   │   └── styles.css              # Global styles
│   ├── js/
│   │   ├── app.js                  # Main app logic
│   │   └── components/             # Reusable components
│   │       ├── events.js           # Event display
│   │       ├── footer.js           # Footer component
│   │       ├── header.js           # Header component
│   │       ├── hero.js             # Hero section
│   │       ├── location-chooser.js # Location selector
│   │       └── stats.js            # Statistics display
│   └── media/                      # Static media files
├── pages/                          # Public pages
│   ├── calendar.html               # Event calendar
│   ├── contact-us.html             # Contact page
│   ├── menu.html                   # Menu page
│   └── party-booking.html          # Party booking
├── docs/                           # Documentation
│   ├── DATABASE-SCHEMA.md          # Database documentation
│   ├── API-ENDPOINTS.md            # API documentation
│   ├── SYSTEM-ARCHITECTURE.md      # This file
│   └── rls-*.sql                   # Database migrations
├── config/                         # Configuration
│   ├── docker-compose.yml          # Docker setup
│   └── package.json                # Dependencies
├── scripts/                        # Build scripts
│   ├── security-audit.js           # Security audit
│   └── frontend-security-scan.js   # Frontend security scan
├── index.html                      # St. Pete homepage
├── site.html                       # Sarasota homepage
├── test-security.html              # Security testing page
├── vercel.json                     # Vercel deployment config
└── tailwind.config.js              # Tailwind CSS config
```

---

## 🔄 Development Workflow

### Local Development

1. **Start Development Server**
   ```bash
   npm run dev
   # Starts Vite dev server on http://localhost:5173
   ```

2. **Database Setup**
   - Supabase project configured
   - RLS policies applied
   - Admin users created

3. **Development Process**
   - Edit HTML/CSS/JS files
   - Hot reload for changes
   - Test in browser
   - Deploy to Vercel

### Deployment Process

1. **Build Process**
   ```bash
   npm run build
   # Creates optimized production build
   ```

2. **Vercel Deployment**
   - Automatic deployment on git push
   - Environment variables configured
   - Custom domain setup

3. **Database Migrations**
   - SQL files in `docs/` directory
   - Applied via Supabase SQL Editor
   - Version controlled

---

## 🧪 Testing Strategy

### Security Testing

1. **Automated Tests**
   - `test-security.html` - Browser-based security tests
   - RLS policy verification
   - File upload security
   - XSS vulnerability testing

2. **Manual Testing**
   - Admin authentication flow
   - Public site functionality
   - Cross-browser compatibility
   - Mobile responsiveness

### Performance Testing

1. **Frontend Performance**
   - Page load times
   - JavaScript bundle size
   - Image optimization
   - CDN performance

2. **Database Performance**
   - Query optimization
   - Index usage
   - Connection pooling
   - Caching strategies

---

## 📈 Monitoring & Analytics

### Application Monitoring

1. **Error Tracking**
   - Console error logging
   - Supabase error logs
   - User feedback collection

2. **Performance Monitoring**
   - Page load metrics
   - API response times
   - Database query performance

### Business Analytics

1. **Event Analytics**
   - Event view counts
   - Popular event categories
   - Location-based metrics

2. **User Analytics**
   - Admin activity tracking
   - User engagement metrics
   - Feature usage statistics

---

## 🚀 Future Enhancements

### Planned Features

1. **Mobile App**
   - React Native or Flutter
   - Push notifications
   - Offline support

2. **Advanced Analytics**
   - Google Analytics integration
   - Custom dashboard
   - Business intelligence

3. **Real-time Features**
   - Live event updates
   - Chat functionality
   - Collaborative editing

### Technical Improvements

1. **Performance**
   - Service worker implementation
   - Advanced caching strategies
   - CDN optimization

2. **Security**
   - Two-factor authentication
   - Advanced audit logging
   - Security monitoring

3. **Scalability**
   - Database optimization
   - Load balancing
   - Microservices architecture

---

## 🔧 Configuration

### Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://pkomfbezaollhvcpezaw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
VITE_APP_NAME=Dog Bar
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

### Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

---

## 📚 Documentation

### Technical Documentation

- **Database Schema:** `docs/DATABASE-SCHEMA.md`
- **API Endpoints:** `docs/API-ENDPOINTS.md`
- **System Architecture:** `docs/SYSTEM-ARCHITECTURE.md` (this file)
- **Security Audit:** `SECURITY-AUDIT-REPORT.md`

### User Documentation

- **Admin Guide:** `docs/ADMIN-GUIDE.md` (planned)
- **User Manual:** `docs/USER-MANUAL.md` (planned)
- **API Reference:** `docs/API-REFERENCE.md` (planned)

---

## 🤝 Contributing

### Development Guidelines

1. **Code Style**
   - Use consistent indentation
   - Comment complex logic
   - Follow naming conventions

2. **Security**
   - Validate all inputs
   - Use RLS policies
   - Test security changes

3. **Testing**
   - Test all new features
   - Verify security fixes
   - Check cross-browser compatibility

### Git Workflow

1. **Feature Branches**
   - Create branch for each feature
   - Test thoroughly before merge
   - Use descriptive commit messages

2. **Code Review**
   - Review all changes
   - Check security implications
   - Verify documentation updates

---

**Last Updated:** October 14, 2025  
**Version:** 1.0  
**Maintainer:** Development Team
