"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Phone, Clock, Plus, Minus, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  is_open: boolean;
  delivery_fee: number;
  min_order: number;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
}

export default function ShopPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { cart, shopId, addToCart, removeFromCart, deleteFromCart, clearCart, cartTotal, cartCount, deliveryFee } = useCart();

  const [shop, setShop] = useState<Shop | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    fetchShop();
  }, [slug]);

  const fetchShop = async () => {
    const { data: shopData } = await supabase
      .from("shops")
      .select("*")
      .eq("slug", slug)
      .single();

    if (shopData) {
      setShop(shopData);
      const { data: menuData } = await supabase
        .from("menu_items")
        .select("*")
        .eq("shop_id", shopData.id)
        .eq("available", true)
        .order("category");
      if (menuData) setItems(menuData);
    }
    setLoading(false);
  };

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);
  const cartItemQty = (id: string) => cart.find((c) => c.id === id)?.quantity ?? 0;

  const handleAddToCart = (item: MenuItem) => {
    if (!shop) return;
    // Warn if adding from different shop
    if (shopId && shopId !== shop.id) {
      if (!confirm("Your cart has items from another shop. Clear cart and start new order?")) return;
      clearCart();
    }
    addToCart(
      { id: item.id, name: item.name, price: item.price, quantity: 1 },
      shop.id,
      shop.name,
      shop.delivery_fee
    );
  };

  const placeOrder = async () => {
    if (!deliveryAddress.trim()) {
      setShowAddressModal(true);
      return;
    }

    if (!shop) return;
    setCheckingOut(true);

    const orderNumber = "#" + String(Math.floor(Math.random() * 9000) + 1000);

    const { data, error } = await supabase.from("orders").insert({
      shop_id: shop.id,
      customer_id: user?.id ?? null,
      order_number: orderNumber,
      delivery_address: deliveryAddress,
      items: cart.map((c) => ({ id: c.id, name: c.name, price: c.price, quantity: c.quantity })),
      subtotal: cartTotal,
      delivery_fee: shop.delivery_fee,
      total: cartTotal + shop.delivery_fee,
      status: "Pending",
    }).select().single();

    setCheckingOut(false);

    if (error) {
      alert("Order failed: " + error.message);
      return;
    }

    clearCart();
    router.push("/track/" + data.id);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading...</div>
  );

  if (!shop) return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Shop not found.</div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Shop header */}
      <div className="bg-black text-white px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-black text-2xl font-bold">{shop.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold">{shop.name}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  shop.is_open ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                }`}>
                  {shop.is_open ? "Open" : "Closed"}
                </span>
              </div>
              {shop.description && <p className="text-gray-400 text-sm mt-1">{shop.description}</p>}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
                {shop.address && <span className="flex items-center gap-1"><MapPin size={12} />{shop.address}</span>}
                {shop.phone && <span className="flex items-center gap-1"><Phone size={12} />{shop.phone}</span>}
                <span className="flex items-center gap-1"><Clock size={12} />Delivery ${shop.delivery_fee.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-8">

          {/* Menu */}
          <div className="flex-1 space-y-6">
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                    activeCategory === cat
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filtered.map((item) => {
                const qty = cartItemQty(item.id);
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 text-2xl">
                      🍽️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      {item.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>}
                      <p className="text-sm font-semibold text-gray-900 mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="shrink-0">
                      {qty === 0 ? (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-semibold w-4 text-center">{qty}</span>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center hover:bg-gray-700"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop cart */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={16} /> Your order
              </h2>
              {cart.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">Add items to get started</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400 text-xs w-4">{item.quantity}x</span>
                        <span className="flex-1 text-gray-700 truncate">{item.name}</span>
                        <span className="text-gray-900 font-medium shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                        <button onClick={() => deleteFromCart(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-3 space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Delivery</span><span>${shop.delivery_fee.toFixed(2)}</span></div>
                    <div className="flex justify-between font-semibold text-gray-900 text-sm pt-1">
                      <span>Total</span><span>${(cartTotal + shop.delivery_fee).toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Delivery address</label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your address"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
                    />
                  </div>
                  <button
                    onClick={placeOrder}
                    disabled={checkingOut}
                    className="w-full bg-gray-900 text-white text-sm py-2.5 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    {checkingOut ? "Placing order..." : "Place order"}
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile cart button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-6 lg:hidden z-40">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl flex items-center justify-between px-5 shadow-lg"
          >
            <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-lg">{cartCount}</span>
            <span className="text-sm font-medium">View cart</span>
            <span className="text-sm font-semibold">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Mobile cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Your order</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 text-xs w-4">{item.quantity}x</span>
                  <span className="flex-1 text-gray-700">{item.name}</span>
                  <span className="text-gray-900 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => deleteFromCart(item.id)} className="text-gray-300 hover:text-red-400"><X size={13} /></button>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1 text-xs text-gray-500">
              <div className="flex justify-between"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>${shop.delivery_fee.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-gray-900 text-sm pt-1">
                <span>Total</span><span>${(cartTotal + shop.delivery_fee).toFixed(2)}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Delivery address</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your address"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <button
              onClick={placeOrder}
              disabled={checkingOut}
              className="w-full bg-gray-900 text-white text-sm py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50">
              {checkingOut ? "Placing order..." : "Place order"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}