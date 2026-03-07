"use client";

import dynamic from "next/dynamic";
import { useItems } from "@/hooks/use-items";
import { PageLoading } from "@/components/ui/loading";

const MapView = dynamic(
  () => import("@/components/map/map-view").then((mod) => mod.MapView),
  { ssr: false, loading: () => <PageLoading /> }
);

export default function MapPage() {
  const { data: items, isLoading } = useItems();

  if (isLoading) return <PageLoading />;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Items Near You
        </h1>
        <p className="text-sm text-gray-500">
          {items?.length || 0} items available on the map
        </p>
      </div>
      <div className="flex-1">
        <MapView items={items || []} />
      </div>
    </div>
  );
}
