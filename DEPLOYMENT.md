# Deployment Instructions for Vercel

## Quick Deploy

1. **Push to GitHub**
   ```bash
   git push origin master
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import the GitHub repository
   - Configure environment variables (see below)
   - Deploy

## Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
VITE_API_BASE_URL=https://take-backend-production.up.railway.app/api
VITE_UPLOAD_URL=https://take-backend-production.up.railway.app/api/upload
VITE_APP_ENV=production
VITE_APP_NAME=TakeDash
VITE_DEMO_MODE=false
VITE_USE_MOCK_DATA=false
```

## Important Notes

### OAuth Configuration Status
⚠️ **Current Issue**: Google OAuth redirect is configured to `localhost:3000` in the backend.

**What works:**
- ✅ All API endpoints to Railway backend
- ✅ Application loading and navigation
- ✅ Data fetching from backend

**What doesn't work yet:**
- ❌ Google OAuth login (redirects to localhost:3000)

### Backend Changes Required

The backend team needs to:

1. **Update Google Cloud Console**:
   - Add authorized redirect URI: `https://take-backend-production.up.railway.app/api/admin/auth/google/callback`

2. **Update Backend Code**:
   - Use environment variable for OAuth redirect URI
   - Example: `OAUTH_REDIRECT_URI=https://take-backend-production.up.railway.app/api/admin/auth/google/callback`

3. **Update Frontend Redirect**:
   - Currently redirects to: `https://take-dashboard.vercel.app/menu`
   - Should be configurable via environment variable

## Testing

Once deployed to Vercel:

1. **Check API Connection**:
   - Open browser console
   - Look for successful `/api/health` requests to Railway

2. **Test Authentication** (after backend fix):
   - Click "Login with Google"
   - Should redirect to Google OAuth
   - Should return to the app after authentication

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Build Commands

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`