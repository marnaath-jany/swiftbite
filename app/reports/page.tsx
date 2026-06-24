"use client";

import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { TrendingUp, ShoppingBag, Star, Download } from "lucide-react";

const weeklyRevenue = [
  { day: "Mon", revenue: 1800 },
  { day: "Tue", revenue: 2100 },
  { day: "Wed", revenue: 1600 },
  { day: "Thu", revenue: 2400 },
  { day: "Fri", revenue: 2800 },
  { day: "Sat", revenue: 3200 },
  { day: "Sun", revenue: 2340 },
];

const monthlyRevenue = [
  { day: "Week 1", revenue: 11200 },
  { day: "Week 2", revenue: 13400 },
  { day: "Week 3", revenue: 12100 },
  { day: "Week 4", revenue: 15800 },
];

const topItems = [
  { name: "Classic Burger", sold: 124 },
  { name: "Margherita Pizza", sold: 98 },
  { name: "Caesar Salad", sold: 87 },
  { name: "BBQ Ribs", sold: 74 },
  { name: "Pasta Carbonara", sold: 61 },
];

const orderTrend = [
  { day: "Mon", orders: 42 },
  { day: "Tue", orders: 56 },
  { day: "Wed", orders: 38 },
  { day: "Thu", orders: 61 },
  { day: "Fri", orders: 74 },
  { day: "Sat", orders: 89 },
  { day: "Sun", orders: 64 },
];

const stats = [
  { label: "Total revenue", value: "$16,240", sub: "This week", icon: TrendingUp },
  { label: "Total orders", value: "424", sub: "This week", icon: ShoppingBag },
  { label: "Avg order value", value: "$38.30", sub: "This week", icon: Star },
];

type Range = "Weekly" | "Monthly";

export default function ReportsPage() {
  const [range, setRange] = useState<Range>("Weekly");
  const data = range === "Weekly" ? weeklyRevenue : monthlyRevenue;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analytics overview</p>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
              <Icon size={14} />
              {label}
            </div>
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
            <div className="text-xs text-gray-400 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-900">Revenue</h2>
          <div className="flex gap-1">
            {(["Weekly", "Monthly"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  range === r
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barCategoryGap="30%">
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip
              formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === data.length - 1 ? "#111827" : "#e5e7eb"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Orders trend */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Orders this week</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={orderTrend}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <Tooltip
                formatter={(v) => [Number(v), "Orders"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#111827"
                strokeWidth={2}
                dot={{ fill: "#111827", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top items */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Top selling items</h2>
          <div className="space-y-3">
            {topItems.map((item, i) => {
              const pct = Math.round((item.sold / topItems[0].sold) * 100);
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4 text-center">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-900">{item.name}</span>
                      <span className="text-xs text-gray-400">{item.sold} sold</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}