"use client";

import { ItemCard } from "./item-card";
import { ItemCardSkeleton } from "@/components/ui/loading";
import type { ItemWithOwner } from "@/types";

interface ItemGridProps {
  items?: ItemWithOwner[];
  isLoading?: boolean;
}

export function ItemGrid({ items, isLoading }: ItemGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-500">No items found</p>
        <p className="mt-1 text-sm text-gray-400">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
