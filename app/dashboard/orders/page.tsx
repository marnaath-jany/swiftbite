"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Clock, CheckCircle, X } from "lucide-react";

type Status = "Pending" | "Preparing" | "Ready" | "Delivered";

interface Order {
  id: string;
  order_number: string;
  status: Status;
  delivery_address: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
  created_at: string;
}

const columns: Status[] = ["Pending", "Preparing", "Ready", "Delivered"];

const nextStatus: Record<Status, Status | null> = {
  Pending: "Preparing",
  Preparing: "Ready",
  Ready: "Delivered",
  Delivered: null,
};

const actionLabel: Record<Status, string> = {
  Pending: "Start preparing",
  Preparing: "Mark ready",
  Ready: "Mark delivered",
  Delivered: "",
};

const colStyles: Record<Status, { dot: string; badge: string; bg: string }> = {
  Pending: { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700", bg: "bg-blue-50/50" },
  Preparing: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700", bg: "bg-amber-50/50" },
  Ready: { dot: "bg-green-400", badge: "bg-green-50 text-green-700", bg: "bg-green-50/50" },
  Delivered: { dot: "bg-gray-300", badge: "bg-gray-100 text-gray-500", bg: "bg-gray-50" },
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function DashboardOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status | "All">("All");

  // Step 1 — fetch shop first
  useEffect(() => {
    if (!user) return;

    const getShop = async () => {
      const { data: shop } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (shop) {
        setShopId(shop.id);
      }
      setLoading(false);
    };

    getShop();
  }, [user]);

  // Step 2 — fetch orders and subscribe once shopId is ready
  useEffect(() => {
    if (!shopId) return;

    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      if (data) setOrders(data);
    };

    fetchOrders();

    // Set up realtime subscription separately
    const channel = supabase
      .channel("dashboard-orders-" + shopId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `shop_id=eq.${shopId}`,
        },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId]);

  const advance = async (id: string, current: Status) => {
    const next = nextStatus[current];
    if (!next) return;
    await supabase.from("orders").update({ status: next }).eq("id", id);
  };

  const cancel = async (id: string) => {
    await supabase.from("orders").delete().eq("id", id);
  };

  const filtered = filter === "All"
    ? orders
    : orders.filter((o) => o.status === filter);

  if (loading) return <div className="text-sm text-gray-400">Loading orders...</div>;

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["All", "Pending", "Preparing", "Ready", "Delivered"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              filter === s
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {s}
            <span className="ml-1.5 text-xs opacity-60">
              {s === "All" ? orders.length : orders.filter((o) => o.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24 text-gray-300 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
          No orders yet — share your shop link to get started
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((status) => {
            const col = filtered.filter((o) => o.status === status);
            const styles = colStyles[status];
            return (
              <div key={status} className={`${styles.bg} rounded-2xl p-3 min-h-50`}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                  <span className="text-sm font-medium text-gray-700">{status}</span>
                  <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
                    {col.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {col.length === 0 && (
                    <div className="text-center text-xs text-gray-300 py-8">No orders</div>
                  )}
                  {col.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">{order.order_number}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={11} />{timeAgo(order.created_at)}
                          </span>
                          {status !== "Delivered" && (
                            <button
                              onClick={() => cancel(order.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 truncate">{order.delivery_address}</p>

                      <ul className="space-y-0.5">
                        {order.items.map((item, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
                            {item.quantity}x {item.name}
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <span className="text-sm font-semibold text-gray-900">
                          ${Number(order.total).toFixed(2)}
                        </span>
                        {status !== "Delivered" && (
                          <button
                            onClick={() => advance(order.id, order.status)}
                            className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            <CheckCircle size={13} />
                            {actionLabel[status]}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}