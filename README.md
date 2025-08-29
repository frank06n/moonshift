# 🚀 Startup Evaluator

The Startup Idea Evaluator is a mobile application that lets users submit their startup ideas, receive a fun, fake AI-generated feedback rating, and vote on other users' ideas. It features a dynamic leaderboard to showcase the top-rated and most-voted ideas in the community.

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

## 📲 How to Install the APK

If you prefer to install a standalone Android application, you can use the provided APK file.

1.  **Download the APK file**:
      * [Download Link for the APK]
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

To get the app running on your local machine, follow these steps:

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/frank06n/moonshift
    ```

2.  **Navigate to the project directory**:

    ```bash
    cd moonshift
    ```

3.  **Install dependencies**:

    ```bash
    npx expo install
    ```

4.  **Start the development server**:

    ```bash
    npx expo start
    ```

    This command will launch the Metro bundler and provide a QR code in your terminal.

5.  **Run on a device or emulator**:

      * **Using Expo Go**:
          * Download the **Expo Go** app from the Google Play Store (Android) or App Store (iOS).
          * On Android, scan the QR code from the terminal using the Expo Go app. On iOS, scan it with the regular camera app.
      * **Using a simulator/emulator**:
          * Press `a` in the terminal to launch on an Android emulator.
          * Press `i` in the terminal to launch on an iOS simulator.
