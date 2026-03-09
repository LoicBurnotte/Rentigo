"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Leaf } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
                R
              </div>
              <span className="text-lg font-bold text-gray-900">Rentigo</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              {t("tagline")}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-sm text-emerald-600">
              <Leaf size={14} />
              <span>{t("circularEconomy")}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t("marketplace")}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/marketplace"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  {t("browseItems")}
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  {t("mapView")}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=tools"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  {t("tools")}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=electronics"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  {t("electronics")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t("forOwners")}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/items/new"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  {t("listAnItem")}
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  {t("yourProfile")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {t("sustainability")}
            </h3>
            <p className="mt-3 text-sm text-gray-500">
              {t("sustainabilityText")}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
