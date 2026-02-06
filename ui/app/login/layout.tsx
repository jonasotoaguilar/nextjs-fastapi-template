import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Iniciar Sesión - Template Next.js + FastAPI",
	description: "Inicia sesión en tu cuenta para acceder a todas las funcionalidades del sistema",
};

export default function LoginLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
