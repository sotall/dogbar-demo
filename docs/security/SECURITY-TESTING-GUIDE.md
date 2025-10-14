# Security Testing Guide

## ✅ What We've Done So Far

1. **Created Security Test Suite** (`test-security.html`)

   - Automated tests for storage, RLS, and XSS
   - Browser-based UI with color-coded results
   - Tests actual API calls (not assumptions)

2. **Added Security Headers** (`vercel.json`) ✅ COMPLETED
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Content-Security-Policy
   - Strict-Transport-Security
   - This is a **quick win** - safe to add regardless of test results

---

## 🧪 How to Run Security Tests

### Step 1: Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5173` or `http://localhost:5174`

### Step 2: Open Test Suite

Navigate to: `http://localhost:5173/test-security.html`

### Step 3: Run Tests

Click the buttons to run tests:

1. **Test Storage Security** - Tests file upload restrictions

   - Tries to upload .php, .exe files
   - Tries to upload oversized files (20MB)
   - Tries path traversal attacks
   - Tries to upload malicious HTML

2. **Test RLS Policies** - Tests database access restrictions

   - Tries to read admin_users table
   - Tries to read draft events
   - Tries to update/delete events
   - Tries to read admin logs

3. **XSS Protection Tests** - Manual testing instructions

   - Provides step-by-step guide for testing XSS
   - Shows what payloads to try
   - Explains what to look for

4. **Run All Tests** - Runs complete audit

### Step 4: Review Results

Results are color-coded:

- ✅ **GREEN (SECURE)** - Security measure is working
- ❌ **RED (VULNERABLE)** - Security issue found
- ⚠️ **YELLOW (WARNING)** - Needs attention

---

## 📊 What to Do With Results

### If Everything is ✅ GREEN:

**Good news!** Your security measures are working. No fixes needed for those areas.

Document this in `SECURITY-AUDIT-REPORT.md`:

```markdown
## Test Results (Date: 2025-10-14)

### Storage Security: ✅ SECURE

- Unauthenticated uploads: BLOCKED
- Malicious file types: BLOCKED
- Oversized files: BLOCKED
- Path traversal: BLOCKED

### RLS Policies: ✅ SECURE

- admin_users: Protected
- draft events: Not visible publicly
- Unauthorized modifications: BLOCKED
```

### If You See ❌ RED:

**Action required!** You found an actual vulnerability.

1. Document the specific issue
2. Determine root cause
3. Implement fix
4. Re-run test to verify fix

**Example:**

```markdown
## Vulnerability Found

**Issue:** Unauthenticated PHP upload allowed
**Severity:** HIGH
**Root Cause:** No storage policy restricting file types
**Fix:** Add Supabase storage policy (see SECURITY-AUDIT-REPORT.md)
**Status:** PENDING FIX
```

---

## 🔧 Common Fixes (If Needed)

### If Storage is Vulnerable:

Go to **Supabase Dashboard → Storage → media bucket → Policies**

Add policy:

```sql
CREATE POLICY "Restrict file types"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media'
  AND (
    LOWER(RIGHT(name, 4)) IN ('.jpg', '.png', '.gif', '.mp4')
    OR LOWER(RIGHT(name, 5)) IN ('.jpeg', '.webp')
  )
);
```

### If RLS is Missing:

Go to **Supabase Dashboard → SQL Editor**

```sql
-- Enable RLS on table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Add appropriate policy
CREATE POLICY "Policy name"
ON table_name FOR SELECT
USING (true); -- Adjust based on requirements
```

### If XSS is Vulnerable:

Add `InputSanitizer` to affected files:

```javascript
// Import at top
<script type="module" src="../admin/shared/sanitize.js"></script>;

// Use when rendering
tbody.innerHTML = events
  .map(
    (event) => `
  <td>${InputSanitizer.sanitizeHTML(event.title)}</td>
  <td>${InputSanitizer.sanitizeHTML(event.description)}</td>
`
  )
  .join("");
```

---

## 🎯 Testing Priorities

### High Priority (Test First):

1. Storage security (file uploads)
2. RLS on sensitive tables (admin_users, admin_logs)
3. XSS in event titles/descriptions

### Medium Priority:

4. RLS on public tables (events, site_content)
5. Form input sanitization
6. Session management

### Low Priority:

7. Console logging
8. Inline scripts
9. Dependency versions

---

## 📝 Manual XSS Testing Steps

After running automated tests, manually test XSS:

### Test 1: Admin Events Table

1. Go to `http://localhost:5173/admin/login.html`
2. Login to admin portal
3. Go to Events page
4. Create event with title: `<script>alert("XSS")</script>`
5. Save event
6. Check events table

**Expected (SECURE):**

- Shows as text: `<script>alert("XSS")</script>`
- No alert pops up

**Vulnerable:**

- Alert pops up
- JavaScript executes

### Test 2: Dashboard

1. Go to admin dashboard
2. Check "Recent Activity" section
3. Verify test event doesn't trigger alert

### Test 3: Public Calendar

1. Go to `http://localhost:5173/pages/calendar.html`
2. Find test event
3. Verify XSS doesn't execute

### Test 4: Image Tag XSS

Try creating event with:

```html
<img src=x onerror=alert("XSS2")>
```

Should NOT trigger alert.

### Cleanup

**IMPORTANT:** Delete test events after testing!

---

## 🚀 Next Steps After Testing

1. **Document All Findings**

   - Update `SECURITY-AUDIT-REPORT.md`
   - Mark items as ✅ SECURE or ❌ VULNERABLE
   - Include test evidence (screenshots)

2. **Prioritize Fixes**

   - Fix HIGH risk items first
   - Medium risk within 2 weeks
   - Low risk when convenient

3. **Implement Only Necessary Fixes**

   - Don't fix what isn't broken
   - Test each fix thoroughly
   - Re-run security tests after fixes

4. **Deploy with Confidence**
   - Security headers are already added ✅
   - Deploy to Vercel
   - Verify headers at https://securityheaders.com

---

## 📋 Checklist

Before marking security audit complete:

- [ ] Ran all automated tests in test-security.html
- [ ] Documented all test results
- [ ] Manually tested XSS in 3 locations
- [ ] Fixed any ❌ VULNERABLE items found
- [ ] Re-tested after fixes
- [ ] Verified security headers on deployed site
- [ ] Updated SECURITY-AUDIT-REPORT.md with final status
- [ ] Deleted test events from database

---

## 🔒 Philosophy: Test First, Assume Nothing

**Key Principles:**

1. **Verify > Assume**

   - Don't assume something is vulnerable
   - Test to confirm actual state
   - Save time by not fixing non-issues

2. **Measure > Estimate**

   - Use actual test results
   - Document evidence
   - Make data-driven decisions

3. **Fix > Workaround**

   - Fix root causes, not symptoms
   - Implement proper security controls
   - Don't rely on client-side validation alone

4. **Retest > Trust**
   - Always verify fixes work
   - Run regression tests
   - Continuous security testing

---

## 📞 Need Help?

**If tests show vulnerabilities:**

- Review `SECURITY-AUDIT-REPORT.md` for detailed fixes
- Check Supabase documentation for RLS policies
- Test in isolated environment first

**If tests fail to run:**

- Check browser console for errors
- Verify Supabase credentials are correct
- Ensure dev server is running

---

**Remember:** The goal is to find the TRUTH about your security posture, not to create a false sense of security by assuming everything is perfect!

Run the tests and let the data guide your next steps. 🎯
