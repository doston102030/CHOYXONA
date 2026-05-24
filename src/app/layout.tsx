import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AppInit } from "@/components/AppInit";

export const metadata: Metadata = {
  title: "Sohil Choyxona — POS",
  description: "Sohil choyxonasi uchun zakaz va hisob-kitob tizimi",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B0F14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0B0F14] text-[#E2E8F0] min-h-screen">
        <AppInit />
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "#1A1F2B",
              border: "1px solid #273244",
              color: "#E2E8F0",
            },
          }}
        />
      </body>
    </html>
  );
}
