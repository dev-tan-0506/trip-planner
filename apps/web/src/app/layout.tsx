import type { Metadata } from "next";
import { Be_Vietnam_Pro, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthHydration } from "../components/ui/AuthHydration";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
  weight: ["400", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const geistMono = localFont({
  src: "./../../public/fonts/GeistMonoVF.woff",
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
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${beVietnamPro.variable} ${plusJakarta.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthHydration />
        {children}
      </body>
    </html>
  );
}
