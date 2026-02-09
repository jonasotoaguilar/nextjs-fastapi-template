import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .refine((password) => /[A-Z]/.test(password), {
    message: "La contraseña debe contener al menos una letra mayúscula.",
  })
  .refine((password) => /[!@#$%^&*(),.?":{}|<>_-]/.test(password), {
    message:
      "La contraseña debe contener al menos un carácter especial (ej. !@#$%^&*()_-).",
  });

export const passwordResetSchema = z.object({
  email: z.string().email({ message: "Ingresa un email válido" }),
});

export const passwordResetConfirmSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string(),
    token: z.string({ message: "El token es obligatorio" }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Las contraseñas no coinciden.",
    path: ["passwordConfirm"],
  });

export const registerSchema = z
  .object({
    email: z.string().email({ message: "Dirección de email inválida" }),
    password: passwordSchema,
    passwordConfirm: z
      .string()
      .min(1, "La confirmación de contraseña es obligatoria."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Las contraseñas no coinciden.",
    path: ["passwordConfirm"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "El email es obligatorio" })
    .email({ message: "Ingresa un email válido" }),
  password: z
    .string()
    .trim()
    .min(1, { message: "La contraseña es obligatoria" }),
});

export const itemSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  quantity: z
    .string()
    .min(1, { message: "Quantity is required" })
    .transform((val) => parseInt(val, 10)) // Convert to integer
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "Quantity must be a positive integer",
    }),
});
