import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { SocketProvider } from "@/contexts/SocketContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ServiLocal — Servicios locales de confianza",
  description:
    "Conecta con proveedores verificados en tu zona. Barra de confianza, historial real y negociación directa. Tu plataforma de servicios locales.",
  keywords: ["servicios locales", "proveedores", "confianza", "ServiLocal"],
  authors: [{ name: "ServiLocal" }],
  openGraph: {
    title: "ServiLocal — Servicios locales de confianza",
    description: "Conecta con proveedores verificados en tu zona.",
    type: "website",
  },
};

import { ThemeProvider } from "@/components/ui/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[var(--sl-bg)] antialiased">
        <ThemeProvider>
          <SocketProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
