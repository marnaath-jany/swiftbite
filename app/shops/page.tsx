"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Search, MapPin, Clock, ShoppingBag } from "lucide-react";

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  is_open: boolean;
  delivery_fee: number;
  min_order: number;
}

export default function ShopsPage() {
  const { user, profile } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    const { data } = await supabase
      .from("shops")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setShops(data);
    setLoading(false);
  };

  const filtered = shops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Nav */}
      <div className="bg-black text-white px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-xs">S</span>
          </div>
          <span className="text-sm font-semibold">SwiftBite</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {profile?.role === "shop_owner" && (
                <Link href="/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              )}
              <Link href="/account" className="text-xs text-gray-400 hover:text-white transition-colors">
                My orders
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-xs text-gray-400 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/signup" className="text-xs bg-white text-black px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="bg-black text-white px-6 py-12 text-center">
        <h1 className="text-3xl font-semibold mb-2">Order from local shops</h1>
        <p className="text-gray-400 mb-6">Fresh food delivered to your door</p>
        <div className="relative max-w-md mx-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shops or cuisines..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pl-9 text-sm text-white placeholder:text-gray-400 outline-none focus:border-white/40"
          />
        </div>
      </div>

      {/* Shops grid */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center text-sm text-gray-400 py-20">Loading shops...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-20">No shops found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((shop) => (
              <Link key={shop.id} href={"/shops/" + shop.slug}>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer">

                  {/* Cover */}
                  <div className="h-36 bg-gray-100 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {shop.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-sm font-semibold text-gray-900">{shop.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        shop.is_open
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {shop.is_open ? "Open" : "Closed"}
                      </span>
                    </div>

                    {shop.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{shop.description}</p>
                    )}

                    {shop.address && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} />
                        {shop.address.split(",")[0]}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <ShoppingBag size={11} />
                        Min. ${shop.min_order.toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        Delivery ${shop.delivery_fee.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}