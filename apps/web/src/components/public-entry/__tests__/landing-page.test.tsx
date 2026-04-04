import { render, screen } from "@testing-library/react";
import { LandingPage } from "../landing-page";

describe("landing-page", () => {
  it("shows signed-out CTAs to login and register", () => {
    render(<LandingPage isAuthenticated={false} />);

    expect(screen.getAllByText("Mình Đi Đâu Thế?").length).toBeGreaterThan(0);
    expect(
      screen
        .getAllByRole("link", { name: "Đăng nhập" })
        .some((link) => link.getAttribute("href") === "/auth/login"),
    ).toBe(true);
    expect(
      screen
        .getAllByRole("link", { name: "Tạo tài khoản" })
        .some((link) => link.getAttribute("href") === "/auth/register"),
    ).toBe(true);
    expect(screen.getByRole("link", { name: "Đăng nhập để chốt kèo" })).toHaveAttribute("href", "/auth/login");
  });

  it("keeps the signed-in primary CTA on dashboard", () => {
    render(<LandingPage isAuthenticated userName="Minh" />);

    expect(
      screen
        .getAllByRole("link", { name: "Vào dashboard" })
        .every((link) => link.getAttribute("href") === "/dashboard"),
    ).toBe(true);
    expect(screen.getByRole("link", { name: "Mở dashboard" })).toHaveAttribute("href", "/dashboard");
  });
});
