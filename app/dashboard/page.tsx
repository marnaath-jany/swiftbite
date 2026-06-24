"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, DollarSign, UtensilsCrossed, ToggleLeft, ToggleRight } from "lucide-react";

interface Shop {
  id: string;
  name: string;
  slug: string;
  is_open: boolean;
  delivery_fee: number;
  min_order: number;
}

interface Stats {
  orders: number;
  revenue: number;
  menuItems: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState<Stats>({ orders: 0, revenue: 0, menuItems: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: shopData } = await supabase
      .from("shops")
      .select("*")
      .eq("owner_id", user!.id)
      .single();

    if (shopData) {
      setShop(shopData);

      const [{ count: orderCount }, { data: orders }, { count: menuCount }] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("shop_id", shopData.id),
        supabase.from("orders").select("total").eq("shop_id", shopData.id),
        supabase.from("menu_items").select("*", { count: "exact", head: true }).eq("shop_id", shopData.id),
      ]);

      const revenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;
      setStats({ orders: orderCount ?? 0, revenue, menuItems: menuCount ?? 0 });
    }

    setLoading(false);
  };

  const toggleShop = async () => {
    if (!shop) return;
    await supabase.from("shops").update({ is_open: !shop.is_open }).eq("id", shop.id);
    setShop((prev) => prev ? { ...prev, is_open: !prev.is_open } : prev);
  };

  if (loading) return <div className="text-sm text-gray-400">Loading...</div>;
  if (!shop) return <div className="text-sm text-gray-400">No shop found.</div>;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{shop.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            swiftbite.com/shops/{shop.slug}
          </p>
        </div>
        <button
          onClick={toggleShop}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors ${
            shop.is_open
              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          {shop.is_open ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          {shop.is_open ? "Open" : "Closed"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total orders", value: stats.orders, icon: ShoppingBag },
          { label: "Total revenue", value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign },
          { label: "Menu items", value: stats.menuItems, icon: UtensilsCrossed },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
              <Icon size={14} />
              {label}
            </div>
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
          </div>
        ))}
      </div>

      {/* Shop info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-medium text-gray-900">Shop details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Delivery fee</p>
            <p className="text-gray-900 font-medium">${shop.delivery_fee.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Min. order</p>
            <p className="text-gray-900 font-medium">${shop.min_order.toFixed(2)}</p>
          </div>
        </div>
        
          <button
          onClick={() => window.open("/shops/" + shop.slug, "_blank")}
          className="inline-block text-xs text-gray-500 hover:text-gray-900 underline underline-offset-2 transition-colors"
        >
          View your public shop page
        </button>
      </div>

    </div>
  );
}