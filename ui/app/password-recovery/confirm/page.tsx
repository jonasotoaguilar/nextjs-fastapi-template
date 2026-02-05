"use client";

import { notFound, useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { passwordResetConfirm } from "@/components/actions/password-reset-action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError, FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submitButton";

function ResetPasswordForm() {
  const [state, dispatch] = useActionState(passwordResetConfirm, undefined);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    notFound();
  }

  return (
    <form action={dispatch}>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Restablecer Contraseña</CardTitle>
          <CardDescription>
            Ingresá tu nueva contraseña y confirmála.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <FieldError state={state} field="password" />
          <div className="grid gap-2">
            <Label htmlFor="passwordConfirm">Confirmar Contraseña</Label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              required
            />
          </div>
          <FieldError state={state} field="passwordConfirm" />
          <input
            type="hidden"
            id="resetToken"
            name="resetToken"
            value={token}
            readOnly
          />
          <SubmitButton text={"Enviar"} />
          <FormError state={state} />
        </CardContent>
      </Card>
    </form>
  );
}

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Suspense fallback={<div>Cargando formulario...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
