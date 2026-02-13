"use client";

import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { useCollection, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { Loader2, Filter, TicketPercent, Sparkles, Search, X } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function Home() {
  const firestore = useFirestore();
  const logoPlaceholder = PlaceHolderImages.find(img => img.id === 'logo');
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
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
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ["All", ...cats.filter(Boolean)];
  }, [products]);

  // Discounted products are explicitly those with the isDiscounted flag set to true
  const discountedProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => p.isDiscounted);
  }, [products]);

  // Catalog filtered by category AND search query
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let result = products;

    // Apply Category Filter
    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory);
    }

    // Apply Search Filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="relative w-full overflow-hidden rounded-3xl bg-muted aspect-[3/1] max-h-[500px]">
            {settings?.heroImageUrl && (
              <Image 
                src={settings.heroImageUrl} 
                alt="Mangli.Store Banner" 
                fill
                priority={true}
                loading="eager"
                className="object-cover block transition-opacity duration-500"
                sizes="100vw"
              />
            )}
            {!settings?.heroImageUrl && !isLoading && (
               <div className="w-full h-full bg-gradient-to-r from-primary/10 to-accent/10 animate-pulse" />
            )}
          </div>
        </section>

        {/* Discount Corner Section */}
        <section className="mb-16">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 p-6 md:p-10 border border-primary/20 shadow-inner">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 bg-accent/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex flex-col items-center gap-2 text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <Sparkles className="h-3 w-3" />
                  Exclusive Deals
                </div>
                <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary tracking-tight">
                  Discount Corner
                </h2>
                <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                  Grab these limited-time offers while they last!
                </p>
              </div>

              {discountedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                  {discountedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 py-10">
                  <div className="bg-primary text-primary-foreground p-5 rounded-3xl shadow-xl -rotate-2 hover:rotate-0 transition-transform duration-500">
                    <TicketPercent className="h-10 w-10 md:h-12 md:w-12" />
                  </div>
                  <div className="mt-4 px-10 py-3 bg-white/60 backdrop-blur-xl border border-white rounded-2xl shadow-sm">
                    <span className="text-xl md:text-2xl font-bold tracking-[0.2em] text-primary/80 uppercase animate-pulse">
                      Coming Soon
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Catalog Section */}
        <section id="products">
          <div className="flex flex-col space-y-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-headline font-bold">Our Catalog</h2>
              
              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10 h-10 rounded-full bg-muted/30 border-muted focus-visible:ring-primary pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {categories.length > 1 && (
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                <TabsList className="bg-muted/50 h-10 p-1 overflow-x-auto flex-nowrap justify-start max-w-full">
                  {categories.map((cat) => (
                    <TabsTrigger 
                      key={cat} 
                      value={cat}
                      className="px-4 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-muted flex flex-col items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">No results found for "{searchQuery}"</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try checking your spelling or using different keywords.</p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                className="mt-6 text-sm font-bold text-primary hover:underline"
              >
                Clear all filters
              </button>
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
