"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    setIsOpen(false);
  };

  return (
    <>
      <nav className="bg-black text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-xs">S</span>
          </div>
          <span className="text-sm font-semibold">SwiftBite</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-4">
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

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-black z-40 flex flex-col pt-20 px-6 space-y-4 md:hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-6 text-white"
          >
            <X size={22} />
          </button>

          <Link
            href="/shops"
            onClick={() => setIsOpen(false)}
            className="text-white text-lg font-medium py-3 border-b border-white/10"
          >
            Browse shops
          </Link>

          {user ? (
            <>
              {profile?.role === "shop_owner" && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="text-white text-lg font-medium py-3 border-b border-white/10"
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="text-white text-lg font-medium py-3 border-b border-white/10"
              >
                My orders
              </Link>
              <button
                onClick={handleSignOut}
                className="text-left text-red-400 text-lg font-medium py-3"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-white text-lg font-medium py-3 border-b border-white/10"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="text-white text-lg font-medium py-3 border-b border-white/10"
              >
                Sign up
              </Link>
              <Link
                href="/signup?role=shop_owner"
                onClick={() => setIsOpen(false)}
                className="text-white text-lg font-medium py-3"
              >
                Open a shop
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}