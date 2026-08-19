import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Talap — Ace Cambridge Exams Without the Burnout",
  description:
    "Mock exams, real NIS grade boundaries and an AI tutor for students sitting the Cambridge International Examination (МЭСК) at Nazarbayev Intellectual Schools.",
  keywords: ["NIS", "МЭСК", "Cambridge", "Nazarbayev Intellectual Schools", "exam prep"],
};

export const viewport: Viewport = {
  themeColor: "#f3f3f3",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
