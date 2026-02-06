import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Restablecer Contraseña - Template Next.js + FastAPI",
	description: "Establece una nueva contraseña para tu cuenta",
};

export default function PasswordRecoveryConfirmLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
