import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password should be at least 8 characters.") // Minimum length validation
  .refine((password) => /[A-Z]/.test(password), {
    error: "Password should contain at least one uppercase letter.",
  }) // At least one uppercase letter
  .refine((password) => /[!@#$%^&*(),.?":{}|<>]/.test(password), {
    error: "Password should contain at least one special character.",
  });

export const passwordResetConfirmSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string(),
    token: z.string({ error: "Token is required" }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    error: "Passwords must match.",
    path: ["passwordConfirm"],
  });

export const registerSchema = z.object({
  password: passwordSchema,
  email: z.string().email({ error: "Invalid email address" }),
});

export const loginSchema = z.object({
  password: z.string().min(1, { error: "Password is required" }),
  username: z.string().min(1, { error: "Username is required" }),
});

export const itemSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  description: z.string().min(1, { error: "Description is required" }),
  quantity: z
    .string()
    .min(1, { error: "Quantity is required" })
    .transform((val) => parseInt(val, 10)) // Convert to integer
    .refine((val) => Number.isInteger(val) && val > 0, {
      error: "Quantity must be a positive integer",
    }),
});
