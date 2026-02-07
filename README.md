# EcoCart | Fresh & Clean Groceries

EcoCart is a Next.js 15 application designed for easy grocery ordering via WhatsApp. It is optimized to run on the **Firebase Spark (Free) Plan**.

## 🚀 Easy Deployment Steps

Follow these steps to get your shop online:

1. **Push to GitHub**:
   - Initialize a git repo: `git init`
   - Add files: `git add .`
   - Commit: `git commit -m "Initial commit"`
   - Push to your GitHub repository.

2. **Connect to Firebase App Hosting**:
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Select your project.
   - Navigate to **Build > App Hosting**.
   - Click **Get Started** and connect your GitHub repository.
   - Firebase will handle the build and deployment automatically.

3. **Configure Permissions**:
   - Ensure your Firestore Security Rules (found in `firestore.rules`) are deployed. Firebase Studio handles this automatically during development, but you can double-check them in the Firebase Console under **Firestore Database > Rules**.

## 🛠 Features

- **Product Catalog**: Real-time listing from Firestore.
- **Admin Dashboard**: Manage inventory at `/admin` using the secure password found in `src/lib/constants.ts`.
- **WhatsApp Checkout**: No complex payment gateway needed; orders are sent directly to your WhatsApp.
- **Spark Plan Optimized**: Uses anonymous authentication and path-based security rules to keep costs at zero.

## 🔐 Admin Access
The default administrative password is located in `src/lib/constants.ts`. You can change it there before deploying.

```ts
export const ADMIN_PASS = "Jumbopack@1137";
```
