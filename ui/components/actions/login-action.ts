"use server";

import { authJwtLogin } from "@/app/clientService";
import { loginSchema } from "@/lib/definitions";
import { getErrorMessage } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(_prevState: unknown, formData: FormData) {
	const validatedFields = loginSchema.safeParse(Object.fromEntries(formData));

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

  const { email, password } = validatedFields.data;

  const input = {
    body: {
      username: email,
      password,
    },
  };

	try {
		const { data, error } = await authJwtLogin(input);
		if (error) {
			return { server_validation_error: getErrorMessage(error) };
		}
		(await cookies()).set("accessToken", data.access_token);
	} catch (err) {
		console.error("Login error:", err);
		return {
			server_error:
				"Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.",
		};
	}
	redirect("/");
}
