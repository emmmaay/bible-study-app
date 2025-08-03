
# Convert Bible Study Pro to Android APK

## Method 1: PWA Builder (Recommended - Free)

1. **Deploy your app first** (using Replit's free Static Deployment)
2. Go to https://www.pwabuilder.com/
3. Enter your app URL: `your-app-name.replit.app`
4. Click "Start" to analyze your PWA
5. Click "Build My PWA" 
6. Select "Android" platform
7. Download the generated APK file
8. Install on Android devices or publish to Google Play

## Method 2: Using Capacitor (Advanced)

### Install Capacitor
```bash
cd client
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### Initialize Capacitor
```bash
npx cap init "Bible Study Pro" "com.biblestudypro.app"
```

### Add Android platform
```bash
npx cap add android
```

### Build and sync
```bash
npm run build
npx cap sync
```

### Generate APK
```bash
npx cap open android
# This opens Android Studio where you can build the APK
```

## Your PWA is Ready!

Your app already has:
- ✅ Web App Manifest (manifest.json)
- ✅ Service Worker (sw.js)
- ✅ Offline capabilities
- ✅ Mobile-responsive design
- ✅ Installable on mobile devices

Users can install it directly from the browser without an APK!
