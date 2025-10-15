# Dog Bar Database Schema Documentation

**Last Updated:** January 15, 2025  
**Database:** Supabase PostgreSQL  
**Project:** Dog Bar St. Pete & Sarasota

---

## 📊 Database Overview

The Dog Bar application uses Supabase (PostgreSQL) with the following key components:

- **Authentication:** Supabase Auth with JWT tokens
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Storage:** Supabase Storage for media files
- **Real-time:** Supabase Realtime for live updates

---

## 🔐 Role-Based Access Control (RBAC) Tables

### `role_permissions` Table

**Purpose:** Defines what actions each role can perform

**Schema:**

```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  action_key VARCHAR(100) NOT NULL,
  allowed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, action_key)
);
```

**Available Roles:**

- `super_admin` (Rank 5) - Full system access
- `admin` (Rank 4) - Can manage all non-super_admin roles
- `manager` (Rank 3) - Can manage staff and viewer roles
- `staff` (Rank 2) - Can manage viewer role (if allowed)
- `viewer` (Rank 1) - Read-only access

**Available Actions:**

- `users.view`, `users.create`, `users.edit`, `users.delete`
- `events.view`, `events.create`, `events.edit`, `events.delete`
- `media.view`, `media.upload`, `media.delete`
- `site_settings.view`, `site_settings.edit`
- `logs.view`, `schema.view`, `dashboard.view`
- `food_trucks.view`, `food_trucks.create`, `food_trucks.edit`, `food_trucks.delete`

**RLS Policies:**

- **SELECT:** Super admins and admins can view all permissions
- **UPDATE:** Only allow updating roles with lower rank than current user
- **INSERT:** Only allow creating permissions for lower-rank roles (super_admin only)
- **DELETE:** Only allow deleting permissions for lower-rank roles (super_admin only)

---

## 🗃️ Table Structure

### 1. `admin_users` Table

**Purpose:** Manages admin user accounts and permissions

**Schema:**

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  CONSTRAINT admin_users_role_check CHECK (role IN ('super_admin', 'admin', 'manager', 'staff', 'viewer')),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  full_name VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  department VARCHAR(100),
  job_title VARCHAR(100),
  hire_date DATE,
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  permissions JSONB DEFAULT '[]',
  notes TEXT,
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Roles:**

- `super_admin`: Full system access, can manage other admins
- `admin`: Standard admin access, can manage content
- `viewer`: Read-only access

**Status Values:**

- `active`: User can log in and access system
- `inactive`: User account disabled
- `suspended`: Temporary suspension

**RLS Policies:**

- ✅ **SELECT:** Only authenticated admins can read
- ✅ **INSERT:** Only super admins can create new admin users
- ✅ **UPDATE:** Only authenticated admins can update
- ✅ **DELETE:** Only super admins can delete admin users

---

### 2. `events` Table

**Purpose:** Stores event information for both St. Pete and Sarasota locations

**Schema:**

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(255) NOT NULL, -- 'st-pete' or 'sarasota'
  venue VARCHAR(255),
  address TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'cancelled'
  featured BOOLEAN DEFAULT FALSE,
  image_url VARCHAR(500),
  ticket_url VARCHAR(500),
  facebook_url VARCHAR(500),
  instagram_url VARCHAR(500),
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  category VARCHAR(100), -- 'live-music', 'comedy', 'trivia', 'special-event'
  tags TEXT[], -- Array of tags
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Location Values:**

- `st-pete`: St. Petersburg location
- `sarasota`: Sarasota location

**Status Values:**

- `draft`: Not visible to public, admin only
- `published`: Visible to public
- `cancelled`: Event cancelled, may be visible with notice

**Categories:**

- `live-music`: Musical performances
- `comedy`: Comedy shows
- `trivia`: Trivia nights
- `special-event`: Special occasions, parties, etc.

**RLS Policies:**

- ✅ **SELECT:** Public can read published events only
- ✅ **INSERT:** Only authenticated admins can create events
- ✅ **UPDATE:** Only authenticated admins can update events
- ✅ **DELETE:** Only authenticated admins can delete events

---

### 3. `food_trucks` Table

**Purpose:** Manages food truck schedules and information

**Schema:**

