import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Template Next.js + FastAPI",
  description: "Template full-stack moderno con Next.js 16 y FastAPI, ideal para comenzar proyectos web",
  keywords: "Next.js, FastAPI, TypeScript, full-stack, template, React",
  authors: [{ name: "Jonas Oto Aguilar" }],
  openGraph: {
    title: "Template Next.js + FastAPI",
    description: "Template full-stack moderno con Next.js 16 y FastAPI",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
