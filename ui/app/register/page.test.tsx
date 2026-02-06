import { register } from "@/components/actions/register-action";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type Mock, vi } from "vitest";
import Page from "./page";

vi.mock("@/components/actions/register-action", () => ({
	register: vi.fn(),
}));

describe("Register Page", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("renders the form with email and password input and submit button", () => {
		render(<Page />);

		expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /registrarse/i }),
		).toBeInTheDocument();
	});

	it("displays success message on successful form submission", async () => {
		(register as Mock).mockResolvedValue({});

		render(<Page />);

		const emailInput = screen.getByLabelText(/^email$/i);
		const passwordInput = screen.getByLabelText(/^contraseña$/i);
		const confirmInput = screen.getByLabelText(/confirmar contraseña/i);
		const submitButton = screen.getByRole("button", { name: /registrarse/i });

		fireEvent.change(emailInput, { target: { value: "testuser@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "Password123!" } });
		fireEvent.change(confirmInput, { target: { value: "Password123!" } });

		// RHF might need blur events to trigger validation properly in some modes
		fireEvent.blur(emailInput);
		fireEvent.blur(passwordInput);
		fireEvent.blur(confirmInput);

		fireEvent.click(submitButton);

		await waitFor(
			() => {
				expect(register).toHaveBeenCalled();
			},
			{ timeout: 2000 },
		);
	});

	it("displays server validation error if register fails", async () => {
		(register as Mock).mockResolvedValue({
			server_validation_error: "Ya existe un usuario con este email.",
		});

		render(<Page />);

		const emailInput = screen.getByLabelText(/^email$/i);
		const passwordInput = screen.getByLabelText(/^contraseña$/i);
		const confirmInput = screen.getByLabelText(/confirmar contraseña/i);
		const submitButton = screen.getByRole("button", { name: /registrarse/i });

		fireEvent.change(emailInput, { target: { value: "already@already.com" } });
		fireEvent.change(passwordInput, { target: { value: "Password123!" } });
		fireEvent.change(confirmInput, { target: { value: "Password123!" } });
		fireEvent.click(submitButton);

		expect(
			await screen.findByText(/ya existe un usuario con este email/i),
		).toBeInTheDocument();
	});

	it("displays server error for unexpected errors", async () => {
		(register as Mock).mockResolvedValue({
			server_error:
				"Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.",
		});

		render(<Page />);

		const emailInput = screen.getByLabelText(/^email$/i);
		const passwordInput = screen.getByLabelText(/^contraseña$/i);
		const confirmInput = screen.getByLabelText(/confirmar contraseña/i);
		const submitButton = screen.getByRole("button", { name: /registrarse/i });

		fireEvent.change(emailInput, { target: { value: "test@test.com" } });
		fireEvent.change(passwordInput, { target: { value: "Password123!" } });
		fireEvent.change(confirmInput, { target: { value: "Password123!" } });
		fireEvent.click(submitButton);

		expect(
			await screen.findByText(/ocurrió un error inesperado/i),
		).toBeInTheDocument();
	});

	it("displays validation errors if password and email are invalid", async () => {
		render(<Page />);

		const emailInput = screen.getByLabelText(/^email$/i);
		const passwordInput = screen.getByLabelText(/^contraseña$/i);
		const confirmInput = screen.getByLabelText(/confirmar contraseña/i);
		const submitButton = screen.getByRole("button", { name: /registrarse/i });

		fireEvent.change(emailInput, { target: { value: "invalid-email" } });
		fireEvent.change(passwordInput, { target: { value: "password" } }); // 8 chars but no uppercase
		fireEvent.change(confirmInput, { target: { value: "different" } });

		fireEvent.blur(emailInput);
		fireEvent.blur(passwordInput);
		fireEvent.blur(confirmInput);

		// Try to submit
		fireEvent.click(submitButton);

		// Wait for at least one error message to appear
		const errorMessage = await screen.findByText(
			/dirección de email inválida/i,
		);
		expect(errorMessage).toBeInTheDocument();

		expect(register).not.toHaveBeenCalled();
	});
});
