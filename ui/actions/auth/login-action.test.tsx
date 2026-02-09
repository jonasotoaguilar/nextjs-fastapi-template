import { cookies } from "next/headers";
import { type Mock, vi } from "vitest";
import { authJwtLogin } from "@/lib/clientService";
import { login } from "./login-action";

vi.mock("@/lib/clientService", () => ({
  authJwtLogin: vi.fn(),
}));

vi.mock("next/headers", () => {
  const mockSet = vi.fn();
  return { cookies: vi.fn().mockResolvedValue({ set: mockSet }) };
});

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("login action", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call login service action with the correct input", async () => {
    const formData = new FormData();
    formData.set("email", "a@a.com");
    formData.set("password", "Q12341414#");

    const mockSet = (await cookies()).set;

    // Mock a successful login
    (authJwtLogin as Mock).mockResolvedValue({
      data: { access_token: "1245token" },
    });

    await login({}, formData);

    expect(authJwtLogin).toHaveBeenCalledWith({
      body: {
        username: "a@a.com",
        password: "Q12341414#",
      },
    });

    expect(cookies).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith("accessToken", "1245token");
  });

  it("should return an error if the server validation fails", async () => {
    const formData = new FormData();
    formData.set("email", "invalid@invalid.com");
    formData.set("password", "Q12341414#");

    // Mock a failed login
    (authJwtLogin as Mock).mockResolvedValue({
      error: {
        detail: "LOGIN_BAD_CREDENTIALS",
      },
    });

    const result = await login(undefined, formData);

    expect(authJwtLogin).toHaveBeenCalledWith({
      body: {
        username: "invalid@invalid.com",
        password: "Q12341414#",
      },
    });

    expect(result).toEqual({
      server_validation_error: "Email o contraseña incorrectos.",
    });

    expect(cookies).not.toHaveBeenCalled();
  });

  it("should return an error if either the password or email is not sent", async () => {
    const formData = new FormData();
    formData.set("email", "");
    formData.set("password", "");

    const result = await login({}, formData);

    expect(authJwtLogin).not.toHaveBeenCalled();

    expect(result.errors?.email).toBeDefined();
    expect(result.errors?.password).toBeDefined();

    expect(cookies).not.toHaveBeenCalled();
  });

  it("should handle unexpected errors and return server error message", async () => {
    // Mock the authJwtLogin to throw an error
    const mockError = new Error("Network error");
    (authJwtLogin as Mock).mockRejectedValue(mockError);

    const formData = new FormData();
    formData.append("email", "testuser@example.com");
    formData.append("password", "password123");

    const result = await login(undefined, formData);

    expect(result).toEqual({
      server_error:
        "Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.",
    });
  });
});
