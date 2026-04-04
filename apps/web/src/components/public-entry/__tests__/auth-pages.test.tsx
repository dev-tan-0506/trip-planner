import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  checkAuth: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ joinCode: "test-code" }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

vi.mock("../../../store/useAuthStore", () => ({
  useAuthStore: (selector: (state: { checkAuth: typeof mocks.checkAuth }) => unknown) =>
    selector({
      checkAuth: mocks.checkAuth,
    }),
}));

vi.mock("../../../lib/api-client", () => ({
  authApi: {
    login: mocks.login,
    register: mocks.register,
  },
}));

import LoginPage from "../../../../app/auth/login/page";
import RegisterPage from "../../../../app/auth/register/page";

describe("auth-pages", () => {
  beforeEach(() => {
    mocks.push.mockReset();
    mocks.checkAuth.mockReset();
    mocks.login.mockReset();
    mocks.register.mockReset();
    mocks.login.mockResolvedValue({});
    mocks.register.mockResolvedValue({});
    mocks.checkAuth.mockResolvedValue(undefined);
  });

  it("renders corrected Vietnamese copy and register link on login", async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(screen.getByRole("heading", { name: "Đăng nhập" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Đăng ký ngay" })).toHaveAttribute("href", "/auth/register");

    await waitFor(() => {
      expect(screen.getByText("Email không hợp lệ")).toBeInTheDocument();
      expect(screen.getByText("Mật khẩu ít nhất 6 ký tự")).toBeInTheDocument();
    });
  });

  it("renders corrected Vietnamese copy and login link on register", async () => {
    render(<RegisterPage />);
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký" }));

    expect(screen.getByRole("heading", { name: "Đăng ký" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Đăng nhập" })[0]).toHaveAttribute("href", "/auth/login");

    await waitFor(() => {
      expect(screen.getByText("Tên ít nhất 2 ký tự")).toBeInTheDocument();
      expect(screen.getByText("Email không hợp lệ")).toBeInTheDocument();
      expect(screen.getByText("Mật khẩu ít nhất 6 ký tự")).toBeInTheDocument();
    });
  });

  it("submits login through authApi.login then checks auth and redirects home", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "minh@example.com" } });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(mocks.login).toHaveBeenCalledWith("minh@example.com", "123456");
      expect(mocks.checkAuth).toHaveBeenCalled();
      expect(mocks.push).toHaveBeenCalledWith("/");
    });
  });

  it("submits register through authApi.register then checks auth and redirects home", async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Tên hiển thị"), { target: { value: "Minh" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "minh@example.com" } });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký" }));

    await waitFor(() => {
      expect(mocks.register).toHaveBeenCalledWith("minh@example.com", "123456", "Minh");
      expect(mocks.checkAuth).toHaveBeenCalled();
      expect(mocks.push).toHaveBeenCalledWith("/");
    });
  });
});