```sql
CREATE TABLE food_trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cuisine_type VARCHAR(100),
  phone VARCHAR(50),
  website VARCHAR(500),
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  schedule JSONB, -- Weekly schedule data
  location VARCHAR(255) NOT NULL, -- 'st-pete' or 'sarasota'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  image_url VARCHAR(500),
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies:**

- ✅ **SELECT:** Public can read active food trucks
- ✅ **INSERT:** Only authenticated admins can create
- ✅ **UPDATE:** Only authenticated admins can update
- ✅ **DELETE:** Only authenticated admins can delete

---

### 4. `site_content` Table

**Purpose:** Stores dynamic content for website pages

**Schema:**

```sql
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page VARCHAR(100) NOT NULL, -- 'home', 'about', 'contact', etc.
  section VARCHAR(100) NOT NULL, -- 'hero', 'about-text', 'contact-info', etc.
  content TEXT NOT NULL,
  content_type VARCHAR(50) DEFAULT 'text', -- 'text', 'html', 'markdown'
  location VARCHAR(255) DEFAULT 'both', -- 'st-pete', 'sarasota', 'both'
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page, section, location)
);
```

**Page Values:**

- `home`: Homepage content
- `about`: About page content
- `contact`: Contact page content
- `events`: Events page content
- `menu`: Menu page content

**Section Examples:**

- `hero`: Hero section content
- `about-text`: Main about text
- `contact-info`: Contact information
- `hours`: Business hours
- `address`: Physical address

**RLS Policies:**

- ✅ **SELECT:** Public can read active content
- ✅ **INSERT:** Only authenticated admins can create
- ✅ **UPDATE:** Only authenticated admins can update
- ✅ **DELETE:** Only authenticated admins can delete

---

### 5. `page_hero_settings` Table

**Purpose:** Manages hero section settings for different pages

**Schema:**

```sql
CREATE TABLE page_hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page VARCHAR(100) NOT NULL, -- 'home', 'events', 'about', etc.
  location VARCHAR(255) NOT NULL, -- 'st-pete', 'sarasota'
  title VARCHAR(255),
  subtitle TEXT,
  background_image_url VARCHAR(500),
  background_video_url VARCHAR(500),
  overlay_opacity DECIMAL(3,2) DEFAULT 0.5,
  text_color VARCHAR(7) DEFAULT '#FFFFFF', -- Hex color
  button_text VARCHAR(100),
  button_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page, location)
);
```

**RLS Policies:**

- ✅ **SELECT:** Public can read active hero settings
- ✅ **INSERT:** Only authenticated admins can create
- ✅ **UPDATE:** Only authenticated admins can update
- ✅ **DELETE:** Only authenticated admins can delete

---

### 6. `admin_logs` Table (Planned)

**Purpose:** Audit trail for admin actions

**Schema:**

```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
  table_name VARCHAR(100), -- Which table was affected
  record_id UUID, -- ID of affected record
  old_values JSONB, -- Previous values (for updates)
  new_values JSONB, -- New values
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies:**

- ✅ **SELECT:** Only super admins can read logs
- ✅ **INSERT:** System can create logs (no user access)
- ❌ **UPDATE:** No updates allowed
- ❌ **DELETE:** No deletes allowed

---

## 🔐 Row Level Security (RLS) Overview

### How RLS Works

Row Level Security is a PostgreSQL feature that restricts which rows users can access based on policies. In Supabase:

1. **Authentication:** Users get JWT tokens with `auth.uid()`
2. **Policies:** Each table has policies that check `auth.uid()`
3. **Admin Check:** Policies verify user is in `admin_users` table
4. **Access Control:** Unauthenticated users get blocked

### Policy Pattern

```sql
-- Standard admin policy pattern
CREATE POLICY "policy_name"
ON table_name FOR operation
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);
```

### Current Security Status

| Table                | RLS Enabled | Public Read    | Admin Write | Status          |
| -------------------- | ----------- | -------------- | ----------- | --------------- |
| `admin_users`        | ✅          | ❌             | ✅          | SECURE          |
| `events`             | ✅          | Published only | ✅          | SECURE          |
| `food_trucks`        | ✅          | Active only    | ✅          | SECURE          |
| `site_content`       | ✅          | Active only    | ✅          | SECURE          |
| `page_hero_settings` | ✅          | Active only    | ✅          | SECURE          |
| `admin_logs`         | ❌          | ❌             | ❌          | Not implemented |

---

## 📁 Storage Buckets

### `media` Bucket

**Purpose:** Stores uploaded images and videos

**Structure:**

```
media/
├── events/
│   ├── event-123-image.jpg
│   └── event-456-video.mp4
├── food-trucks/
│   ├── truck-789-logo.png
│   └── truck-101-photo.jpg
├── hero/
│   ├── st-pete-hero.mp4
│   └── sarasota-hero.mp4
└── general/
    ├── logo.png
    └── background.jpg
```

**Policies:**

- ✅ **Public Read:** Anyone can view media
- ✅ **Admin Upload:** Only authenticated admins can upload
- ✅ **Admin Delete:** Only authenticated admins can delete

**File Types Allowed:**

- Images: `.jpg`, `.jpeg`, `.png`, `.gif`
- Videos: `.mp4`
- Max Size: 10MB per file

