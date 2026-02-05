import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { notFound, useSearchParams } from "next/navigation";
import { type Mock, vi } from "vitest";
import { passwordResetConfirm } from "@/components/actions/password-reset-action";
import Page from "./page";

vi.mock("next/navigation", async () => ({
  ...(await vi.importActual("next/navigation")),
  useSearchParams: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("@/components/actions/password-reset-action", () => ({
  passwordResetConfirm: vi.fn(),
}));

describe("Password Reset Confirm Page", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with password and confirm password input and submit button", () => {
    (useSearchParams as Mock).mockImplementation(() => ({
      get: (key: string) => (key === "token" ? "mock-token" : null),
    }));

    render(<Page />);

    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
  });

  it("renders the 404 page in case there is not a token", () => {
    (useSearchParams as Mock).mockImplementation(() => ({
      get: (key: string) => (key === "token" ? "" : undefined),
    }));

    render(<Page />);

    expect(notFound).toHaveBeenCalled();
  });

  it("displays error message if password reset fails", async () => {
    (useSearchParams as Mock).mockImplementation(() => ({
      get: (key: string) => (key === "token" ? "invalid-mock-token" : null),
    }));

    // Mock a successful password reset
    (passwordResetConfirm as Mock).mockResolvedValue({
      server_validation_error: "Invalid Token",
    });

    render(<Page />);

    const password = screen.getByLabelText("Contraseña");
    const passwordConfirm = screen.getByLabelText("Confirmar Contraseña");

    const submitButton = screen.getByRole("button", { name: /enviar/i });

    fireEvent.change(password, { target: { value: "P12345678#" } });
    fireEvent.change(passwordConfirm, { target: { value: "P12345678#" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid Token")).toBeInTheDocument();
    });

    const formData = new FormData();
    formData.set("password", "P12345678#");
    formData.set("passwordConfirm", "P12345678#");
    formData.set("resetToken", "invalid-mock-token");
    expect(passwordResetConfirm).toHaveBeenCalledWith(undefined, formData);
  });
  it("displays validation errors if password is invalid and don't match", async () => {
    (useSearchParams as Mock).mockImplementation(() => ({
      get: (key: string) => (key === "token" ? "mock-token" : null),
    }));

    // Mock a successful password reset
    (passwordResetConfirm as Mock).mockResolvedValue({
      errors: {
        password: ["Password should contain at least one uppercase letter."],
        passwordConfirm: ["Passwords must match."],
      },
    });

    render(<Page />);

    const password = screen.getByLabelText("Contraseña");
    const passwordConfirm = screen.getByLabelText("Confirmar Contraseña");

    const submitButton = screen.getByRole("button", { name: /enviar/i });

    fireEvent.change(password, { target: { value: "12345678#" } });
    fireEvent.change(passwordConfirm, { target: { value: "45678#" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Password should contain at least one uppercase letter.",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Passwords must match.")).toBeInTheDocument();
    });

    const formData = new FormData();
    formData.set("password", "12345678#");
    formData.set("passwordConfirm", "45678#");
    formData.set("resetToken", "mock-token");
    expect(passwordResetConfirm).toHaveBeenCalledWith(undefined, formData);
  });
});
