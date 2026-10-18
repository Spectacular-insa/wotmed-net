import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import DashboardLayout from "@/components/DashboardLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Wotmed-Net SOC Dashboard",
  description: "Tactical dark-mode threat operations interface for Wotmed-Net active defense system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#030712] text-slate-100">
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
