# **App Name**: EcoCart

## Core Features:

- Product Catalog: Display available grocery products with images, descriptions, and prices fetched from Firestore.
- Shopping Cart: Enable users to add, remove, and update quantities of items in their cart. Stores cart data in local storage.
- Order Calculation: Calculates the subtotal, delivery fee (based on conditions), and grand total of the order based on items in the cart.
- Order Validation: Validates if the grand total exceeds the maximum order limit of Rs. 2000. Display an error message if the order is invalid.
- WhatsApp Order: Formats the cart data into a URL-encoded string for the wa.me API and redirects the user to WhatsApp with a pre-filled order message.
- Admin Authentication: Secure admin panel with password-based authentication to manage products.  For production, it could be replaced with Firebase Auth
- Product Management: Admin panel to Create, Read, Update, and Delete products in the Firestore database.

## Style Guidelines:

- Primary color: Fresh green (#50C878) to represent nature, freshness, and the 'Clean & Green' concept. In RGB, this is (80, 200, 120).
- Background color: Light, desaturated green (#F0FAF4) to create a clean and calming backdrop.  In RGB, this is (240, 250, 244).
- Accent color: Yellow-green (#BCE28A) to complement the primary color and highlight interactive elements.  In RGB, this is (188, 226, 138).
- Body font: 'PT Sans', a humanist sans-serif suitable for body text. Headline Font: 'Space Grotesk', a proportional sans-serif with a techy feel.
- Use clean and minimalist icons to represent product categories and actions.
- Implement a responsive grid layout for the product catalog (grid-cols-2 for mobile, md:grid-cols-4 for desktop).
- Subtle animations and transitions to enhance user experience.