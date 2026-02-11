
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
    <Card className={`overflow-hidden group hover:shadow-lg transition-shadow border-none bg-white relative ${!product.inStock ? 'opacity-75' : ''}`}>
      <div className="aspect-[4/3] relative overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className={`object-cover transition-transform group-hover:scale-105 ${!product.inStock ? 'grayscale' : ''}`}
          data-ai-hint="fresh produce"
        />
        
        {/* Badges - Only show if marked as discounted AND in stock */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 items-end">
          {!product.inStock && (
            <Badge variant="destructive" className="font-bold shadow-sm">Out of Stock</Badge>
          )}
          {hasDiscount && product.inStock && (
            <Badge className="bg-green-600 hover:bg-green-700 text-white font-bold animate-pulse shadow-md border-none">
              SAVE Rs. {savings}
            </Badge>
          )}
          {/* Only show "Deal" badge if it's marked as discounted but doesn't have a specific savings amount (e.g. prices equal) */}
          {product.isDiscounted && !hasDiscount && product.inStock && (
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground border-none shadow-sm">
              <Tag className="h-3 w-3 mr-1" /> Deal
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex flex-col mb-2">
          <h3 className="font-headline font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
          
          <div className="flex flex-col mt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-primary font-bold text-xl">
                Rs. {currentPrice}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                  Rs. {originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-normal">per {product.unit}</span>
              {hasDiscount && (
                <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                  <TrendingDown className="h-3 w-3" /> Special Offer
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-xs line-clamp-2 min-h-[2rem]">
          {product.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => product.inStock && addToCart(product)}
          disabled={!product.inStock}
          className={`w-full font-semibold ${!product.inStock ? 'bg-muted text-muted-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
        >
          {product.inStock ? (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add to Cart
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-2" />
              Unavailable
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
