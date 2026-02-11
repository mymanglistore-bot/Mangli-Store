
"use client";

import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { useCollection, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { Loader2, Filter, TicketPercent, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const firestore = useFirestore();
  const logoPlaceholder = PlaceHolderImages.find(img => img.id === 'logo');
  const [activeCategory, setActiveCategory] = useState("All");
  
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

  const logoUrl = settings?.logoImageUrl || logoPlaceholder?.imageUrl || "https://picsum.photos/seed/manglistore/100/100";

  // Extract unique categories from products
  const categories = useMemo(() => {
    if (!products) return ["All"];
    const cats = products.map(p => p.category);
    return ["All", ...Array.from(new Set(cats))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeCategory === "All") return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="relative w-full overflow-hidden rounded-3xl bg-transparent">
            <img 
              src={settings?.heroImageUrl || "https://picsum.photos/seed/manglistore/1200/400"} 
              alt="Mangli.Store Banner" 
              className="w-full h-auto max-h-[500px] object-cover block opacity-80"
              data-ai-hint="grocery store banner"
            />
          </div>
        </section>

        {/* Discount Corner Section */}
        <section className="mb-16">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 p-8 md:p-14 border border-primary/20 text-center shadow-inner">
            {/* Decorative Orbs */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 bg-accent/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Exclusive Deals
              </div>
              
              <div className="bg-primary text-primary-foreground p-5 rounded-3xl shadow-xl -rotate-2 hover:rotate-0 transition-transform duration-500">
                <TicketPercent className="h-10 w-10 md:h-12 md:w-12" />
              </div>

              <div className="space-y-3">
                <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight">
                  Discount Corner
                </h2>
                <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                  Get ready for the freshest savings in town! We're curating exclusive deals and bundle offers just for you.
                </p>
              </div>

              <div className="mt-4 px-10 py-3 bg-white/60 backdrop-blur-xl border border-white rounded-2xl shadow-sm">
                <span className="text-xl md:text-2xl font-bold tracking-[0.2em] text-primary/80 uppercase animate-pulse">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="products">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <h2 className="text-3xl font-headline font-bold">Our Catalog</h2>
            
            {categories.length > 1 && (
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full md:w-auto">
                <TabsList className="bg-muted/50 h-12 p-1 overflow-x-auto flex-nowrap justify-start max-w-full">
                  {categories.map((cat) => (
                    <TabsTrigger 
                      key={cat} 
                      value={cat}
                      className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-transparent rounded-2xl border border-dashed flex flex-col items-center justify-center">
              <Filter className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-background border-t py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center justify-center gap-3 mb-4">
            <div className="w-24 h-16 relative overflow-hidden bg-transparent">
              <Image
                src={logoUrl}
                alt="Mangli.Store Logo"
                fill
                className="object-contain"
                data-ai-hint="grocery logo"
              />
            </div>
            <span className="font-headline font-bold text-xl tracking-tighter text-primary">
              Mangli.Store
            </span>
          </div>
          
          <div className="mt-8 space-y-1 text-xs text-muted-foreground max-w-md mx-auto">
            <p>Delivery: Orders accepted 6 AM–8 PM; late orders delivered next morning.</p>
            <p>Images: For illustration only; actual product may vary.</p>
          </div>

          <div className="mt-6 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            &copy; {new Date().getFullYear()} Mangli.Store Delivery Service
          </div>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}
