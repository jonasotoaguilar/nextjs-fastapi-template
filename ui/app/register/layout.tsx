import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta - Template Next.js + FastAPI",
  description:
    "Regístrate para obtener una cuenta y acceder a todas las funcionalidades del sistema",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
