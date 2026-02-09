"use client";

import Image from 'next/image';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, XCircle } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <Card className={`overflow-hidden group hover:shadow-lg transition-shadow border-none bg-white ${!product.inStock ? 'opacity-75' : ''}`}>
      <div className="aspect-[4/3] relative overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className={`object-cover transition-transform group-hover:scale-105 ${!product.inStock ? 'grayscale' : ''}`}
          data-ai-hint="fresh produce"
        />
        {!product.inStock && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="destructive" className="font-bold">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex flex-col mb-2">
          <h3 className="font-headline font-semibold text-lg line-clamp-1">{product.name}</h3>
          <span className="text-primary font-bold">Rs. {product.price}</span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 min-h-[2.5rem]">
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
