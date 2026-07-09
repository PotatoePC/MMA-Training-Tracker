import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MMA Training Tracker · 2026",
  description:
    "Apple Calendar–inspired MMA & athletic training tracker. Strength, cardio, grappling, and striking — metric only (kg, km, min/km).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`} style={{ colorScheme: "dark" }}>
      <body className="min-h-full bg-black font-sans text-zinc-100">{children}</body>
    </html>
  );
}
