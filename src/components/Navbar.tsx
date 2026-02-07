
"use client";

import Link from 'next/link';
import { ShoppingBasket, ShieldCheck } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <ShoppingBasket className="text-primary-foreground h-6 w-6" />
          </div>
          <span className="font-headline text-2xl font-bold text-primary">EcoCart</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
