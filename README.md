# Mangli.Store | Fresh & Clean Groceries

Mangli.Store is a Next.js 15 application designed for easy grocery ordering via WhatsApp, optimized for the **Firebase Spark (Free) Plan**.

## 🚀 Deployment from Firebase Studio (Spark Plan)

1. **Open the Terminal** at the bottom of Firebase Studio.
2. **Login** (if not already logged in):
   ```bash
   firebase login
   ```
3. **Run the Deploy Script**:
   ```bash
   npm run deploy
   ```

This command will automatically:
- Build your app as a static site into the `out/` folder.
- Deploy that folder to standard Firebase Hosting.

## 🛠 Features

- **Product Catalog**: Real-time listing from Firestore.
- **Admin Dashboard**: Manage inventory at `/adminpanel` (hidden from public).
- **WhatsApp Checkout**: Orders sent to WhatsApp to avoid processing fees.
- **Static Export**: Optimized for 100% free hosting.

## 🔐 Admin Access
Default administrative password is in `src/lib/constants.ts`.
```ts
export const ADMIN_PASS = "Jumbopack@1137";
```
