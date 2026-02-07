
"use client";

import Image from 'next/image';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow border-none bg-white">
      <div className="aspect-[4/3] relative overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          data-ai-hint="fresh produce"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-headline font-semibold text-lg line-clamp-1">{product.name}</h3>
          <span className="text-primary font-bold">Rs. {product.price}</span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => addToCart(product)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