---

## 🔧 Database Functions

### `is_admin_user()` Function

**Purpose:** Checks if current user is an admin

```sql
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND status = 'active'
  );
$$;
```

**Usage:**

```javascript
const { data: isAdmin, error } = await supabase.rpc("is_admin_user");
```

---

## 📊 Data Relationships

### Entity Relationship Diagram

```
admin_users (1) ──┐
                  ├── events (created_by, updated_by)
                  ├── food_trucks (created_by, updated_by)
                  ├── site_content (created_by, updated_by)
                  ├── page_hero_settings (created_by, updated_by)
                  └── admin_logs (admin_id)
```

### Key Relationships

1. **Admin Users → All Content**

   - Every content record tracks who created/updated it
   - Enables audit trails and ownership

2. **Events → Locations**

   - Events belong to either St. Pete or Sarasota
   - Location determines which site displays the event

3. **Site Content → Pages & Locations**
   - Content is organized by page and location
   - Allows different content for each location

---

## 🚀 API Endpoints

### Authentication

```javascript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: "admin@example.com",
  password: "password",
});

// Logout
await supabase.auth.signOut();

// Get current user
const {
  data: { user },
} = await supabase.auth.getUser();
```

### Events

```javascript
// Get published events for public site
const { data: events } = await supabase
  .from("events")
  .select("*")
  .eq("status", "published")
  .eq("location", "st-pete")
  .order("event_date", { ascending: true });

// Create new event (admin only)
const { data, error } = await supabase.from("events").insert({
  title: "Live Music Night",
  description: "Amazing local bands",
  event_date: "2025-10-20",
  location: "st-pete",
  status: "published",
});
```

### Media Upload

```javascript
// Upload file to storage
const { data, error } = await supabase.storage
  .from("media")
  .upload("events/event-123.jpg", file, {
    cacheControl: "3600",
    upsert: false,
  });
```

---

## 🔍 Query Examples

### Get Dashboard Stats

```sql
-- Total events by status
SELECT status, COUNT(*) as count
FROM events
GROUP BY status;

-- Recent events
SELECT title, event_date, location, status
FROM events
ORDER BY created_at DESC
LIMIT 10;

-- Admin activity
SELECT au.email, COUNT(e.id) as events_created
FROM admin_users au
LEFT JOIN events e ON au.id = e.created_by
GROUP BY au.id, au.email;
```

### Get Public Event Data

```sql
-- Published events for St. Pete
SELECT title, description, event_date, start_time, venue
FROM events
WHERE status = 'published'
  AND location = 'st-pete'
  AND event_date >= CURRENT_DATE
ORDER BY event_date, start_time;
```

---

## 🛠️ Maintenance Tasks

### Regular Cleanup

```sql
-- Clean up old password reset tokens
UPDATE admin_users
SET password_reset_token = NULL,
    password_reset_expires = NULL
WHERE password_reset_expires < NOW();

-- Archive old events
UPDATE events
SET status = 'archived'
WHERE event_date < CURRENT_DATE - INTERVAL '1 year'
  AND status = 'published';
```

### Performance Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_events_location_status_date
ON events(location, status, event_date);

CREATE INDEX idx_events_featured
ON events(featured) WHERE featured = true;

CREATE INDEX idx_admin_users_status
ON admin_users(status) WHERE status = 'active';
```

---

## 📋 Security Checklist

### RLS Policies

- [ ] All tables have RLS enabled
- [ ] Public tables only allow read access to published/active records
- [ ] Admin tables require authentication
- [ ] No permissive policies exist

### Data Validation

- [ ] All required fields have NOT NULL constraints
- [ ] Email fields have proper validation
- [ ] Date fields have appropriate ranges
- [ ] JSONB fields have proper structure

### Access Control

- [ ] Admin functions use SECURITY DEFINER
- [ ] Sensitive operations require super_admin role
- [ ] Audit logging for critical operations
- [ ] Regular access reviews

---

## 🔄 Migration History

### October 14, 2025

- ✅ Fixed critical RLS vulnerabilities
- ✅ Secured admin_users table
- ✅ Secured events table operations
- ✅ Added comprehensive RLS policies

### Previous Versions

- Initial schema creation
- Basic RLS implementation
- Admin user management
- Event management system

---

## 📞 Support

For database-related issues:

1. **Check RLS Policies:** Verify policies in Supabase dashboard
2. **Review Logs:** Check Supabase logs for errors
3. **Test Queries:** Use Supabase SQL editor to test queries
4. **Documentation:** Refer to this schema documentation

---

**Last Updated:** October 14, 2025  
**Version:** 1.0  
**Maintainer:** Development Team
