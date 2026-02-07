
# EcoCart | Fresh & Clean Groceries

EcoCart is a Next.js 15 application designed for easy grocery ordering via WhatsApp. This version is specifically optimized for the **Firebase Spark (Free) Plan** by using Static Export.

## 🚀 Deployment Steps (Spark Plan / 100% Free)

Since the Firebase Spark plan does not support Cloud Functions or App Hosting, we deploy this app as a **Static Site** to standard Firebase Hosting.

### 1. Install Firebase CLI
If you haven't already, install the Firebase tools globally:
```bash
npm install -g firebase-tools
```

### 2. Login and Initialize
```bash
firebase login
firebase init hosting
```
- **Project Setup**: Select "Use an existing project" and choose your project.
- **Public Directory**: Type `out` (this is where Next.js exports the static files).
- **Configure as SPA**: Type `y` (Yes) to rewrite all URLs to `index.html`.
- **Set up automatic builds/deploys with GitHub?**: Optional (up to you).

### 3. Build and Export
Run the build command. This creates an `out` folder containing your entire website as static files.
```bash
npm run build
```

### 4. Deploy
Push the static files to Firebase Hosting:
```bash
firebase deploy --only hosting
```

## 🛠 Features

- **Product Catalog**: Real-time listing from Firestore (Client-side SDK).
- **Admin Dashboard**: Manage inventory at `/admin` using the secure password.
- **WhatsApp Checkout**: Orders are sent directly to your WhatsApp to avoid payment gateway costs.
- **Static Export**: Optimized to run on the free Hosting tier.

## 🔐 Admin Access
The default administrative password is located in `src/lib/constants.ts`.

```ts
export const ADMIN_PASS = "Jumbopack@1137";
```
