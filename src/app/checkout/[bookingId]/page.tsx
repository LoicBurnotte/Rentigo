"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ bookingId: string }>;
}

export default function CheckoutPage({ params }: Props) {
  const { bookingId } = use(params);
  const [booking, setBooking] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("bookings")
        .select("*, item:items(title, slug)")
        .eq("id", bookingId)
        .single();
      setBooking(data as Record<string, unknown> | null);
      setLoading(false);
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <XCircle size={48} className="mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Booking not found
          </h2>
          <Link href="/marketplace">
            <Button className="mt-4">Browse Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.status === "confirmed";
  const item = booking.item as { title: string; slug: string } | null;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {isConfirmed ? (
          <CheckCircle size={64} className="mx-auto text-emerald-500" />
        ) : (
          <Loader2 size={64} className="mx-auto animate-spin text-yellow-500" />
        )}
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          {isConfirmed ? "Booking Confirmed!" : "Payment Processing"}
        </h1>
        <p className="mt-2 text-gray-500">
          {isConfirmed
            ? "Your rental has been confirmed. Contact the owner to arrange pickup."
            : "Your payment is being processed. This page will update automatically."}
        </p>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
          <h3 className="font-semibold text-gray-900">{item?.title}</h3>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Dates</span>
              <span>
                {formatDate(booking.start_date as string)} - {formatDate(booking.end_date as string)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2">
              <span className="font-medium">Total</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(booking.total_price as number)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {item?.slug && (
            <Link href={`/items/${item.slug}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Item
              </Button>
            </Link>
          )}
          <Link href="/profile" className="flex-1">
            <Button className="w-full">View Bookings</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
