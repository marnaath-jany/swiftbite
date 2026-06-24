"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  shops: { name: string };
  items: { name: string; quantity: number; price: number }[];
}

export default function AccountPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, shops(name)")
      .eq("customer_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
    setOrdersLoading(false);
  };

  const statusStyles: Record<string, string> = {
    Pending: "bg-blue-100 text-blue-700",
    Preparing: "bg-amber-100 text-amber-700",
    Ready: "bg-green-100 text-green-700",
    Delivered: "bg-gray-100 text-gray-500",
  };

  function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-24 text-sm text-gray-400">
        Loading...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-black text-white px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold">My Account</h1>
          <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
          {profile?.full_name && (
            <p className="text-sm text-gray-300 mt-0.5">{profile.full_name}</p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
              <ShoppingBag size={13} /> Total orders
            </div>
            <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
              <Clock size={13} /> Active orders
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              {orders.filter((o) => o.status !== "Delivered").length}
            </p>
          </div>
        </div>

        {/* Order history */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">Order history</h2>
          </div>

          {ordersLoading ? (
            <div className="text-center text-sm text-gray-400 py-12">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm text-gray-400">No orders yet</p>
              <Link
                href="/shops"
                className="inline-block bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Browse shops
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <Link key={order.id} href={"/track/" + order.id}>
                  <div className="px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {order.order_number}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            statusStyles[order.status] ?? "bg-gray-100 text-gray-500"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{order.shops?.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.items?.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          ${Number(order.total).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {timeAgo(order.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Browse more */}
        <div className="text-center">
          <Link
            href="/shops"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors underline underline-offset-2"
          >
            Browse shops
          </Link>
        </div>

      </div>
    </div>
  );
}