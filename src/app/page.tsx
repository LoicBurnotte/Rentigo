"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Leaf,
  Shield,
  MapPin,
  ArrowRight,
  Wrench,
  Camera,
  Mountain,
  PartyPopper,
  Laptop,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemGrid } from "@/components/items/item-grid";
import { useItems } from "@/hooks/use-items";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORY_ICONS = {
  Wrench,
  Camera,
  Mountain,
  PartyPopper,
  Laptop,
  Dumbbell,
};

const FEATURED_CATEGORIES = [
  { name: "Tools", slug: "tools", icon: "Wrench", color: "bg-orange-100 text-orange-600" },
  { name: "Cameras", slug: "cameras", icon: "Camera", color: "bg-blue-100 text-blue-600" },
  { name: "Outdoor Gear", slug: "outdoor-gear", icon: "Mountain", color: "bg-green-100 text-green-600" },
  { name: "Event Equipment", slug: "event-equipment", icon: "PartyPopper", color: "bg-purple-100 text-purple-600" },
  { name: "Electronics", slug: "electronics", icon: "Laptop", color: "bg-indigo-100 text-indigo-600" },
  { name: "Sports", slug: "sports-equipment", icon: "Dumbbell", color: "bg-red-100 text-red-600" },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: recentItems, isLoading } = useItems();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/marketplace");
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJIMjR2LTJoMTJ6bTAtNHYySDI0di0yaDEyek0yNCAyNHYyaC0ydi0yaDJ6bTQgMHYyaC0ydi0yaDJ6bTQgMHYyaC0ydi0yaDJ6bTQgMHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-emerald-100 backdrop-blur-sm">
              <Leaf size={16} />
              Promoting circular economy &amp; sustainability
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Rent anything from{" "}
              <span className="text-emerald-200">people nearby</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-emerald-100">
              Why buy when you can rent? Save money, reduce waste, and discover
              amazing items in your neighborhood.
            </p>

            <div className="mx-auto mt-10 max-w-xl">
              <div className="flex overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="relative flex-1">
                  <Search
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="What do you want to rent?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="h-14 w-full pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
                <Button
                  size="lg"
                  className="m-2 rounded-lg px-8"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Browse by Category
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {FEATURED_CATEGORIES.map((cat) => {
            const IconComponent =
              CATEGORY_ICONS[cat.icon as keyof typeof CATEGORY_ICONS];
            return (
              <motion.div
                key={cat.slug}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={`/marketplace?category=${cat.slug}`}
                  className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.color}`}
                  >
                    <IconComponent size={24} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Recent Items */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Recently Listed</h2>
          <Link
            href="/marketplace"
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <ItemGrid
          items={recentItems?.slice(0, 6)}
          isLoading={isLoading}
        />
      </section>

      {/* How It Works */}
      <section className="border-t border-gray-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            How It Works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Find what you need",
                description:
                  "Browse thousands of items available for rent in your area. Use filters to find exactly what you need.",
              },
              {
                icon: Shield,
                title: "Book securely",
                description:
                  "Reserve your item, pay securely through Stripe, and coordinate with the owner via messaging.",
              },
              {
                icon: MapPin,
                title: "Pick up nearby",
                description:
                  "Meet the owner, pick up your item, and enjoy! Return it when you're done.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <step.icon size={28} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Banner */}
      <section className="bg-emerald-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Leaf size={40} className="mx-auto text-emerald-600" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Every Rental Makes a Difference
          </h2>
          <p className="mt-4 text-gray-600">
            By renting instead of buying, you help reduce waste, lower carbon
            emissions, and promote a circular economy. Every item shared is one
            less item manufactured, packaged, and eventually discarded. Together,
            we can build a more sustainable future through the power of sharing.
          </p>
          <Link href="/marketplace">
            <Button size="lg" className="mt-8">
              Start Renting Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
