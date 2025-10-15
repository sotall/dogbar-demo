# Dog Bar API Endpoints Documentation

**Last Updated:** January 15, 2025  
**Base URL:** `https://pkomfbezaollhvcpezaw.supabase.co`  
**Authentication:** Supabase JWT tokens + RBAC permissions

---

## 🔐 Role-Based Access Control (RBAC) Endpoints

### Role Permissions Management

#### Get Role Permissions Matrix

**GET** `/rest/v1/role_permissions`

```javascript
const { data, error } = await supabase
  .from("role_permissions")
  .select("*")
  .order("role, action_key");
```

**Response:**

```json
[
  {
    "id": "uuid",
    "role": "admin",
    "action_key": "users.create",
    "allowed": true,
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-01-15T00:00:00Z"
  }
]
```

#### Update Role Permissions

**PATCH** `/rest/v1/role_permissions`

```javascript
const { data, error } = await supabase.from("role_permissions").upsert([
  {
    role: "manager",
    action_key: "events.create",
    allowed: true,
  },
]);
```

**Security:** Only super_admin can modify permissions. Users can only edit roles below their rank.

#### Get Current User Role

**GET** `/rest/v1/admin_users`

```javascript
const { data, error } = await supabase
  .from("admin_users")
  .select("role, status")
  .eq("id", auth.uid())
  .single();
```

### Permission Checking

#### Check User Permission

**JavaScript Client-Side:**

```javascript
// Check if user can perform action
const canCreateUsers = await window.PermissionManager.can("users.create");

// Check if user is super admin
const isSuperAdmin = window.PermissionManager.isSuperAdmin();

// Get user role
const userRole = window.PermissionManager.getRole();
```

### Role Hierarchy Functions

#### Get Role Rank

**SQL Function:**

```sql
SELECT role_rank('admin'); -- Returns 4
SELECT role_rank('viewer'); -- Returns 1
```

#### Get Current Admin Role

**SQL Function:**

```sql
SELECT current_admin_role(); -- Returns current user's role
```

---

## 🔐 Authentication Endpoints

### Login

**POST** `/auth/v1/token?grant_type=password`

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: "admin@example.com",
  password: "password",
});
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "67e7f311-41a3-41b8-8738-f28bccd60738",
    "email": "admin@example.com",
    "role": "authenticated"
  }
}
```

### Logout

**POST** `/auth/v1/logout`

```javascript
await supabase.auth.signOut();
```

### Get Current User

**GET** `/auth/v1/user`

```javascript
const {
  data: { user },
  error,
} = await supabase.auth.getUser();
```

---

## 📅 Events API

### Get All Events (Public)

**GET** `/rest/v1/events`

```javascript
// Get published events for St. Pete
const { data: events, error } = await supabase
  .from("events")
  .select("*")
  .eq("status", "published")
  .eq("location", "st-pete")
  .order("event_date", { ascending: true });
```

**Query Parameters:**

- `location`: `st-pete` | `sarasota`
- `status`: `published` | `draft` | `cancelled`
- `featured`: `true` | `false`
- `category`: Event category filter
- `event_date`: Date filter (gte, lte)

### Get Single Event

**GET** `/rest/v1/events?id=eq.{event_id}`

```javascript
const { data: event, error } = await supabase
  .from("events")
  .select("*")
  .eq("id", eventId)
  .single();
```

### Create Event (Admin Only)

**POST** `/rest/v1/events`

```javascript
const { data, error } = await supabase.from("events").insert({
  title: "Live Music Night",
  description: "Amazing local bands",
  event_date: "2025-10-20",
  start_time: "19:00",
  end_time: "23:00",
  location: "st-pete",
  venue: "Dog Bar St. Pete",
  address: "123 Main St, St. Petersburg, FL",
  status: "published",
  featured: false,
  category: "live-music",
  tags: ["music", "live", "local"],
  price: 15.0,
  currency: "USD",
});
```

### Update Event (Admin Only)

**PATCH** `/rest/v1/events?id=eq.{event_id}`

```javascript
const { data, error } = await supabase
  .from("events")
  .update({
    title: "Updated Event Title",
    description: "Updated description",
    status: "published",
  })
  .eq("id", eventId);
