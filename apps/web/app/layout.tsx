import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthHydration } from "../src/components/ui/AuthHydration";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Mình Đi Đâu Thế - Trip Planner",
  description: "Dễ dàng lên kèo, phân chia chi phí, chốt lịch trình chỉ trong 1 nốt nhạc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <AuthHydration />
        {children}
      </body>
    </html>
  );
}
