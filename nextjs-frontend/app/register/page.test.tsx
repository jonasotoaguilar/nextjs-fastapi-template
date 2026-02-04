import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type Mock, vi } from "vitest";
import { register } from "@/components/actions/register-action";
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

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /crear cuenta/i }),
    ).toBeInTheDocument();
  });

  it("displays success message on successful form submission", async () => {
    // Mock a successful register
    (register as Mock).mockResolvedValue({});

    render(<Page />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /crear cuenta/i });

    fireEvent.change(emailInput, { target: { value: "testuser@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "@1231231%a" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const formData = new FormData();
      formData.set("email", "testuser@example.com");
      formData.set("password", "@1231231%a");
      expect(register).toHaveBeenCalledWith(undefined, formData);
    });
  });

  it("displays server validation error if register fails", async () => {
    (register as Mock).mockResolvedValue({
      server_validation_error: "User already exists",
    });

    render(<Page />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /crear cuenta/i });

    fireEvent.change(emailInput, { target: { value: "already@already.com" } });
    fireEvent.change(passwordInput, { target: { value: "@1231231%a" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("User already exists")).toBeInTheDocument();
    });
  });

  it("displays server error for unexpected errors", async () => {
    (register as Mock).mockResolvedValue({
      server_error: "An unexpected error occurred. Please try again later.",
    });

    render(<Page />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /crear cuenta/i });

    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "@1231231%a" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "An unexpected error occurred. Please try again later.",
        ),
      ).toBeInTheDocument();
    });

    const formData = new FormData();
    formData.set("email", "test@test.com");
    formData.set("password", "@1231231%a");
    expect(register).toHaveBeenCalledWith(undefined, formData);
  });

  it("displays validation errors if password and email are invalid", async () => {
    // Mock a successful password register
    (register as Mock).mockResolvedValue({
      errors: {
        email: ["Invalid email address"],
        password: [
          "Password should contain at least one uppercase letter.",
          "Password should contain at least one special character.",
        ],
      },
    });

    render(<Page />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /crear cuenta/i });

    fireEvent.change(emailInput, { target: { value: "email@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "invalid_password" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Password should contain at least one uppercase letter.",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Password should contain at least one special character.",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });

    const formData = new FormData();
    formData.set("email", "email@email.com");
    formData.set("password", "invalid_password");
    expect(register).toHaveBeenCalledWith(undefined, formData);
  });
});
