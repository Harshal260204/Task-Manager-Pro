# Step-by-Step Guide: Running Task Manager Pro on Android Phone (NO ANDROID STUDIO NEEDED!)

## 🎯 Easy Method: Using Expo Go (Recommended - No Android Studio Required!)

This method uses Expo Go app on your phone - no Android Studio, no complex setup!

---

## Prerequisites Setup

### Step 1: Install Node.js (if not already installed)

1. Download from: https://nodejs.org/
2. Install version 18 or higher
3. Verify installation: Open PowerShell and run:
   ```powershell
   node --version
   npm --version
   ```

### Step 2: Install Expo CLI

Open PowerShell and run:
```powershell
npm install -g expo-cli
```

OR use npx (no installation needed):
```powershell
npx expo-cli --version
```

---

## Phone Setup

### Step 3: Install Expo Go on Your Android Phone

1. Open **Google Play Store** on your phone
2. Search for **"Expo Go"**
3. Install the **Expo Go** app (by Expo)
4. **That's it!** No developer options or USB debugging needed!

---

## Project Setup

### Step 4: Get Your Computer's IP Address

1. Open PowerShell
2. Run:
   ```powershell
   ipconfig
   ```
3. Find your **IPv4 Address** under your active network adapter (usually starts with 192.168.x.x or 10.0.x.x)
4. **Write this down** - you'll need it! (Example: `192.168.1.100`)

### Step 5: Update API Configuration

The mobile app needs to connect to your backend. Since `localhost` won't work on your phone, we need to use your computer's IP address.

1. Open `mobile/api/axios.ts`
2. Change the API_URL from:
   ```typescript
   const API_URL = 'http://localhost:5000/api'
   ```
   To:
   ```typescript
   const API_URL = 'http://YOUR_IP_ADDRESS:5000/api'
   ```
   Replace `YOUR_IP_ADDRESS` with the IP you found in Step 4.

### Step 6: Install Expo in Your Project

1. Navigate to mobile directory:
   ```powershell
   cd "D:\Harshal Ingale\MERN Projects\Task-Manager-Pro\mobile"
   ```

2. Install Expo packages:
   ```powershell
   npm install expo
   ```

3. Install additional Expo packages if needed:
   ```powershell
   npx expo install expo-dev-client
   ```

---

## Running the App

### Step 7: Start the Backend Server

1. Open a **new PowerShell window**
2. Navigate to backend:
   ```powershell
   cd "D:\Harshal Ingale\MERN Projects\Task-Manager-Pro\backend"
   ```
3. Make sure dependencies are installed:
   ```powershell
   npm install
   ```
4. Start the backend server:
   ```powershell
   npm run dev
   ```
5. **Keep this window open** - the server should be running on port 5000

### Step 8: Start Expo Development Server

1. Open a **new PowerShell window**
2. Navigate to mobile directory:
   ```powershell
   cd "D:\Harshal Ingale\MERN Projects\Task-Manager-Pro\mobile"
   ```

3. Make sure dependencies are installed:
   ```powershell
   npm install
   ```

4. Start Expo:
   ```powershell
   npx expo start
   ```

   OR if you installed expo-cli globally:
   ```powershell
   expo start
   ```

5. You'll see a **QR code** in the terminal and a menu with options

### Step 9: Connect Your Phone

**Option A: Scan QR Code (Easiest)**
1. Make sure your phone and computer are on the **same WiFi network**
2. Open **Expo Go** app on your phone
3. Tap **"Scan QR code"**
4. Scan the QR code from your terminal/PowerShell window
5. The app will load on your phone! 🎉

