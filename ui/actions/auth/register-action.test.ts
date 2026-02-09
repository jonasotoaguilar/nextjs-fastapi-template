import { redirect } from "next/navigation";
import { type Mock, vi } from "vitest";
import { registerRegister } from "@/lib/clientService";
import { register } from "./register-action";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/clientService", () => ({
  registerRegister: vi.fn(),
}));

describe("register action", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call register service action with the correct input", async () => {
    const formData = new FormData();
    formData.set("email", "a@a.com");
    formData.set("password", "Q12341414#");
    formData.set("passwordConfirm", "Q12341414#");

    // Mock a successful register
    (registerRegister as Mock).mockResolvedValue({});

    await register({}, formData);

    expect(registerRegister).toHaveBeenCalledWith({
      body: {
        email: "a@a.com",
        password: "Q12341414#",
      },
    });

    expect(redirect).toHaveBeenCalled();
  });
  it("should return an error if the server call fails", async () => {
    const formData = new FormData();
    formData.set("email", "a@a.com");
    formData.set("password", "Q12341414#");
    formData.set("passwordConfirm", "Q12341414#");

    // Mock a failed register
    (registerRegister as Mock).mockResolvedValue({
      error: {
        detail: "REGISTER_USER_ALREADY_EXISTS",
      },
    });

    const result = await register({}, formData);

    expect(registerRegister).toHaveBeenCalledWith({
      body: {
        email: "a@a.com",
        password: "Q12341414#",
      },
    });
    expect(result).toEqual({
      server_validation_error: "Ya existe un usuario con este email.",
    });
  });

  it("should return an validation error if the form is invalid", async () => {
    const formData = new FormData();
    formData.set("email", "email");
    formData.set("password", "invalid_password");
    formData.set("passwordConfirm", "different_password");

    const result = await register({}, formData);

    expect(result).toEqual({
      errors: {
        email: ["Dirección de email inválida"],
        password: ["La contraseña debe contener al menos una letra mayúscula."],
        passwordConfirm: ["Las contraseñas no coinciden."],
      },
    });
    expect(registerRegister).not.toHaveBeenCalled();
  });

  it("should handle unexpected errors and return server error message", async () => {
    // Mock the registerRegister to throw an error
    const mockError = new Error("Network error");
    (registerRegister as Mock).mockRejectedValue(mockError);

    const formData = new FormData();
    formData.append("email", "testuser@example.com");
    formData.append("password", "Password123#");
    formData.append("passwordConfirm", "Password123#");

    const result = await register(undefined, formData);

    expect(result).toEqual({
      server_error:
        "Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.",
    });
  });
});
