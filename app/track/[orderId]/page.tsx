"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { CheckCircle, Clock, ChefHat, Bike, PackageCheck } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Order {
  id: string;
  order_number: string;
  status: string;
  delivery_address: string;
  items: { name: string; price: number; quantity: number }[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  shops: { name: string; phone: string };
}

const steps = [
  { status: "Pending", label: "Order placed", icon: CheckCircle },
  { status: "Preparing", label: "Preparing", icon: ChefHat },
  { status: "Ready", label: "Ready for pickup", icon: PackageCheck },
  { status: "Delivered", label: "Delivered", icon: Bike },
];

const statusIndex: Record<string, number> = {
  Pending: 0,
  Preparing: 1,
  Ready: 2,
  Delivered: 3,
};

export default function TrackPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();

    const channel = supabase
      .channel("track-order")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev) =>
            prev ? { ...prev, status: payload.new.status } : prev
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const fetchOrder = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, shops(name, phone)")
      .eq("id", orderId)
      .single();
    if (data) setOrder(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-24 text-sm text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-24 text-sm text-gray-400">
          Order not found.
        </div>
      </div>
    );
  }

  const currentStep = statusIndex[order.status] ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-black text-white px-6 py-8 text-center">
        <h1 className="text-xl font-semibold">Track your order</h1>
        <p className="text-gray-400 text-sm mt-1">
          {order.order_number} &middot; {order.shops?.name}
        </p>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-6">

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="space-y-5">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={step.status} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      done ? "bg-gray-900" : "bg-gray-100"
                    }`}
                  >
                    <Icon size={18} className={done ? "text-white" : "text-gray-300"} />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        active
                          ? "text-gray-900"
                          : done
                          ? "text-gray-500"
                          : "text-gray-300"
                      }`}
                    >
                      {step.label}
                    </p>
                    {active && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Clock size={11} /> In progress...
                      </p>
                    )}
                  </div>
                  {done && !active && (
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-1">
          <p className="text-xs text-gray-400">Delivering to</p>
          <p className="text-sm font-medium text-gray-900">{order.delivery_address}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-medium text-gray-900">Order summary</h2>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-gray-900 font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-1 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>${Number(order.delivery_fee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 text-sm pt-1">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {order.shops?.phone && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Need help?</p>
              <p className="text-sm font-medium text-gray-900">
                Contact {order.shops.name}
              </p>
            </div>
            <a
              href={"tel:" + order.shops.phone}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Call
            </a>
          </div>
        )}

        <a
          href="/shops"
          className="block text-center text-sm text-gray-500 hover:text-gray-900 transition-colors py-2"
        >
          Browse more shops
        </a>

      </div>
    </div>
  );
}
