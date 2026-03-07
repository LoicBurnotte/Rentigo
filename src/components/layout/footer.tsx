import Link from "next/link";
import { Leaf } from "lucide-react";

export function Footer() {
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
              Rent anything from people nearby. Promote reuse, save money, and
              help the planet.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-sm text-emerald-600">
              <Leaf size={14} />
              <span>Promoting circular economy</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Marketplace</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/marketplace"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Browse Items
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Map View
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=tools"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=electronics"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Electronics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">For Owners</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/items/new"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  List an Item
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Your Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Sustainability
            </h3>
            <p className="mt-3 text-sm text-gray-500">
              Every rental prevents an unnecessary purchase. Together, we reduce
              waste and build a more sustainable future through sharing.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Rentigo. All rights reserved.
            Built for a sustainable future.
          </p>
        </div>
      </div>
    </footer>
  );
}
