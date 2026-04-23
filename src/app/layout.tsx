import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script"; 
import EmotionCache from "./EmotionCache";
import { AuthProvider } from "../context/AuthContext"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MesaSegura",
  description: "Reservá tu mesa en los mejores restaurantes",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Script de Google Identity Services */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive" 
        />
      </head>
      <body className={inter.className}>
        <EmotionCache>
          <AuthProvider>   
            {children}
          </AuthProvider>
        </EmotionCache>
      </body>
    </html>
  );
}