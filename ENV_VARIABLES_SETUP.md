# Environment Variables Setup for Production Builds

## 🚨 CRITICAL: `.env.local` is NOT Included in Production Builds

The `.env.local` file at the root is **NOT automatically included** in Expo production builds. You must configure environment variables properly.

## ✅ Solution: Use EAS Secrets (Recommended for Production)

### Step 1: Install Required Packages

```bash
cd taskclarify-mobile
npm install dotenv --save-dev
```

### Step 2: Set EAS Secrets (REQUIRED for Production Builds)

EAS Secrets are the secure way to provide environment variables for production builds:

```bash
# Login to EAS if not already logged in
npx eas login

# Set your secrets (these will be used in production builds)
npx eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-supabase-url"
npx eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-supabase-anon-key"
npx eas secret:create --scope project --name EXPO_PUBLIC_GROQ_API_KEY --value "your-groq-api-key"
npx eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "your-backend-api-url" # Optional
```

### Step 3: Update eas.json to Use Secrets

The `eas.json` has been updated to include environment variable placeholders. EAS will automatically inject secrets when building.

### Step 4: Verify Your .env.local File Format

Make sure your `.env.local` at the root has the correct format:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_GROQ_API_KEY=your-groq-api-key-here
EXPO_PUBLIC_API_URL=https://your-backend-api.com  # Optional
```

### Step 5: Build Your Preview/Production Build

After setting EAS secrets:

```bash
cd taskclarify-mobile
npx eas build --profile preview --platform android  # or ios
```

## 🔍 How It Works

1. **Development (Expo Go/Dev Client):**
   - `app.config.js` reads from `.env.local` at root
   - Environment variables are available via `process.env.EXPO_PUBLIC_*`

2. **Production Builds:**
   - EAS Secrets are injected during build time
   - `app.config.js` receives values from EAS Secrets
   - Environment variables are baked into the app bundle

## 📝 Alternative: Use Environment Variables in eas.json (Less Secure)

If you prefer not to use EAS Secrets, you can directly set values in `eas.json`:

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "your-actual-url",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-actual-key",
        "EXPO_PUBLIC_GROQ_API_KEY": "your-actual-key"
      }
    }
  }
}
```

⚠️ **WARNING:** This is less secure as secrets are stored in plain text in your repository. Use EAS Secrets instead.

## 🔧 Troubleshooting

### Issue: App crashes on real phone but works in Expo Go

**Solution:** Environment variables are not set in production build. Use EAS Secrets.

### Issue: Environment variables are undefined in production

**Check:**
1. Did you set EAS Secrets? Run: `npx eas secret:list`
2. Is your `app.config.js` correctly reading from `.env.local`?
3. Are variable names prefixed with `EXPO_PUBLIC_`?

### Issue: dotenv not found error

**Solution:** Install dotenv: `npm install dotenv --save-dev`

## ✅ Verification Steps

1. **Check EAS Secrets:**
   ```bash
   npx eas secret:list
   ```

2. **Test locally:**
   ```bash
   cd taskclarify-mobile
   npm start
   ```
   App should read from `.env.local` in development.

3. **Build and test:**
   ```bash
   npx eas build --profile preview --platform android
   ```
   Download and install on device - should have environment variables.

## 🎯 Quick Start Commands

```bash
# 1. Install dotenv
cd taskclarify-mobile
npm install dotenv --save-dev

# 2. Set EAS Secrets (replace values with your actual values)
npx eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "YOUR_SUPABASE_URL"
npx eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_SUPABASE_KEY"
npx eas secret:create --scope project --name EXPO_PUBLIC_GROQ_API_KEY --value "YOUR_GROQ_KEY"

# 3. Verify secrets are set
npx eas secret:list

# 4. Build preview
npx eas build --profile preview --platform android

# 5. Download and test on real device
```

## 🔐 Security Best Practices

1. ✅ Use EAS Secrets for production (recommended)
2. ✅ Never commit `.env.local` to git (add to `.gitignore`)
3. ✅ Never commit actual API keys in `eas.json`
4. ✅ Use different API keys for development and production
5. ✅ Rotate keys if accidentally exposed

## 📚 Additional Resources

- [EAS Secrets Documentation](https://docs.expo.dev/build-reference/variables/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Config Plugins](https://docs.expo.dev/config-plugins/introduction/)

---

**IMPORTANT:** After setting up EAS Secrets, rebuild your app. The environment variables will be included in the production build.
