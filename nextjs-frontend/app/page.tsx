import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6">
          Bienvenido al Template Next.js &amp; FastAPI
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
          Un template simple y potente para comenzar con desarrollo full-stack
          usando Next.js y FastAPI.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link href="/login">
            <Button className="px-8 py-4 text-lg font-semibold rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 focus:ring-4 focus:ring-blue-300 transition-all duration-200">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/register">
            <Button
              variant="outline"
              className="px-8 py-4 text-lg font-semibold rounded-full shadow-md border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              Registrarse
            </Button>
          </Link>
        </div>

        {/* GitHub Badge */}
        <div className="mt-6">
          <Badge
            variant="outline"
            className="text-sm inline-flex items-center gap-2 px-4 py-2 rounded-lg border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
          >
            <FaGithub className="w-5 h-5 text-black dark:text-white" />
            <Link
              href="https://github.com/vintasoftware/nextjs-fastapi-template"
              target="_blank"
              className="hover:underline"
            >
              Ver en GitHub
            </Link>
          </Badge>
        </div>
      </div>
    </main>
  );
}
