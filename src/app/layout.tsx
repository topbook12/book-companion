import type { Metadata } from "next";
import { Fraunces, Hind_Siliguri, Tiro_Bangla, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const tiroBangla = Tiro_Bangla({
  variable: "--font-tiro-bangla",
  subsets: ["bengali"],
  weight: ["400"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IdeaForge BD — Unlock Your Chapter Video",
  description:
    "পড়ুন আপনার বই, খুঁজে নিন অধ্যায়ের কোড, আনলক করুন এক্সক্লুসিভ ভিডিও। Read the book, find the code, unlock the video.",
  keywords: [
    "IdeaForge BD",
    "study abroad",
    "IELTS",
    "SOP",
    "scholarship",
    "Bangladesh students",
    "book companion",
    "video unlock",
  ],
  authors: [{ name: "IdeaForge BD" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "IdeaForge BD — Unlock Your Chapter Video",
    description:
      "Your printed book holds the key. Enter the chapter code to unlock the companion video.",
    siteName: "IdeaForge BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IdeaForge BD — Unlock Your Chapter Video",
    description:
      "Your printed book holds the key. Enter the chapter code to unlock the companion video.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${hindSiliguri.variable} ${tiroBangla.variable} ${geistMono.variable} font-bangla-body antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
