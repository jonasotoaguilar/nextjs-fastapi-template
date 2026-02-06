import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio - Template Next.js + FastAPI",
  description: "Página principal del template full-stack con Next.js y FastAPI",
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-50 via-gray-50 to-gray-100 dark:from-blue-950/20 dark:via-gray-950 dark:to-gray-900 p-8">
      <div className="text-center max-w-3xl space-y-12">
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Bienvenido al Template Next.js &amp; FastAPI
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Un template simple y potente para comenzar con desarrollo full-stack
            usando Next.js y FastAPI.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in slide-in-from-bottom-4 duration-500 delay-100">
          <Link href="/login">
            <Button className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-all hover:scale-105 active:scale-[0.98]">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/register">
            <Button
              variant="outline"
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-xl shadow-md border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-105 active:scale-[0.98]"
            >
              Registrarse
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
