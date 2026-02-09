import { geistMono, geistSans } from "@/config/fonts";
import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Template Next.js + FastAPI",
  description:
    "Template full-stack moderno con Next.js 16 y FastAPI, ideal para comenzar proyectos web",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
