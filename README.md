# Campus-Loop (Campus Shuttle App)

A campus rideshare and shuttle tracking application built with **React Native** and **Expo**. This app allows students to view fixed campus routes, reserve seats, and simulate live ride tracking from the Connelly Center hub to local destinations.

## 📱 Features
* **Interactive Map:** Google Maps integration with custom markers.
* **Smart Routing:** Visualizes routes from the Campus Hub (Connelly Center) to destinations like King of Prussia, Ardmore, and Philly.
* **Ride Simulation:** Full flow from "Idle" → "Selecting" → "Booking" → "Live Tracking".
* **Profile System:** Slide-up modal for user settings.
* **NativeWind:** Styled with Tailwind CSS for React Native.

## 🛠️ Tech Stack
* **Framework:** React Native (Expo)
* **Routing:** Expo Router
* **Maps:** `react-native-maps` & `expo-location`
* **Styling:** NativeWind (Tailwind CSS)

---

## 🚀 How to Run This Project

You need to install the dependencies first.

### 1. Clone the repository
Open your terminal and run:
```bash
git clone [https://github.com/YOUR_USERNAME/REPO_NAME.git](https://github.com/YOUR_USERNAME/REPO_NAME.git)
cd REPO_NAME
```
### 2. Install dependencies
Open your terminal and run:
```bash
npm install
```
To start the server, run
```bash
npx expo start
```
### 3. Download the Expo Go App and scan the QR code in your terminal.

### 4. The file Structures
`app/index.js` - Entry point (Redirects to Login).

`app/login.js` - The login screen.

`app/home.js` - Main Map interface & Logic.

`app/profile.js` - User profile modal.

`babel.config.js` - Configuration for NativeWind styling.
