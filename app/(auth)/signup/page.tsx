"use client";

import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isShopOwner = searchParams.get("role") === "shop_owner";

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    shop_name: "",
    shop_description: "",
    shop_address: "",
    shop_phone: "",
    delivery_fee: "2.00",
    min_order: "5.00",
  });

  const signUp = async () => {
    setError("");
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.user && data.session === null) {
      setError("Please check your email and confirm your account before signing in.");
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError("Signup failed. Please try again.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      setError("Account created but could not sign in: " + signInError.message);
      setLoading(false);
      return;
    }

    await supabase.from("profiles").upsert({
      id: userId,
      full_name: form.full_name,
      role: isShopOwner ? "shop_owner" : "customer",
    });

    if (isShopOwner) {
      const slug = slugify(form.shop_name);
      const { error: shopError } = await supabase.from("shops").insert({
        owner_id: userId,
        name: form.shop_name,
        slug,
        description: form.shop_description,
        address: form.shop_address,
        phone: form.shop_phone,
        delivery_fee: parseFloat(form.delivery_fee),
        min_order: parseFloat(form.min_order),
        is_open: true,
      });

      if (shopError) {
        setError("Account created but shop setup failed: " + shopError.message);
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } else {
      window.location.href = "/shops";
    }
  };

  const goToStep2 = () => {
    if (!form.full_name || !form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md space-y-6">

        <div className="text-center">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            {isShopOwner ? "Open your shop" : "Create an account"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isShopOwner ? "Start selling on SwiftBite" : "Order from local shops"}
          </p>
        </div>

        {isShopOwner && (
          <div className="flex gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  s <= step ? "bg-gray-900" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Full name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Your name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && (isShopOwner ? goToStep2() : signUp())}
                  placeholder="Min. 6 characters"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && isShopOwner && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Shop name</label>
              <input
                type="text"
                value={form.shop_name}
                onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
                placeholder="e.g. Mama's Kitchen"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Description</label>
              <textarea
                value={form.shop_description}
                onChange={(e) => setForm({ ...form, shop_description: e.target.value })}
                placeholder="What do you sell?"
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Address</label>
              <input
                type="text"
                value={form.shop_address}
                onChange={(e) => setForm({ ...form, shop_address: e.target.value })}
                placeholder="Shop address"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Phone</label>
              <input
                type="tel"
                value={form.shop_phone}
                onChange={(e) => setForm({ ...form, shop_phone: e.target.value })}
                placeholder="+250 700 000 000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Delivery fee ($)</label>
                <input
                  type="number"
                  value={form.delivery_fee}
                  onChange={(e) => setForm({ ...form, delivery_fee: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Min. order ($)</label>
                <input
                  type="number"
                  value={form.min_order}
                  onChange={(e) => setForm({ ...form, min_order: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="space-y-2">
          {isShopOwner && step === 1 ? (
            <button
              onClick={goToStep2}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={signUp}
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : isShopOwner ? "Open my shop" : "Create account"}
            </button>
          )}

          {isShopOwner && step === 2 && (
            <button
              onClick={() => { setStep(1); setError(""); }}
              className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
        </div>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-900 font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-400">
        Loading...
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}