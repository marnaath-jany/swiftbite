"use client";

import { createContext, useContext, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  shopId: string | null;
  shopName: string | null;
  deliveryFee: number;
  addToCart: (item: CartItem, shopId: string, shopName: string, deliveryFee: number) => void;
  removeFromCart: (id: string) => void;
  deleteFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  shopId: null,
  shopName: null,
  deliveryFee: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  deleteFromCart: () => {},
  clearCart: () => {},
  cartTotal: 0,
  cartCount: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);

  const addToCart = (item: CartItem, sid: string, sname: string, fee: number) => {
    // If adding from a different shop, clear cart first
    if (shopId && shopId !== sid) {
      setCart([]);
    }
    setShopId(sid);
    setShopName(sname);
    setDeliveryFee(fee);
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing?.quantity === 1) return prev.filter((c) => c.id !== id);
      return prev.map((c) => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
    });
  };

  const deleteFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));

  const clearCart = () => {
    setCart([]);
    setShopId(null);
    setShopName(null);
    setDeliveryFee(0);
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, shopId, shopName, deliveryFee,
      addToCart, removeFromCart, deleteFromCart, clearCart,
      cartTotal, cartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);