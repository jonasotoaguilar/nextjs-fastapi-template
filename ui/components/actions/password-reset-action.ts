"use server";

import { resetForgotPassword, resetResetPassword } from "@/app/clientService";
import { passwordResetConfirmSchema } from "@/lib/definitions";
import { getErrorMessage } from "@/lib/utils";
import { redirect } from "next/navigation";

export async function passwordReset(_prevState: unknown, formData: FormData) {
	const input = {
		body: {
			email: formData.get("email") as string,
		},
	};

	try {
		const { error } = await resetForgotPassword(input);
		if (error) {
			return { server_validation_error: getErrorMessage(error) };
		}
		return {
			message: "Instrucciones de restablecimiento enviadas a tu email.",
		};
	} catch (err) {
		console.error("Password reset error:", err);
		return {
			server_error:
				"Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.",
		};
	}
}

export async function passwordResetConfirm(
	_prevState: unknown,
	formData: FormData,
) {
	const validatedFields = passwordResetConfirmSchema.safeParse({
		token: formData.get("resetToken") as string,
		password: formData.get("password") as string,
		passwordConfirm: formData.get("passwordConfirm") as string,
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	const { token, password } = validatedFields.data;
	const input = {
		body: {
			token,
			password,
		},
	};
	try {
		const { error } = await resetResetPassword(input);
		if (error) {
			return { server_validation_error: getErrorMessage(error) };
		}
		redirect(`/login`);
	} catch (err) {
		console.error("Password reset confirmation error:", err);
		return {
			server_error:
				"Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.",
		};
	}
}