```

### Delete Event (Admin Only)

**DELETE** `/rest/v1/events?id=eq.{event_id}`

```javascript
const { error } = await supabase.from("events").delete().eq("id", eventId);
```

---

## 🚚 Food Trucks API

### Get All Food Trucks (Public)

**GET** `/rest/v1/food_trucks`

```javascript
const { data: trucks, error } = await supabase
  .from("food_trucks")
  .select("*")
  .eq("status", "active")
  .eq("location", "st-pete");
```

### Create Food Truck (Admin Only)

**POST** `/rest/v1/food_trucks`

```javascript
const { data, error } = await supabase.from("food_trucks").insert({
  name: "Taco Truck Deluxe",
  description: "Authentic Mexican tacos",
  cuisine_type: "Mexican",
  phone: "(555) 123-4567",
  website: "https://tacotruck.com",
  instagram: "@tacotruckdeluxe",
  location: "st-pete",
  status: "active",
  schedule: {
    monday: { start: "11:00", end: "20:00" },
    tuesday: { start: "11:00", end: "20:00" },
    wednesday: { start: "11:00", end: "20:00" },
    thursday: { start: "11:00", end: "20:00" },
    friday: { start: "11:00", end: "22:00" },
    saturday: { start: "10:00", end: "22:00" },
    sunday: { start: "10:00", end: "20:00" },
  },
});
```

---

## 📄 Site Content API

### Get Site Content (Public)

**GET** `/rest/v1/site_content`

```javascript
// Get homepage content for St. Pete
const { data: content, error } = await supabase
  .from("site_content")
  .select("*")
  .eq("page", "home")
  .eq("location", "st-pete")
  .eq("is_active", true)
  .order("order_index");
```

### Update Site Content (Admin Only)

**PATCH** `/rest/v1/site_content?id=eq.{content_id}`

```javascript
const { data, error } = await supabase
  .from("site_content")
  .update({
    content: "Updated homepage text",
    updated_at: new Date().toISOString(),
  })
  .eq("id", contentId);
```

---

## 🎨 Hero Settings API

### Get Hero Settings (Public)

**GET** `/rest/v1/page_hero_settings`

```javascript
const { data: hero, error } = await supabase
  .from("page_hero_settings")
  .select("*")
  .eq("page", "home")
  .eq("location", "st-pete")
  .eq("is_active", true)
  .single();
```

### Update Hero Settings (Admin Only)

**PATCH** `/rest/v1/page_hero_settings?id=eq.{hero_id}`

```javascript
const { data, error } = await supabase
  .from("page_hero_settings")
  .update({
    title: "Welcome to Dog Bar St. Pete",
    subtitle: "The best dog-friendly bar in St. Petersburg",
    background_image_url: "https://example.com/hero-bg.jpg",
    button_text: "View Events",
    button_url: "/events",
  })
  .eq("id", heroId);
```

---

## 👥 Admin Users API

### Get Admin Users (Admin Only)

**GET** `/rest/v1/admin_users`

```javascript
const { data: admins, error } = await supabase
  .from("admin_users")
  .select("id, email, role, status, full_name, last_login")
  .eq("status", "active");
```

### Create Admin User (Super Admin Only)

**POST** `/rest/v1/admin_users`

```javascript
const { data, error } = await supabase.from("admin_users").insert({
  email: "newadmin@example.com",
  role: "admin",
  status: "active",
  full_name: "New Admin",
  first_name: "New",
  last_name: "Admin",
  job_title: "Content Manager",
});
```

### Update Admin User (Admin Only)

**PATCH** `/rest/v1/admin_users?id=eq.{user_id}`

```javascript
const { data, error } = await supabase
  .from("admin_users")
  .update({
    role: "super_admin",
    job_title: "Senior Manager",
  })
  .eq("id", userId);
```

---

## 📁 Storage API

### Upload File

**POST** `/storage/v1/object/media/{file_path}`

```javascript
const { data, error } = await supabase.storage
  .from("media")
  .upload("events/event-123.jpg", file, {
    cacheControl: "3600",
    upsert: false,
  });
```

### Get File URL

**GET** `/storage/v1/object/public/media/{file_path}`

```javascript
const { data } = supabase.storage
  .from("media")
  .getPublicUrl("events/event-123.jpg");
```

### Delete File

**DELETE** `/storage/v1/object/media/{file_path}`

```javascript
const { error } = await supabase.storage
  .from("media")
  .remove(["events/event-123.jpg"]);
