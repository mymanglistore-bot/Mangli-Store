
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Navbar() {
  const logo = PlaceHolderImages.find(img => img.id === 'logo');

  return (
    <header className="sticky top-0 z-40 w-full flex flex-col">
      {/* Top Banner: Delivery Location */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-[10px] sm:text-xs md:text-sm font-bold tracking-wide uppercase shadow-sm">
        Delivery available only in Karimnagar (505001)
      </div>

      {/* Secondary Banner: Store Features */}
      <div className="bg-accent/10 backdrop-blur-sm text-foreground py-2 border-b flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-6 gap-y-1 px-4 text-[9px] sm:text-[10px] md:text-xs font-semibold">
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          🚚 Free delivery on orders over Rs. 300
        </span>
        <span className="text-muted-foreground/30 hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          📦 Maximum order limit Rs. 2000
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
            <div className="w-12 h-12 relative overflow-hidden rounded-full shadow-md shadow-primary/20 bg-primary/10">
              <Image
                src={logo?.imageUrl || "https://picsum.photos/seed/manglistore/100/100"}
                alt="Mangli.Store Logo"
                fill
                className="object-cover"
                data-ai-hint="grocery logo"
              />
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
}