**Option B: Use Tunnel (If QR code doesn't work)**
1. In the terminal where Expo is running, press `s` to switch to tunnel mode
2. Scan the new QR code with Expo Go app

**Option C: Manual Connection**
1. In Expo Go app, tap **"Enter URL manually"**
2. Enter the URL shown in your terminal (usually `exp://YOUR_IP:8081`)

---

## That's It! 🎊

Your app should now be running on your phone! Any changes you make to the code will automatically reload on your phone.

---

## Alternative Method: Build APK Manually (If Expo Go Doesn't Work)

If you need native modules that don't work with Expo Go, you can build an APK file manually:

### Requirements (Minimal - No Android Studio GUI needed):
1. **Android SDK Command Line Tools only** (download separately)
2. **Java JDK 17**

### Steps:

1. **Download Android SDK Command Line Tools:**
   - Go to: https://developer.android.com/studio#command-tools
   - Download "Command line tools only" for Windows
   - Extract to a folder (e.g., `C:\Android\sdk`)

2. **Set Environment Variables:**
   - `ANDROID_HOME`: `C:\Android\sdk`
   - Add to PATH: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\tools\bin`

3. **Install SDK Components via Command Line:**
   ```powershell
   sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
   ```

4. **Build APK:**
   ```powershell
   cd mobile
   cd android
   .\gradlew assembleDebug
   ```

5. **Find APK:**
   - Location: `mobile\android\app\build\outputs\apk\debug\app-debug.apk`

6. **Install on Phone:**
   - Transfer APK to phone via USB or cloud storage
   - Enable "Install from Unknown Sources" in phone settings
   - Tap the APK file to install

---

## Troubleshooting

### Issue: "Expo command not found"
**Solution**: 
```powershell
npm install -g expo-cli
```
OR use npx (no installation):
```powershell
npx expo start
```

### Issue: QR Code doesn't work / Can't connect
**Solutions**:
- Make sure phone and computer are on **same WiFi network**
- Try tunnel mode: Press `s` in Expo terminal to switch to tunnel
- Try manual URL: In Expo Go, tap "Enter URL manually" and enter the URL from terminal
- Check Windows Firewall - allow Expo ports (19000, 19001, 8081)
- Try disabling Windows Firewall temporarily to test

### Issue: App can't connect to backend
**Solutions**:
- Make sure backend is running on port 5000
- Verify IP address in `mobile/api/axios.ts` is correct (use your computer's IP, not localhost)
- Make sure phone and computer are on same WiFi network
- Check Windows Firewall - allow port 5000
- Try disabling Windows Firewall temporarily to test
- Test backend from phone browser: `http://YOUR_IP:5000/api/health` (if you have a health endpoint)

### Issue: "Unable to resolve module" or Red Error Screen
**Solution**: 
```powershell
cd mobile
npm install
npx expo start --clear
```

### Issue: Some features don't work in Expo Go
**Note**: Expo Go has limitations with some native modules. If you need full native functionality:
- Use the APK build method (see Alternative Method above)
- Or consider using Expo Dev Client (more setup required)

### Issue: Expo Go app shows blank screen
**Solutions**:
- Shake your phone to open developer menu → Tap "Reload"
- Check terminal for errors
- Make sure backend is running
- Verify API URL is correct

### Issue: "Network request failed" in app
**Solutions**:
- Check backend is running: Open `http://localhost:5000` in browser
- Verify API URL in `mobile/api/axios.ts` uses your computer's IP (not localhost)
- Make sure phone and computer are on same WiFi
- Check Windows Firewall settings

---

## Quick Reference Commands

```powershell
# Start Expo development server
cd mobile
npx expo start

# Start Expo with cleared cache
cd mobile
npx expo start --clear

# Start backend server
cd backend
npm run dev

# Install Expo CLI globally (optional)
npm install -g expo-cli
```

---

## Notes

- **Keep 2 terminal windows open**:
  1. Backend server (`npm run dev` in backend folder)
  2. Expo server (`npx expo start` in mobile folder)

- **Hot reload**: Changes to your code automatically reload on your phone! No need to rebuild.

- **No USB needed**: Expo Go works over WiFi - just make sure phone and computer are on same network.

- **For production**: You'll need to build a proper APK or use EAS Build service.

- **Expo Go Limitations**: Some advanced native modules might not work in Expo Go. If you encounter issues, use the APK build method.

---

## Summary: Quick Start (3 Steps!)

1. **Install Expo Go** on your phone from Play Store
2. **Update API URL** in `mobile/api/axios.ts` with your computer's IP
3. **Run these commands:**
   ```powershell
   # Terminal 1: Start backend
   cd backend
   npm run dev
   
   # Terminal 2: Start Expo
   cd mobile
   npm install expo
   npx expo start
   ```
4. **Scan QR code** with Expo Go app on your phone!

That's it! 🎉

---

Good luck! 🚀

