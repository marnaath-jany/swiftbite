"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface KitchenOrder {
  id: string;
  table: string;
  items: { name: string; done: boolean }[];
  placedAt: number;
}

const initialTickets: KitchenOrder[] = [
  {
    id: "#083", table: "Table 4",
    items: [
      { name: "Classic Burger", done: false },
      { name: "Fries", done: true },
      { name: "Cola", done: true },
    ],
    placedAt: Date.now() - 2 * 60 * 1000,
  },
  {
    id: "#082", table: "Table 7",
    items: [
      { name: "Pasta Carbonara", done: false },
      { name: "House Wine", done: false },
    ],
    placedAt: Date.now() - 8 * 60 * 1000,
  },
  {
    id: "#081", table: "Table 2",
    items: [
      { name: "Steak", done: false },
      { name: "Caesar Salad", done: true },
    ],
    placedAt: Date.now() - 14 * 60 * 1000,
  },
  {
    id: "#079", table: "Table 1",
    items: [
      { name: "Fish & Chips", done: false },
      { name: "Fresh Lemonade", done: false },
    ],
    placedAt: Date.now() - 5 * 60 * 1000,
  },
  {
    id: "#078", table: "Table 6",
    items: [
      { name: "Caesar Salad", done: true },
      { name: "Sparkling Water", done: true },
    ],
    placedAt: Date.now() - 11 * 60 * 1000,
  },
];

function useElapsed(placedAt: number) {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - placedAt) / 1000));
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - placedAt) / 1000)), 1000);
    return () => clearInterval(t);
  }, [placedAt]);
  return elapsed;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function urgencyStyle(seconds: number) {
  if (seconds >= 15 * 60) return { border: "border-red-300", bg: "bg-red-50", badge: "bg-red-100 text-red-700", icon: "text-red-500" };
  if (seconds >= 8 * 60) return { border: "border-amber-300", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700", icon: "text-amber-500" };
  return { border: "border-gray-200", bg: "bg-white", badge: "bg-gray-100 text-gray-600", icon: "text-gray-400" };
}

function TicketCard({ ticket, onToggleItem, onComplete }: {
  ticket: KitchenOrder;
  onToggleItem: (ticketId: string, itemIndex: number) => void;
  onComplete: (ticketId: string) => void;
}) {
  const elapsed = useElapsed(ticket.placedAt);
  const styles = urgencyStyle(elapsed);
  const allDone = ticket.items.every((i) => i.done);

  return (
    <div className={`border ${styles.border} ${styles.bg} rounded-2xl p-4 space-y-3 transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{ticket.table}</p>
          <p className="text-xs text-gray-400">{ticket.id}</p>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${styles.badge}`}>
          {elapsed >= 15 * 60
            ? <AlertCircle size={12} className={styles.icon} />
            : <Clock size={12} className={styles.icon} />}
          {formatTime(elapsed)}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {ticket.items.map((item, i) => (
          <button
            key={i}
            onClick={() => onToggleItem(ticket.id, i)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
              item.done
                ? "bg-green-50 text-green-700 line-through"
                : "bg-white border border-gray-100 text-gray-700 hover:border-gray-300"
            }`}
          >
            <CheckCircle
              size={15}
              className={item.done ? "text-green-500 shrink-0" : "text-gray-200 shrink-0"}
            />
            {item.name}
          </button>
        ))}
      </div>

      {/* Complete button */}
      <button
        onClick={() => onComplete(ticket.id)}
        disabled={!allDone}
        className={`w-full text-sm py-2 rounded-lg font-medium transition-colors ${
          allDone
            ? "bg-gray-900 text-white hover:bg-gray-700"
            : "bg-gray-100 text-gray-300 cursor-not-allowed"
        }`}
      >
        {allDone ? "Mark as Ready ✓" : "Complete all items first"}
      </button>
    </div>
  );
}

export default function KitchenPage() {
  const [tickets, setTickets] = useState<KitchenOrder[]>(initialTickets);

  const toggleItem = (ticketId: string, itemIndex: number) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, items: t.items.map((item, i) => (i === itemIndex ? { ...item, done: !item.done } : item)) }
          : t
      )
    );
  };

  const complete = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Kitchen Display</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tickets.length} active tickets</p>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" />Under 8m</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block" />8–15m</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-300 inline-block" />Over 15m</span>
        </div>
      </div>

      {/* Tickets grid */}
      {tickets.length === 0 ? (
        <div className="text-center py-24 text-gray-300 text-sm">
          No active tickets — all caught up!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onToggleItem={toggleItem}
              onComplete={complete}
            />
          ))}
        </div>
      )}
    </div>
  );
}