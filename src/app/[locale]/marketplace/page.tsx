"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { SearchFilters } from "@/components/search/search-filters";
import { ItemGrid } from "@/components/items/item-grid";
import { useItems } from "@/hooks/use-items";
import type { SearchFilters as SearchFiltersType } from "@/types";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const t = useTranslations("marketplace");

  const filters: SearchFiltersType = {
    query: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
    city: searchParams.get("city") || undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
  };

  const { data: items, isLoading } = useItems(filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("title")}
        </h1>
        <p className="mt-2 text-gray-500">
          {t("subtitle")}
        </p>
      </div>

      <SearchFilters />

      <div className="mt-8">
        <ItemGrid items={items} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense>
      <MarketplaceContent />
    </Suspense>
  );
}
