import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AdSlot } from "@/components/ads/ad-slot";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Providers } from "@/components/layout/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineTrake | Upcoming movie tracker",
  description:
    "Discover upcoming movies, track release countdowns, and save the films you are excited about with CineTrake.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>
          <Header />
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <AdSlot label="Top ad" />
          </div>
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
