import type {Metadata} from 'next';
import './globals.css';
import {CartProvider} from '@/context/CartContext';
import {Toaster} from '@/components/ui/toaster';
import {FirebaseClientProvider} from '@/firebase';

export const metadata: Metadata = {
  title: 'EcoCart | Fresh & Clean Groceries',
  description: 'Your local eco-friendly grocery delivery service.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
