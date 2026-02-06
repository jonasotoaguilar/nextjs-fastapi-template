import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type Mock, vi } from "vitest";
import { login } from "@/components/actions/login-action";
import Page from "./page";

vi.mock("@/components/actions/login-action", () => ({
  login: vi.fn(),
}));

describe("Login Page", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with username and password input and submit button", () => {
    render(<Page />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByText("Contraseña")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Iniciar Sesión/i }),
    ).toBeInTheDocument();
  });

  it("calls login in successful form submission", async () => {
    (login as Mock).mockResolvedValue({});

    render(<Page />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/);
    const submitButton = screen.getByRole("button", { name: /Iniciar Sesión/i });

    fireEvent.change(emailInput, {
      target: { value: "testuser@example.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "#123176a@" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const formData = new FormData();
      formData.set("email", "testuser@example.com");
      formData.set("password", "#123176a@");
      expect(login).toHaveBeenCalledWith(undefined, formData);
    });
  });

  it("displays error message if login fails", async () => {
    // Mock a failed login
    (login as Mock).mockResolvedValue({
      server_validation_error: "LOGIN_BAD_CREDENTIALS",
    });

    render(<Page />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/);
    const submitButton = screen.getByRole("button", { name: /Iniciar Sesión/i });

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("LOGIN_BAD_CREDENTIALS")).toBeInTheDocument();
    });
  });

  it("displays server error for unexpected errors", async () => {
    (login as Mock).mockResolvedValue({
      server_error: "An unexpected error occurred. Please try again later.",
    });

    render(<Page />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/);
    const submitButton = screen.getByRole("button", { name: /Iniciar Sesión/i });

    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "An unexpected error occurred. Please try again later.",
        ),
      ).toBeInTheDocument();
    });
  });
});
