
"use client";

import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Product } from '@/lib/types';

// Mock products based on placeholder images
const MOCK_PRODUCTS: Product[] = PlaceHolderImages.map(img => ({
  id: img.id,
  name: img.description,
  price: Math.floor(Math.random() * 100) + 20,
  description: `High quality ${img.description.toLowerCase()} sourced locally and grown with care.`,
  imageUrl: img.imageUrl,
  category: 'Groceries'
}));

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <div className="bg-primary/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-primary/20">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-headline font-black text-primary mb-4 leading-tight">
                Fresh Groceries <br /> Delivered to Your <br /> Doorstep.
              </h1>
              <p className="text-muted-foreground text-lg mb-6 max-w-lg">
                High-quality local produce. Fast delivery. Eco-friendly packaging. 
                Experience the clean and green way of shopping.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-white px-4 py-2 rounded-full border text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Free Delivery above Rs. 300
                </div>
                <div className="bg-white px-4 py-2 rounded-full border text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-secondary rounded-full" />
                  Maximum Order Rs. 2000
                </div>
              </div>
            </div>
            <div className="flex-1 w-full max-w-sm">
              <div className="aspect-square relative bg-secondary rounded-full flex items-center justify-center p-8 overflow-hidden shadow-inner">
                <div className="bg-white p-6 rounded-2xl shadow-2xl rotate-3 scale-110">
                   <img 
                    src="https://picsum.photos/seed/basket/400/400" 
                    alt="Eco Basket" 
                    className="rounded-lg"
                   />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="products">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-headline font-bold">Our Catalog</h2>
              <p className="text-muted-foreground">Handpicked fresh items for you</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {MOCK_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
             <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <ShoppingBasket className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="font-headline text-xl font-bold text-primary">EcoCart</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Supporting local farmers and reducing waste with every delivery. 
            Join the green revolution today.
          </p>
          <div className="mt-8 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            &copy; {new Date().getFullYear()} EcoCart Delivery Service
          </div>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}

import { ShoppingBasket } from 'lucide-react';
