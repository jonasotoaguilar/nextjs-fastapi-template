import type {
	AuthJwtLoginError,
	RegisterRegisterError,
} from "@/app/clientService";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getErrorMessage(
	error: RegisterRegisterError | AuthJwtLoginError,
): string {
	let errorMessage =
		"Ocurrió un error inesperado. Por favor, intenta de nuevo.";

	if (typeof error.detail === "string") {
		errorMessage = error.detail;
	} else if (typeof error.detail === "object" && error.detail !== null) {
		if ("reason" in error.detail) {
			const reason = (error.detail as any).reason;
			errorMessage = Array.isArray(reason) ? reason[0] : reason;
		} else if ("message" in error.detail) {
			errorMessage = (error.detail as any).message;
		}
	}

	// Traducciones de errores comunes de FastAPI Users y mensajes custom del backend
	const errorTranslations: Record<string, string> = {
		REGISTER_USER_ALREADY_EXISTS: "Ya existe un usuario con este email.",
		LOGIN_BAD_CREDENTIALS: "Email o contraseña incorrectos.",
		LOGIN_USER_NOT_VERIFIED: "Tu cuenta aún no ha sido verificada.",
		LOGIN_USER_INACTIVE: "Tu cuenta ha sido desactivada.",
		RESET_PASSWORD_BAD_TOKEN:
			"El enlace de recuperación es inválido o ha expirado.",
		RESET_PASSWORD_INVALID_TOKEN:
			"El enlace de recuperación es inválido o ha expirado.",
		VERIFY_USER_BAD_TOKEN:
			"El enlace de verificación es inválido o ha expirado.",
		VERIFY_USER_INVALID_TOKEN:
			"El enlace de verificación es inválido o ha expirado.",
		FORGOT_PASSWORD_BAD_EMAIL: "No existe una cuenta con este email.",
		USER_NOT_FOUND: "No existe una cuenta con este email.",
		INVALID_PASSWORD: "La contraseña es incorrecta.",
		PASSWORD_TOO_SHORT: "La contraseña debe tener al menos 8 caracteres.",
		PASSWORD_TOO_WEAK: "La contraseña es muy débil.",
		"Password should be at least 8 characters.":
			"La contraseña debe tener al menos 8 caracteres.",
		"Password should contain at least one uppercase letter.":
			"La contraseña debe contener al menos una letra mayúscula.",
		"Password should contain at least one special character.":
			"La contraseña debe contener al menos un carácter especial.",
		"Password should not contain e-mail.":
			"La contraseña no debe contener tu email.",
	};

	const translated = errorTranslations[errorMessage];
	return translated || errorMessage || "Ocurrió un error inesperado.";
}
