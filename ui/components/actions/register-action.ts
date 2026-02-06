"use server";

import { redirect } from "next/navigation";

import { registerRegister } from "@/app/clientService";

import { registerSchema } from "@/lib/definitions";
import { getErrorMessage } from "@/lib/utils";

export async function register(_prevState: unknown, formData: FormData) {
  const validatedFields = registerSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const input = {
    body: {
      email,
      password,
    },
  };
  try {
    const { error } = await registerRegister(input);
    if (error) {
      return { server_validation_error: getErrorMessage(error) };
    }
  } catch (err) {
    console.error("Registration error:", err);
    return {
      server_error:
        "Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.",
    };
  }
  redirect(`/login`);
}
