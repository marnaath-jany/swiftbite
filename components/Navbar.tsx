"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="bg-black text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
          <span className="text-black font-bold text-xs">S</span>
        </div>
        <span className="text-sm font-semibold">SwiftBite</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/shops" className="text-xs text-gray-400 hover:text-white transition-colors">
          Browse shops
        </Link>

        {user ? (
          <>
            {profile?.role === "shop_owner" && (
              <Link href="/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
            )}
            <Link href="/account" className="text-xs text-gray-400 hover:text-white transition-colors">
              My orders
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-xs text-gray-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="text-xs bg-white text-black px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}