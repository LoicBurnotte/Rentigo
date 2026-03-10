"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import { useFavorites } from "@/hooks/use-favorites";
import { ItemGrid } from "@/components/items/item-grid";
import { PageLoading } from "@/components/ui/loading";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const { data: favorites, isLoading } = useFavorites(user?.id);
  const t = useTranslations("favorites");
  const tc = useTranslations("common");

  if (loading) return <PageLoading />;

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Heart size={48} className="mx-auto text-gray-300" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            {t("signInPrompt")}
          </h2>
          <Link href="/auth/login">
            <Button className="mt-4">{tc("signIn")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
      <p className="mt-2 text-gray-500">{t("subtitle")}</p>

      <div className="mt-8">
        <ItemGrid items={favorites} isLoading={isLoading} />
      </div>
    </div>
  );
}
