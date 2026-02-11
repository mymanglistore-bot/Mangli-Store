
"use client";

import Image from 'next/image';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, XCircle, Tag, TrendingDown } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  
  // Ensure we are working with numbers for calculations
  const currentPrice = Number(product.price) || 0;
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : 0;
  
  // Savings logic: only show if product is explicitly marked as a discount deal 
  // AND the original price is truly higher than the current price
  const hasDiscount = !!product.isDiscounted && originalPrice > currentPrice;
  const savings = hasDiscount ? originalPrice - currentPrice : 0;

  return (
    <Card className={`overflow-hidden group hover:shadow-md transition-shadow border border-border/50 bg-white relative flex flex-col h-full ${!product.inStock ? 'opacity-75' : ''}`}>
      <div className="aspect-[4/3] relative overflow-hidden bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className={`object-cover transition-transform group-hover:scale-105 ${!product.inStock ? 'grayscale' : ''}`}
          data-ai-hint="fresh produce"
        />
        
        {/* Badges - Only show if marked as discounted AND in stock */}
        <div className="absolute top-1 right-1 flex flex-col gap-1 z-10 items-end">
          {!product.inStock && (
            <Badge variant="destructive" className="font-bold shadow-sm text-[8px] py-0 px-1">Out of Stock</Badge>
          )}
          {hasDiscount && product.inStock && (
            <Badge className="bg-green-600 hover:bg-green-700 text-white font-bold animate-pulse shadow-md border-none text-[8px] py-0 px-1">
              SAVE Rs. {savings}
            </Badge>
          )}
          {product.isDiscounted && !hasDiscount && product.inStock && (
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground border-none shadow-sm text-[8px] py-0 px-1">
              <Tag className="h-2 w-2 mr-0.5" /> Deal
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-2.5 flex-grow flex flex-col">
        <div className="flex flex-col mb-1.5">
          <h3 className="font-headline font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
          
          <div className="flex flex-col mt-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-primary font-bold text-base">
                Rs. {currentPrice}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-muted-foreground line-through decoration-destructive/50">
                  Rs. {originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground font-normal">per {product.unit}</span>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-[10px] line-clamp-2 leading-tight">
          {product.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-2.5 pt-0">
        <Button 
          size="sm"
          onClick={() => product.inStock && addToCart(product)}
          disabled={!product.inStock}
          className={`w-full h-8 text-xs font-semibold ${!product.inStock ? 'bg-muted text-muted-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
        >
          {product.inStock ? (
            <>
              <Plus className="h-3 w-3 mr-1" />
              Add
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              Out
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
