# ChatApp

A React Native Chat Application using Firebase.

## Getting Started

This project is a template and requires your own Firebase project to run.

### Prerequisites

- Node.js
- React Native development environment (Android Studio / Xcode)
- A Firebase project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd ChatApp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Setup Firebase:**

    *   **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    *   **Enable Authentication:** Enable Email/Password authentication in the Authentication section.
    *   **Enable Firestore:** Create a Firestore database.

    **Configuration:**

    1.  Rename `firebaseConfig.example.ts` to `firebaseConfig.ts`.
    2.  Open `firebaseConfig.ts` and replace the placeholder values with your Firebase project configuration keys (found in Project Settings > General > Your apps > SDK setup and configuration).

    ```typescript
    export const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };
    ```

    **Android Setup:**

    1.  Download `google-services.json` from your Firebase project settings (Android app).
    2.  Place it in `android/app/google-services.json`.

    **iOS Setup:**

    1.  Download `GoogleService-Info.plist` from your Firebase project settings (iOS app).
    2.  Place it in `ios/ChatApp/GoogleService-Info.plist` (or add it via Xcode to the project root).

### Running the App

**Android:**
```bash
npm run android
```

**iOS:**
```bash
cd ios && pod install && cd ..
npm run ios
```

## Contributing

Feel free to submit issues and pull requests.
