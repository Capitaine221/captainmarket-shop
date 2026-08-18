import type { Metadata } from "next";
import { Poppins, Work_Sans } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CaptainMarket",
  description: "Rare Fashion. Verified Authentic. — Streetwear, sneakers, accessoires et fragrances authentifiés.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${poppins.variable} ${workSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ink text-cream">{children}</body>
    </html>
  );
}
