"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = async () => {
  setError("");
  setLoading(true);

  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password,
  });

  if (signInError || !data.user) {
    setError(signInError?.message ?? "Login failed");
    setLoading(false);
    return;
  }

  // Keep retrying until profile loads (max 5 tries)
  let profile = null;
  for (let i = 0; i < 5; i++) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileData?.role) {
      profile = profileData;
      break;
    }

    // Wait 500ms before retrying
    await new Promise((res) => setTimeout(res, 500));
  }

  if (profile?.role === "shop_owner") {
    router.push("/dashboard");
  } else {
    router.push("/shops");
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="text-center">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your SwiftBite account</p>
        </div>

        {/* Form */}
        <div className="space-y-3">
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
                onKeyDown={(e) => e.key === "Enter" && login()}
                placeholder="••••••••"
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

        {error && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="space-y-2 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-gray-900 font-medium hover:underline">
              Sign up
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            Own a restaurant?{" "}
            <Link href="/signup?role=shop_owner" className="text-gray-900 font-medium hover:underline">
              Open your shop
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}