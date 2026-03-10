"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Heart, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/use-favorites";
import type { ItemWithOwner } from "@/types";

interface ItemCardProps {
  item: ItemWithOwner;
}

export function ItemCard({ item }: ItemCardProps) {
  const { user } = useAuth();
  const { data: favoriteIds } = useFavoriteIds(user?.id);
  const toggleFavorite = useToggleFavorite();
  const isFavorited = favoriteIds?.has(item.id) ?? false;
  const tc = useTranslations("common");

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleFavorite.mutate({
      itemId: item.id,
      userId: user.id,
      isFavorited,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/items/${item.slug}`}
        className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {item.images?.[0] ? (
            <Image
              src={getImageUrl(item.images[0])}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No image
            </div>
          )}
          {user && (
            <button
              onClick={handleToggleFavorite}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white"
            >
              <Heart
                size={16}
                className={
                  isFavorited
                    ? "fill-red-500 text-red-500"
                    : "text-gray-600"
                }
              />
            </button>
          )}
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
              {item.category?.name}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {item.title}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} />
            <span>{item.city}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-bold text-emerald-600">
              {formatCurrency(item.price_per_day)}
              <span className="text-sm font-normal text-gray-500">{tc("perDay")}</span>
            </span>
            <span className="text-sm text-gray-500">
              {tc("by")} {item.owner?.name}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
