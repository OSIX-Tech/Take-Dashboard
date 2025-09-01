# Google OAuth Setup for Wallet Integration

## Important: Mobile/Android Configuration

To make Google Sign-In work on Android emulator and mobile devices (avoiding third-party cookie issues), you need to configure your Google OAuth Client properly.

### 1. Go to Google Cloud Console
- Navigate to: https://console.cloud.google.com
- Select your project
- Go to: APIs & Services → Credentials
- Edit your OAuth 2.0 Client ID (the one you're using for `VITE_GOOGLE_WALLET_CLIENT_ID`)

### 2. Add Authorized JavaScript Origins
Add ALL of these URLs:
```
http://localhost:5173
http://localhost
http://10.0.2.2:5173
http://192.168.1.XXX:5173  (replace with your actual IP)
http://YOUR_COMPUTER_IP:5173
```

### 3. Add Authorized Redirect URIs (CRITICAL FOR MOBILE)
Add ALL of these redirect URIs:
```
http://localhost:5173/loginWallet
http://10.0.2.2:5173/loginWallet
http://192.168.1.XXX:5173/loginWallet  (replace with your actual IP)
http://YOUR_COMPUTER_IP:5173/loginWallet
```

### 4. For Production
When deploying, also add:
```
https://yourdomain.com/loginWallet
```

### 5. Save Changes
Click "Save" in Google Console. Changes may take a few minutes to propagate.

## How the Mobile Flow Works

The app now automatically detects if you're on a mobile device or if third-party cookies are blocked:

1. **Desktop with cookies enabled**: Uses Google Sign-In JavaScript API (popup flow)
2. **Mobile or cookies blocked**: Uses OAuth redirect flow (full page redirect)

### Testing on Android Emulator

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open Chrome in Android emulator

3. Navigate to either:
   - `http://10.0.2.2:5173/loginWallet` (emulator special IP)
   - `http://YOUR_COMPUTER_IP:5173/loginWallet` (your network IP)

4. Click "Continuar con Google"

5. You'll be redirected to Google's login page

6. After login, you'll be redirected back to `/loginWallet` with the token

7. The app will automatically process the token and redirect to `/addWallet`

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the exact URL (including port) is added to Google Console
- URLs are case-sensitive and must match exactly
- Wait 5 minutes after adding new URIs for changes to take effect

### Still getting cookie errors
- The app should automatically use the redirect flow
- Check browser console for which flow is being used
- Clear browser cache and cookies, then try again

### Network errors on emulator
- Make sure your dev server is running with `host: true` in vite.config.js
- Check Windows Firewall isn't blocking port 5173
- Try using your computer's IP instead of 10.0.2.2

## Security Notes

- The redirect flow is more secure for mobile apps
- ID tokens are validated server-side
- Never expose your client secret in frontend code
- Use HTTPS in production