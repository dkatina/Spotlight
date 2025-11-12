# Spotify OAuth Setup Troubleshooting

## Common Issue: INVALID_CLIENT: Invalid redirect URI

This error occurs when the redirect URI doesn't match exactly between:
1. Spotify Developer Dashboard
2. Your backend `.env` file
3. The actual URL being used

## Step-by-Step Fix

### 1. Check Your Backend Configuration

Verify your `spotlight-backend/.env` file has:
```env
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/auth/spotify/callback
```

**Important:** 
- Use `127.0.0.1` NOT `localhost`
- No trailing slash
- Exact path: `/auth/spotify/callback`
- Port must be `5173`

### 2. Add Redirect URI to Spotify Dashboard

1. Go to https://developer.spotify.com/dashboard
2. Click on your app
3. Click **"Edit Settings"**
4. Scroll to **"Redirect URIs"**
5. Click **"Add URI"**
6. Enter exactly: `http://127.0.0.1:5173/auth/spotify/callback`
7. Click **"Add"**
8. Click **"Save"** at the bottom

**Critical:** The URI must match EXACTLY, including:
- `http://` (not `https://`)
- `127.0.0.1` (not `localhost`)
- Port `5173`
- Path `/auth/spotify/callback`

### 3. Restart Your Backend Server

After updating `.env`, you MUST restart your Flask server:
```bash
# Stop the server (Ctrl+C)
# Then restart:
python run.py
```

### 4. Verify the Redirect URI Being Used

The backend now returns the redirect URI in the response. When you click "Connect with Spotify", check the browser console or network tab to see what redirect URI is being sent.

You can also test the endpoint directly:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://127.0.0.1:5000/api/spotify/auth-url
```

The response will include `redirect_uri` showing what's configured.

### 5. Common Mistakes

❌ **Wrong:**
- `http://localhost:5173/auth/spotify/callback` (uses localhost)
- `http://127.0.0.1:5173/auth/spotify/callback/` (trailing slash)
- `https://127.0.0.1:5173/auth/spotify/callback` (uses https)
- `http://127.0.0.1:3000/auth/spotify/callback` (wrong port)

✅ **Correct:**
- `http://127.0.0.1:5173/auth/spotify/callback`

### 6. Still Not Working?

1. **Clear browser cache** - Sometimes old redirect URIs are cached
2. **Check for typos** - Copy-paste the exact URI to avoid typos
3. **Verify .env is loaded** - Make sure your `.env` file is in `spotlight-backend/` directory
4. **Check environment variable** - The backend defaults to `http://127.0.0.1:5173/auth/spotify/callback` if not set in `.env`
5. **Restart both servers** - Restart both frontend and backend

### 7. Testing

After setup, test the flow:
1. Login to your app
2. Go to Dashboard → Spotify tab
3. Click "Connect with Spotify"
4. You should be redirected to Spotify login
5. After authorizing, you should be redirected back to your app

If you still get the error, check the exact error message - it sometimes shows what URI Spotify received vs what it expected.




