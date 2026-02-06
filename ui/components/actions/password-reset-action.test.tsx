import { resetForgotPassword, resetResetPassword } from "@/app/clientService";
import { redirect } from "next/navigation";
import { type Mock, vi } from "vitest";
import { passwordReset, passwordResetConfirm } from "./password-reset-action";

vi.mock("next/navigation", () => ({
	redirect: vi.fn(),
}));

vi.mock("@/app/clientService", () => ({
	resetForgotPassword: vi.fn(),
	resetResetPassword: vi.fn(),
}));

describe("passwordReset action", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("passwordReset", () => {
		it("should call resetForgotPassword with the correct input and return success message", async () => {
			const formData = new FormData();
			formData.set("email", "testuser@example.com");
			// Mock a successful password reset
			(resetForgotPassword as Mock).mockResolvedValue({});

			const result = await passwordReset({}, formData);

			expect(resetForgotPassword).toHaveBeenCalledWith({
				body: { email: "testuser@example.com" },
			});
			expect(result).toEqual({
				message: "Instrucciones de restablecimiento enviadas a tu email.",
			});
		});

		it("should return a server validation error if the server call fails", async () => {
			const formData = new FormData();
			formData.set("email", "testuser@example.com");

			// Mock a failed password reset
			(resetForgotPassword as Mock).mockResolvedValue({
				error: { detail: "User not found" },
			});

			const result = await passwordReset({}, formData);

			expect(result).toEqual({ server_validation_error: "User not found" });
			expect(resetForgotPassword).toHaveBeenCalledWith({
				body: { email: "testuser@example.com" },
			});
		});

		it("should handle unexpected errors and return server error message", async () => {
			// Mock the resetForgotPassword to throw an error
			const mockError = new Error("Network error");
			(resetForgotPassword as Mock).mockRejectedValue(mockError);

			const formData = new FormData();
			formData.append("email", "testuser@example.com");

			const result = await passwordReset(undefined, formData);

			expect(result).toEqual({
				server_error:
					"Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.",
			});
		});
	});

	describe("passwordResetConfirm", () => {
		it("should call resetPassword with the correct input", async () => {
			const formData = new FormData();
			formData.set("resetToken", "token");
			formData.set("password", "P12345678#");
			formData.set("passwordConfirm", "P12345678#");
			// Mock a successful password reset confirm
			(resetResetPassword as Mock).mockResolvedValue({});

			await passwordResetConfirm({}, formData);

			expect(resetResetPassword).toHaveBeenCalledWith({
				body: { token: "token", password: "P12345678#" },
			});
			expect(redirect).toHaveBeenCalled();
		});

		it("should return an error message if password reset fails", async () => {
			const formData = new FormData();
			formData.set("resetToken", "invalid_token");
			formData.set("password", "P12345678#");
			formData.set("passwordConfirm", "P12345678#");

			// Mock a failed password reset
			(resetResetPassword as Mock).mockResolvedValue({
				error: { detail: "Invalid token" },
			});

			const result = await passwordResetConfirm(undefined, formData);

			expect(result).toEqual({ server_validation_error: "Invalid token" });
			expect(resetResetPassword).toHaveBeenCalledWith({
				body: { token: "invalid_token", password: "P12345678#" },
			});
		});

		it("should return an validation error if passwords are invalid and don't match", async () => {
			const formData = new FormData();
			formData.set("resetToken", "token");
			formData.set("password", "12345678#");
			formData.set("passwordConfirm", "45678#");

			const result = await passwordResetConfirm(undefined, formData);

			expect(result).toEqual({
				errors: {
					password: [
						"La contraseña debe contener al menos una letra mayúscula.",
					],
					passwordConfirm: ["Las contraseñas no coinciden."],
				},
			});
			expect(resetResetPassword).not.toHaveBeenCalled();
		});

		it("should handle unexpected errors and return server error message", async () => {
			// Mock the resetResetPassword to throw an error
			const mockError = new Error("Network error");
			(resetResetPassword as Mock).mockRejectedValue(mockError);

			const formData = new FormData();
			formData.append("resetToken", "token");
			formData.append("password", "P12345678#");
			formData.append("passwordConfirm", "P12345678#");

			const result = await passwordResetConfirm(undefined, formData);

			expect(result).toEqual({
				server_error:
					"Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.",
			});
		});
	});
});
