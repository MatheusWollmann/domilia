// src/app/layout.tsx
import type { Metadata } from "next";
import { ReactNode } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Domilia - Seu lar, sincronizado",
  description: "Gerenciamento domiciliar inteligente: finanças, tarefas e mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 dark:bg-gray-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
