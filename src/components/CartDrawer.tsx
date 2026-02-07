
"use client";

import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Minus, Plus, Trash2, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MAX_ORDER_LIMIT, WHATSAPP_NUMBER } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

export function CartDrawer() {
  const { cart, totals, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    if (totals.grandTotal > MAX_ORDER_LIMIT) {
      toast({
        variant: "destructive",
        title: "Order Limit Exceeded",
        description: `Maximum order limit is Rs. ${MAX_ORDER_LIMIT}. Please remove some items.`,
      });
      return;
    }

    let message = `*New Order Details* \n--------------------------\n`;
    cart.forEach(item => {
      message += `• ${item.name} x ${item.quantity} = Rs. ${item.price * item.quantity}\n`;
    });
    message += `\n--------------------------\n`;
    message += `*Subtotal:* Rs. ${totals.subtotal}\n`;
    message += `*Delivery:* Rs. ${totals.deliveryCharge === 0 ? 'FREE' : totals.deliveryCharge}\n`;
    message += `*Grand Total: Rs. ${totals.grandTotal}*\n\n`;
    message += `📍 Please share your Google Maps location or full address below:`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    clearCart();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center">
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-background">
              {itemCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-headline text-2xl">Your Shopping Cart</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-grow pr-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex-grow">
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">Rs. {item.price} per unit</p>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-muted"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-muted"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between items-end">
                    <span className="font-bold text-sm">Rs. {item.price * item.quantity}</span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:bg-destructive/10 p-1 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {cart.length > 0 && (
          <div className="pt-6 mt-auto space-y-4">
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Rs. {totals.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span className={totals.deliveryCharge === 0 ? "text-primary font-bold" : ""}>
                  {totals.deliveryCharge === 0 ? "FREE" : `Rs. ${totals.deliveryCharge}`}
                </span>
              </div>
              {totals.subtotal < 300 && totals.subtotal > 0 && (
                <p className="text-[10px] text-muted-foreground italic text-center">
                  Add Rs. {300 - totals.subtotal} more for FREE delivery!
                </p>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Total</span>
                <span>Rs. {totals.grandTotal}</span>
              </div>
            </div>
            
            <Button 
              className="w-full h-12 text-lg font-bold"
              onClick={handleCheckout}
              disabled={totals.grandTotal > MAX_ORDER_LIMIT}
            >
              Order via WhatsApp
            </Button>
            
            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
              <MapPin className="h-3 w-3" />
              You will share your location on WhatsApp
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
