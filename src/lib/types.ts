
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  imageUrl: string;
  category: string;
  inStock: boolean;
  unit: string;
  isDiscounted?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderTotals {
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
}
