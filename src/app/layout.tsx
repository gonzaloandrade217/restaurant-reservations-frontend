import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import EmotionCache from "./EmotionCache";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reserva Restaurante",
  description: "App para reservas de restaurantes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <EmotionCache>
          {children}
        </EmotionCache>
      </body>
    </html>
  );
}