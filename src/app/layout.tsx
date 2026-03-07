import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Rentigo - Rent Anything From People Nearby",
    template: "%s | Rentigo",
  },
  description:
    "Peer-to-peer rental marketplace. Rent tools, cameras, sports equipment, and more from people in your neighborhood. Save money, reduce waste, promote sustainability.",
  keywords: [
    "rental marketplace",
    "peer to peer rental",
    "rent items",
    "sharing economy",
    "circular economy",
    "sustainable",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Rentigo",
    title: "Rentigo - Rent Anything From People Nearby",
    description:
      "Peer-to-peer rental marketplace. Rent tools, cameras, sports equipment, and more from people in your neighborhood.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rentigo - Rent Anything From People Nearby",
    description:
      "Peer-to-peer rental marketplace. Rent tools, cameras, sports equipment, and more from people in your neighborhood.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
