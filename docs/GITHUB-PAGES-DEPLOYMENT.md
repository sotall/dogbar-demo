# GitHub Pages Deployment Guide

## Overview

GitHub Pages doesn't support environment variables like Vercel or Netlify, but we've created a flexible configuration system that works for both development and production.

## Configuration System

### How It Works

1. **Development**: Uses environment variables from `.env.local`
2. **GitHub Pages**: Uses `public/config.js` as fallback
3. **Automatic Detection**: The system automatically chooses the right configuration

### Files Created

- `public/config.js` - Configuration for GitHub Pages
- `shared/config.js` - Configuration manager
- `.github/workflows/deploy.yml` - GitHub Actions workflow

## Deployment Options

### Option 1: GitHub Actions (Recommended)

#### Setup Steps:

1. **Add Repository Secrets:**

   - Go to your GitHub repository
   - Click Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VITE_SUPABASE_URL`: `https://pkomfbezaollhvcpezaw.supabase.co`
     - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

2. **Enable GitHub Pages:**

   - Go to Settings → Pages
   - Source: "GitHub Actions"
   - The workflow will automatically deploy on push to master

3. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin master
   ```

### Option 2: Manual Build & Deploy

#### Steps:

1. **Build locally with environment variables:**

   ```bash
   # Set environment variables
   $env:VITE_SUPABASE_URL="https://pkomfbezaollhvcpezaw.supabase.co"
   $env:VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

   # Build
   npm run build
   ```

2. **Deploy the dist folder:**
   - Copy contents of `dist/` folder to your GitHub Pages branch
   - Or use GitHub Desktop to sync the dist folder

### Option 3: Use Config File Only

#### Steps:

1. **Update `public/config.js`** with your credentials
2. **Build normally:**
   ```bash
   npm run build
   ```
3. **Deploy the dist folder** to GitHub Pages

## Configuration Priority

The system checks for configuration in this order:

1. **Environment Variables** (Vite dev/build)

   ```javascript
   import.meta.env.VITE_SUPABASE_URL;
   import.meta.env.VITE_SUPABASE_ANON_KEY;
   ```

2. **Window Config** (GitHub Pages)

   ```javascript
   window.APP_CONFIG.supabaseUrl;
   window.APP_CONFIG.supabaseKey;
   ```

3. **Fallback** (Error handling)
   - Logs warnings if no configuration found

## Security Considerations

### For GitHub Pages:

- ✅ **Public Repository**: `public/config.js` is visible in your repo
- ⚠️ **API Key Exposure**: The anon key is visible but this is normal for client-side apps
- ✅ **RLS Protection**: Your data is still protected by Row Level Security policies

### For Private Repository:

- ✅ **More Secure**: Only collaborators can see the config file
- ✅ **Same RLS Protection**: Data security remains the same

## Testing Your Deployment

### 1. Local Test with Config File:

```bash
# Serve the built files
npx serve dist
# Visit http://localhost:3000
```

### 2. Test All Admin Pages:

- Login page
- Dashboard
- Users management
- Events management
- Food trucks
- Media management
- Site settings
- Logs
- Schema inspector

### 3. Verify Environment Detection:

Open browser console and check:

```javascript
// Should show your Supabase URL
console.log(window.APP_CONFIG?.supabaseUrl);
```

## Troubleshooting

### Build Fails:

```bash
# Check if environment variables are set
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### Pages Don't Load:

1. Check browser console for errors
2. Verify `public/config.js` is accessible
3. Check network tab for failed requests

### Authentication Issues:

1. Verify Supabase URL and key are correct
2. Check RLS policies are enabled
3. Test with a known working admin account

## File Structure After Deployment

```
your-repo/
├── .github/workflows/deploy.yml
├── public/config.js
├── shared/config.js
├── admin/
│   ├── dashboard.html (updated to use ConfigManager)
│   └── ... (other admin pages)
└── dist/ (built files for deployment)
```

## Next Steps

1. **Choose your deployment method** (GitHub Actions recommended)
2. **Set up repository secrets** if using GitHub Actions
3. **Test locally** with the config file approach
4. **Deploy and verify** all functionality works
5. **Update other admin pages** to use ConfigManager (optional but recommended)

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify your Supabase project is active
3. Test with a simple admin login
4. Check GitHub Actions logs if using automated deployment
