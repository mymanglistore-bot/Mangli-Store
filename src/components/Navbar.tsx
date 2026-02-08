"use client";

import Link from 'next/link';
import { ShoppingBasket } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full flex flex-col">
      {/* Top Banner: Delivery Location */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-[10px] sm:text-xs md:text-sm font-bold tracking-wide uppercase shadow-sm">
        Delivery available only in Karimnagar (505001)
      </div>

      {/* Secondary Banner: Store Features */}
      <div className="bg-accent/10 backdrop-blur-sm text-foreground py-2 border-b flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-6 gap-y-1 px-4 text-[9px] sm:text-[10px] md:text-xs font-semibold">
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          🚚 Free delivery on orders over ₹300
        </span>
        <span className="text-muted-foreground/30 hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          📦 Maximum order limit ₹2000
        </span>
        <span className="text-muted-foreground/30 hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          ⚡ Orders delivered in 1-2 hours
        </span>
      </div>

      {/* Main Navigation Bar */}
      <nav className="w-full border-b bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-md shadow-primary/20">
              <ShoppingBasket className="text-primary-foreground h-6 w-6" />
            </div>
            <span className="font-headline text-2xl font-bold text-primary tracking-tight">Mangli.Store</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
