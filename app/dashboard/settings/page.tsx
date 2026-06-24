"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Save, Check } from "lucide-react";

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  delivery_fee: number;
  min_order: number;
  is_open: boolean;
}

export default function DashboardSettingsPage() {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    delivery_fee: "",
    min_order: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) fetchShop();
  }, [user]);

  const fetchShop = async () => {
    const { data } = await supabase
      .from("shops")
      .select("*")
      .eq("owner_id", user!.id)
      .single();

    if (data) {
      setShop(data);
      setForm({
        name: data.name ?? "",
        description: data.description ?? "",
        address: data.address ?? "",
        phone: data.phone ?? "",
        delivery_fee: String(data.delivery_fee ?? ""),
        min_order: String(data.min_order ?? ""),
      });
    }
    setLoading(false);
  };

  const save = async () => {
    if (!shop) return;
    setSaving(true);

    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const { error } = await supabase
      .from("shops")
      .update({
        name: form.name,
        slug,
        description: form.description,
        address: form.address,
        phone: form.phone,
        delivery_fee: parseFloat(form.delivery_fee),
        min_order: parseFloat(form.min_order),
      })
      .eq("id", shop.id);

    setSaving(false);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      fetchShop();
    }
  };

  if (loading) return <div className="text-sm text-gray-400">Loading...</div>;
  if (!shop) return <div className="text-sm text-gray-400">No shop found.</div>;

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Shop settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update your shop info</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors ${
            saved
              ? "bg-green-600 text-white"
              : "bg-gray-900 text-white hover:bg-gray-700"
          } disabled:opacity-50`}
        >
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? "Saved!" : saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {/* Shop info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-medium text-gray-900">Shop info</h2>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Shop name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Mama's Kitchen"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Tell customers what you sell, your speciality, cuisine type..."
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{form.description.length} characters</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="e.g. KG 123 St, Kigali"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Phone number</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+250 700 000 000"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
          />
        </div>
      </div>

      {/* Delivery settings */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-medium text-gray-900">Delivery settings</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Delivery fee ($)</label>
            <input
              type="number"
              value={form.delivery_fee}
              onChange={(e) => setForm({ ...form, delivery_fee: e.target.value })}
              placeholder="2.00"
              min="0"
              step="0.50"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min. order ($)</label>
            <input
              type="number"
              value={form.min_order}
              onChange={(e) => setForm({ ...form, min_order: e.target.value })}
              placeholder="5.00"
              min="0"
              step="0.50"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Shop URL */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2">
        <h2 className="text-sm font-medium text-gray-900">Your shop link</h2>
        <p className="text-xs text-gray-400">Share this link with your customers</p>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
          <span className="text-sm text-gray-400">swiftbite.com/shops/</span>
          <span className="text-sm font-medium text-gray-900">{shop.slug}</span>
        </div>
        <button
          onClick={() => window.open("/shops/" + shop.slug, "_blank")}
          className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-2 transition-colors"
        >
          Preview your shop page
        </button>
      </div>

    </div>
  );
}