# 🚀 Startup Evaluator

The Startup Idea Evaluator is a mobile application that lets users submit their startup ideas, receive a fun, fake AI-generated feedback rating, and vote on other users' ideas. It features a dynamic leaderboard to showcase the top-rated and most-voted ideas in the community.

**Demo video: [click here](https://youtu.be/NAO90_qx5-k)**  
**Download APK: [click here](https://github.com/frank06n/moonshift/releases/download/release/startup_evaluator_v1.apk)**

-----

## 🛠️ Tech Stack

  * **Frontend**: The app is built with **React Native** and **Expo**.
  * **Routing**: **Expo Router** is used for multi-screen navigation.
  * **State Management & Storage**:
      * **AsyncStorage**: Used for local, persistent data storage of ideas and user votes.
      * **React Context/Hooks**: Used for managing local state across different screens.
  * **Styling & UI Components**:
      * **Lucide React Native**: For icons.
      * **Expo Linear Gradient**: To create visually appealing gradient backgrounds.
      * **Toastify React Native**: For displaying toast notifications.
  * **Additional Libraries**:
      * **React Native Reanimated** & **React Native Gesture Handler**: To enable gestures and animations for a smooth user experience.
      * **Expo Font**: For using custom fonts.

-----

## ✨ Features

  * **Idea Submission**: A clean form with fields for a **Startup Name**, **Tagline**, and **Description**. Upon submission, the app generates a mock AI rating (0-100).
  * **Idea Listing**: Displays all submitted ideas with their name, tagline, rating, and vote count.
      * Users can upvote an idea, with a one-vote-per-idea restriction enforced locally.
      * A "Read more" option is available to expand the full description.
      * Ideas can be sorted by their rating or vote count.
  * **Leaderboard**: A dedicated screen showcasing the top 5 ideas with a visually engaging UI, including **badges** (🥇🥈🥉), cards, and subtle gradients.
  * **Bonus Features**:
      * **Dark Mode**: A toggle for a comfortable viewing experience in low light.
      * **Notifications**: Toast notifications provide feedback on actions like submitting an idea or voting.
      * **Share Functionality**: Users can share an idea via social media or clipboard.
      * **Animations**: The app incorporates swipe gestures and animations for an enhanced user experience.

-----

## 📲 Screenshots
<img src="https://github.com/user-attachments/assets/20481a23-b111-4a42-ae72-0bfecf5cba90" width="200" alt="screenshot"/>
<img src="https://github.com/user-attachments/assets/f03b68ba-c88c-4e46-9110-b474a549b915" width="200" alt="screenshot"/>
<img src="https://github.com/user-attachments/assets/d86d2b14-7c7d-4324-bcb9-b3b002dee25d" width="200" alt="screenshot"/>
<img src="https://github.com/user-attachments/assets/8f3b5c7c-db38-42ab-aa59-edb9d972c9a8" width="200" alt="screenshot"/>
<img src="https://github.com/user-attachments/assets/27fa468c-747d-4818-81d1-b789c90e4ca1" width="200" alt="screenshot"/>
<img src="https://github.com/user-attachments/assets/bbadc383-24b7-4803-85e0-66a00b531001" width="200" alt="screenshot"/>
<img src="https://github.com/user-attachments/assets/1d474578-3b2f-42fb-a3a5-b3529846e3a0" width="200" alt="screenshot"/>
<img src="https://github.com/user-attachments/assets/11dc4792-ef6b-4f5b-940d-1484b298aaa5" width="200" alt="screenshot"/>
<img src="https://github.com/user-attachments/assets/25028a14-4041-4e3d-b3de-d1ec60fb03b3" width="200" alt="screenshot"/>
<img src="https://github.com/user-attachments/assets/79ecc39d-68ea-4a82-8e55-2eb8ee0eeb96" width="200" alt="screenshot"/>
<img src="https://github.com/user-attachments/assets/7b939ecf-046f-4f7b-8013-26f63ab68b37" width="200" alt="screenshot"/>
<img src="https://github.com/user-attachments/assets/cc4ecd5b-e64f-4b5b-8be2-2a1f69e89b93" width="200" alt="screenshot"/>

-----

## 📲 How to Install the APK

If you prefer to install a standalone Android application, you can use the provided APK file.

1.  **Download the APK file**:
      * _[Download Link for the APK](https://github.com/frank06n/moonshift/releases/download/release/startup_evaluator_v1.apk)_
2.  **Enable "Install from Unknown Sources"**:
      * On your Android device, go to **Settings \> Apps & notifications \> Special access \> Install unknown apps**.
      * Select the app you will use to open the file (e.g., your browser or file manager) and toggle on **Allow from this source**.
3.  **Find and install the APK**:
      * Locate the downloaded APK file using a file manager app.
      * Tap the file to begin the installation.
      * Follow the on-screen prompts to complete the installation.
      * After installation, the app will be available in your app drawer.

-----

## ⚙️ How to Run Locally

Follow these steps to run the app on your local machine:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/frank06n/moonshift
   ```

2. **Navigate to the project directory**:

   ```bash
   cd moonshift
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

---

### ▶️ Option 1: Run with EAS Build (Recommended)

Since the project includes native libraries we need a custom development build.

1. **Remove** the existing `eas.projectId` from the `app.json`.

2. Build the app with EAS:

   ```bash
   eas build --platform android --profile development
   ```

   or for a preview APK:

   ```bash
   eas build --platform android --profile preview
   ```

3. Install the generated APK/IPA on your device and start the dev server:

   ```bash
   npx expo start
   ```

---

### ▶️ Option 2: Manual Build with Gradle

If you want to build the APK manually without EAS:

1. **Prebuild native projects**:

   ```bash
   npx expo prebuild
   ```

2. **Export JS bundle/assets**:

   ```bash
   npx expo export --output-dir android/app/src/main/assets
   ```

3. **Build with Gradle**:

   * For a release build:

     ```bash
     cd android
     ./gradlew assembleRelease
     ```

   * For a debug build:

     ```bash
     ./gradlew assembleDebug
     ```

   The generated APK will be available in `android/app/build/outputs/apk/`.

---

👉 After installing the APK, run the development server with:

```bash
npx expo start
```

