"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";

type TableStatus = "Free" | "Occupied" | "Reserved";

interface Table {
  id: number;
  name: string;
  seats: number;
  status: TableStatus;
  guest?: string;
  order?: string;
}

const initialTables: Table[] = [
  { id: 1, name: "Table 1", seats: 2, status: "Occupied", guest: "Walk-in", order: "#079" },
  { id: 2, name: "Table 2", seats: 4, status: "Occupied", guest: "Johnson", order: "#081" },
  { id: 3, name: "Table 3", seats: 4, status: "Free" },
  { id: 4, name: "Table 4", seats: 2, status: "Occupied", guest: "Walk-in", order: "#083" },
  { id: 5, name: "Table 5", seats: 6, status: "Reserved", guest: "Smith · 7:00 PM" },
  { id: 6, name: "Table 6", seats: 4, status: "Occupied", guest: "Walk-in", order: "#078" },
  { id: 7, name: "Table 7", seats: 2, status: "Occupied", guest: "Walk-in", order: "#082" },
  { id: 8, name: "Table 8", seats: 8, status: "Free" },
  { id: 9, name: "Table 9", seats: 4, status: "Occupied", guest: "Walk-in", order: "#080" },
  { id: 10, name: "Table 10", seats: 2, status: "Free" },
  { id: 11, name: "Table 11", seats: 6, status: "Reserved", guest: "Davis · 8:30 PM" },
  { id: 12, name: "Table 12", seats: 4, status: "Free" },
];

const statusStyles: Record<TableStatus, { card: string; badge: string; dot: string }> = {
  Free: {
    card: "border-gray-200 bg-white",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-400",
  },
  Occupied: {
    card: "border-gray-300 bg-gray-50",
    badge: "bg-gray-200 text-gray-700",
    dot: "bg-gray-500",
  },
  Reserved: {
    card: "border-blue-200 bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-400",
  },
};

const cycleStatus: Record<TableStatus, TableStatus> = {
  Free: "Occupied",
  Occupied: "Reserved",
  Reserved: "Free",
};

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [filter, setFilter] = useState<TableStatus | "All">("All");

  const filtered = filter === "All" ? tables : tables.filter((t) => t.status === filter);

  const counts = {
    Free: tables.filter((t) => t.status === "Free").length,
    Occupied: tables.filter((t) => t.status === "Occupied").length,
    Reserved: tables.filter((t) => t.status === "Reserved").length,
  };

  const cycleTable = (id: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: cycleStatus[t.status] } : t
      )
    );
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tables</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {counts.Occupied} occupied · {counts.Free} free · {counts.Reserved} reserved
          </p>
        </div>
        <button className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          <Plus size={15} />
          Add Table
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {(["Free", "Occupied", "Reserved"] as TableStatus[]).map((s) => (
          <div key={s} className="bg-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${statusStyles[s].dot}`} />
              <span className="text-xs text-gray-500">{s}</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{counts[s]}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["All", "Free", "Occupied", "Reserved"] as const).map((s) => (
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
          </button>
        ))}
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((table) => {
          const styles = statusStyles[table.status];
          return (
            <div
              key={table.id}
              onClick={() => cycleTable(table.id)}
              className={`border ${styles.card} rounded-2xl p-4 cursor-pointer hover:shadow-sm transition-all space-y-3`}
            >
              {/* Top */}
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-gray-900">{table.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
                  {table.status}
                </span>
              </div>

              {/* Seats */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Users size={13} />
                {table.seats} seats
              </div>

              {/* Guest / Order info */}
              {table.guest && (
                <div className="text-xs text-gray-500 border-t border-gray-100 pt-2">
                  <p>{table.guest}</p>
                  {table.order && <p className="text-gray-400">Order {table.order}</p>}
                </div>
              )}

              {table.status === "Free" && (
                <p className="text-xs text-gray-300 border-t border-gray-100 pt-2">Tap to mark occupied</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}