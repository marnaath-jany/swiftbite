import Link from "next/link";
import { ShoppingBag, Store, Zap, Star, Clock, MapPin } from "lucide-react";

const features = [
  { icon: ShoppingBag, title: "Easy ordering", desc: "Browse menus, add to cart and checkout in minutes from any device." },
  { icon: Store, title: "Local shops", desc: "Support small businesses and restaurants in your neighbourhood." },
  { icon: Zap, title: "Fast delivery", desc: "Real-time order tracking from the moment you place your order." },
  { icon: Clock, title: "Always open", desc: "Order any time of day. Shops set their own hours and availability." },
  { icon: MapPin, title: "Find nearby", desc: "Discover the best local food spots delivering straight to you." },
  { icon: Star, title: "Quality first", desc: "Every shop is verified and rated by real customers like you." },
];

const steps = [
  { num: "01", title: "Browse shops", desc: "Find local restaurants and shops near you." },
  { num: "02", title: "Pick your food", desc: "Add items to your cart from any shop's menu." },
  { num: "03", title: "Place your order", desc: "Checkout in seconds with your delivery address." },
  { num: "04", title: "Track live", desc: "Watch your order status update in real time." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-gray-900">SwiftBite</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
          <Link href="/shops" className="hover:text-gray-900 transition-colors">Browse shops</Link>
          <Link href="/signup?role=shop_owner" className="hover:text-gray-900 transition-colors">Sell on SwiftBite</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
            Sign in
          </Link>
          <Link href="/shops" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Order now
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center px-6 py-20 sm:py-28 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Now live in Kigali, Rwanda
        </div>
        <h1 className="text-4xl sm:text-6xl font-semibold text-gray-900 leading-tight mb-6">
          Local food,<br />delivered fast
        </h1>
        <p className="text-gray-500 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
          Order from the best local shops and restaurants. Fresh food delivered straight to your door.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shops" className="bg-gray-900 text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
            Browse shops
          </Link>
          <Link href="/signup?role=shop_owner" className="border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Open your shop — it&apos;s free
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-50 px-6 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="bg-white rounded-2xl p-5 space-y-3 border border-gray-100">
                <span className="text-3xl font-bold text-gray-100">{step.num}</span>
                <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 py-16 sm:py-20 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-12">
          Everything you need
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-50 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <Icon size={18} className="text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* For shop owners */}
      <div className="bg-black text-white px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-semibold">Own a shop or restaurant?</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            Join SwiftBite and start reaching more customers today. Set up your shop in minutes — completely free.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mt-8">
            {[
              { title: "Free to join", desc: "No setup fees or monthly charges to get started." },
              { title: "Your own menu", desc: "Add, edit and manage your items any time." },
              { title: "Live orders", desc: "Get notified instantly when a new order comes in." },
            ].map((item) => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link
            href="/signup?role=shop_owner"
            className="inline-block bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors mt-4"
          >
            Open your shop for free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-10 border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-sm font-medium text-gray-900">SwiftBite</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/shops" className="hover:text-gray-900 transition-colors">Browse shops</Link>
            <Link href="/signup" className="hover:text-gray-900 transition-colors">Sign up</Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">Sign in</Link>
            <Link href="/signup?role=shop_owner" className="hover:text-gray-900 transition-colors">Open a shop</Link>
          </div>
          <p className="text-xs text-gray-400">© 2026 SwiftBite. All rights reserved.</p>
        </div>
      </div>

    </div>
  );
}