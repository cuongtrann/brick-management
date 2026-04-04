import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Quản Lý Gạch",
  description: "Hệ thống quản lý nhập hàng, công thợ và bán gạch",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quản Lý Gạch",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <main className="pb-nav scroll-smooth-mobile max-w-lg mx-auto">
            {children}
          </main>
          <BottomNav />
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
