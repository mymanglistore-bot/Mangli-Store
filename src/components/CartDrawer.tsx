"use client";
import emailjs from '@emailjs/browser';
import React, { useState, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Minus, Plus, Trash2, MapPin, AlertCircle, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MAX_ORDER_LIMIT } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFirestore } from '@/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function CartDrawer() {
  const { cart, totals, updateQuantity, removeFromCart, clearCart } = useCart();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const [isAfterHours, setIsAfterHours] = useState(false);

  // Form State - The "Temporary Notepad"
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isOverLimit = totals.grandTotal > MAX_ORDER_LIMIT;

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setIsAfterHours(hour >= 20 || hour < 6);
    };
    checkTime();
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isOverLimit) return;
    if (customerInfo.phone.length !== 10) {
      toast({ variant: "destructive", title: "Invalid Phone", description: "Please enter a 10-digit phone number." });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Save to Firebase "Vault"
      if (firestore) {
        await addDoc(collection(firestore, 'orders'), {
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          address: customerInfo.address,
          items: cart,
          total: totals.grandTotal,
          deliveryNote: isAfterHours ? "Next Day Delivery" : "Standard",
          status: 'pending',
          createdAt: serverTimestamp(),
        });
      }

      // Step 2: Send Gmail Alert via EmailJS
      await emailjs.send(
        'service_orders',     // Your Service ID
        'template_hc2nhxk',   // Your Template ID
        {
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          address: customerInfo.address,
          total: totals.grandTotal.toFixed(2),
        },
        'hR3yYN2MpOAeDCoRl'    // Your Public Key
      );

      // Step 3: Show Success & Clear Cart
      setIsOrdered(true);
      clearCart();
      toast({ title: "Order Placed!", description: "Notification sent to store and WhatsApp." });
      
    } catch (error) {
      console.error("Order Error:", error);
      toast({ variant: "destructive", title: "Error", description: "Something went wrong. Please check your connection." });
    } finally {
      setIsSubmitting(false);
    }
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
      <SheetContent className="w-full sm:max-w-md flex flex-col overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-headline text-2xl">
            {isOrdered ? "Order Confirmed" : "Your Shopping Cart"}
          </SheetTitle>
        </SheetHeader>
        
        {isOrdered ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <CheckCircle2 className="h-20 w-20 text-green-500 animate-in zoom-in" />
            <h3 className="text-xl font-bold">Thank You, {customerInfo.name}!</h3>
            <p className="text-muted-foreground text-sm">
              We have received your order. Our team will message you on **{customerInfo.phone}** to confirm the delivery time.
            </p>
            <Button onClick={() => setIsOrdered(false)} variant="outline">Back to Shop</Button>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <div className="space-y-6 flex-grow">
            <ScrollArea className="h-[30vh] pr-4 border-b pb-4">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-muted/20 p-2 rounded-lg">
                    <div className="flex-grow">
                      <h4 className="font-bold text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">Rs. {item.price} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-6 w-6 border rounded-full flex items-center justify-center text-xs">-</button>
                      <span className="text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-6 w-6 border rounded-full flex items-center justify-center text-xs">+</button>
                      <button onClick={() => removeFromCart(item.id)} className="ml-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 py-2">
              <h3 className="text-sm font-bold flex items-center gap-2"><MapPin className="h-4 w-4" /> Delivery Details</h3>
              <div className="space-y-3">
                <Input 
                  placeholder="Your Full Name" 
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  required
                />
                <Input 
                  placeholder="WhatsApp Number (10 Digits)" 
                  type="tel"
                  maxLength={10}
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value.replace(/\D/g, '')})}
                  required
                />
                <Textarea 
                  placeholder="Full Delivery Address" 
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 bg-muted/30 p-4 rounded-xl">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>Rs. {totals.subtotal}</span></div>
              <div className="flex justify-between text-sm"><span>Delivery</span><span>{totals.deliveryCharge === 0 ? "FREE" : `Rs. ${totals.deliveryCharge}`}</span></div>
              <Separator />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>Rs. {totals.grandTotal}</span></div>
            </div>

            {isAfterHours && (
              <Alert className="bg-orange-50 border-orange-200">
                <Clock className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-xs text-orange-800">Note: It's late! Delivery will be made tomorrow morning.</AlertDescription>
              </Alert>
            )}

            <Button 
              className="w-full h-14 text-lg font-bold shadow-lg"
              onClick={handlePlaceOrder}
              disabled={isOverLimit || isSubmitting || !customerInfo.name || !customerInfo.address || customerInfo.phone.length < 10}
            >
              {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : "Place Order Now"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}