
"use client";

import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { useCollection, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { ShoppingBasket, Loader2 } from 'lucide-react';

export default function Home() {
  const firestore = useFirestore();
  
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'store');
  }, [firestore]);

  const { data: settings } = useDoc<any>(settingsRef);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section - Image Only with Transparency */}
        <section className="mb-12">
          <div className="relative w-full overflow-hidden rounded-3xl shadow-sm border bg-transparent">
            <img 
              src={settings?.heroImageUrl || "https://picsum.photos/seed/manglistore/1200/400"} 
              alt="Mangli.Store Banner" 
              className="w-full h-auto max-h-[500px] object-cover block opacity-80"
            />
          </div>
        </section>

        <section id="products">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-headline font-bold">Our Catalog</h2>
              <p className="text-muted-foreground">Handpicked fresh items for you</p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
              <p className="text-muted-foreground">No products available in the catalog yet.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
             <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <ShoppingBasket className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="font-headline text-xl font-bold text-primary">Mangli.Store</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Supporting local farmers and reducing waste with every delivery. 
            Join the green revolution today with Mangli.Store.
          </p>
          <div className="mt-8 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            &copy; {new Date().getFullYear()} Mangli.Store Delivery Service
          </div>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}
