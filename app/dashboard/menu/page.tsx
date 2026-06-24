"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
}

const categories = ["Starters", "Mains", "Drinks", "Desserts", "Snacks", "Other"];
const emptyForm = { name: "", category: "Mains", price: "", description: "" };

export default function DashboardMenuPage() {
  const { user } = useAuth();
  const [shopId, setShopId] = useState<string | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchShopAndMenu();
  }, [user]);

  const fetchShopAndMenu = async () => {
    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user!.id)
      .single();

    if (shop) {
      setShopId(shop.id);
      const { data: menuData } = await supabase
        .from("menu_items")
        .select("*")
        .eq("shop_id", shop.id)
        .order("category");
      if (menuData) setItems(menuData);
    }
    setLoading(false);
  };

  const allCategories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = activeCategory === "All"
    ? items
    : items.filter((i) => i.category === activeCategory);

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, price: String(item.price), description: item.description });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name || !form.price || !shopId) return;
    setSaving(true);

    if (editItem) {
      await supabase.from("menu_items").update({
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        description: form.description,
      }).eq("id", editItem.id);
    } else {
      await supabase.from("menu_items").insert({
        shop_id: shopId,
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        description: form.description,
        available: true,
      });
    }

    setShowModal(false);
    setSaving(false);
    fetchShopAndMenu();
  };

  const remove = async (id: string) => {
    await supabase.from("menu_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggle = async (id: string, current: boolean) => {
    await supabase.from("menu_items").update({ available: !current }).eq("id", id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, available: !current } : i));
  };

  if (loading) return <div className="text-sm text-gray-400">Loading menu...</div>;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Menu</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {items.length} items · {items.filter((i) => !i.available).length} unavailable
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus size={15} />
          Add Item
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {allCategories.map((cat) => (
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

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-sm text-gray-400 mb-3">No menu items yet</p>
          <button
            onClick={openAdd}
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Add your first item
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`bg-white border rounded-2xl p-4 space-y-3 transition-opacity ${
              item.available ? "border-gray-200" : "border-gray-100 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900 shrink-0">
                ${item.price.toFixed(2)}
              </span>
            </div>

            {item.description && (
              <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={() => toggle(item.id, item.available)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  item.available ? "text-green-600 hover:text-gray-500" : "text-gray-400 hover:text-green-600"
                }`}
              >
                {item.available ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                {item.available ? "Available" : "Unavailable"}
              </button>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-gray-700 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                {editItem ? "Edit item" : "Add item"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Grilled Salmon"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
                >
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Price ($)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of the item"
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : editItem ? "Save changes" : "Add item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}