import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar Contraseña - Template Next.js + FastAPI",
  description: "Recupera tu contraseña si la olvidaste",
};

export default function PasswordRecoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