```

### List Files

**GET** `/storage/v1/object/list/media`

```javascript
const { data: files, error } = await supabase.storage
  .from("media")
  .list("events", {
    limit: 100,
    offset: 0,
  });
```

---

## 🔧 RPC Functions

### Check Admin Status

**POST** `/rest/v1/rpc/is_admin_user`

```javascript
const { data: isAdmin, error } = await supabase.rpc("is_admin_user");
```

### Get Dashboard Stats

**POST** `/rest/v1/rpc/get_dashboard_stats`

```javascript
const { data: stats, error } = await supabase.rpc("get_dashboard_stats");
```

---

## 📊 Query Examples

### Complex Event Queries

```javascript
// Get featured events for next 30 days
const { data: featuredEvents } = await supabase
  .from("events")
  .select("*")
  .eq("featured", true)
  .eq("status", "published")
  .gte("event_date", new Date().toISOString().split("T")[0])
  .lte(
    "event_date",
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  )
  .order("event_date");

// Get events by category
const { data: musicEvents } = await supabase
  .from("events")
  .select("*")
  .eq("category", "live-music")
  .eq("status", "published")
  .order("event_date");

// Search events by title
const { data: searchResults } = await supabase
  .from("events")
  .select("*")
  .ilike("title", `%${searchTerm}%`)
  .eq("status", "published");
```

### Analytics Queries

```javascript
// Get event count by month
const { data: monthlyStats } = await supabase
  .from("events")
  .select("event_date")
  .eq("status", "published")
  .gte("event_date", "2025-01-01");

// Get admin activity
const { data: adminActivity } = await supabase
  .from("events")
  .select("created_by, created_at")
  .gte(
    "created_at",
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  );
```

---

## 🚨 Error Handling

### Common Error Responses

```javascript
// Authentication error
{
  "message": "JWT expired",
  "code": "PGRST301",
  "details": "The JWT token has expired"
}

// Permission error
{
  "message": "new row violates row-level security policy",
  "code": "42501",
  "details": "Insufficient privilege"
}

// Validation error
{
  "message": "duplicate key value violates unique constraint",
  "code": "23505",
  "details": "Key (email)=(admin@example.com) already exists"
}
```

### Error Handling Pattern

```javascript
try {
  const { data, error } = await supabase.from("events").insert(eventData);

  if (error) {
    console.error("Database error:", error);
    throw new Error(`Failed to create event: ${error.message}`);
  }

  return data;
} catch (err) {
  console.error("Operation failed:", err);
  throw err;
}
```

---

## 🔒 Security Considerations

### Authentication Required

- All admin operations require valid JWT token
- Token must be from authenticated user
- User must exist in `admin_users` table with `status = 'active'`

### RLS Policies

- All tables have Row Level Security enabled
- Public can only read published/active records
- Admin operations require authentication
- Super admin operations require `role = 'super_admin'`

### Input Validation

- All inputs should be validated client-side
- Server-side validation through RLS policies
- Sanitize user inputs to prevent XSS
- Validate file uploads (type, size, extension)

---

## 📈 Performance Tips

### Query Optimization

- Use specific column selection instead of `*`
- Add appropriate indexes for common queries
- Use pagination for large datasets
- Cache frequently accessed data

### Example Optimized Query

```javascript
// Instead of selecting all columns
const { data } = await supabase
  .from("events")
  .select("*")
  .eq("status", "published");

// Select only needed columns
const { data } = await supabase
  .from("events")
  .select("id, title, event_date, start_time, venue")
  .eq("status", "published")
  .limit(20);
```

---

## 🧪 Testing

### Test Authentication

```javascript
// Test admin login
const { data, error } = await supabase.auth.signInWithPassword({
  email: "test@example.com",
  password: "testpassword",
});

if (error) {
  console.error("Login failed:", error);
} else {
  console.log("Login successful:", data.user.email);
}
```

### Test RLS Policies

```javascript
// Test unauthenticated access (should fail)
const { data, error } = await supabase.from("admin_users").select("*");

if (error) {
  console.log("RLS working - access blocked:", error.message);
} else {
  console.error("SECURITY ISSUE - RLS not working!");
}
```

---

**Last Updated:** October 14, 2025  
**Version:** 1.0  
**Maintainer:** Development Team
