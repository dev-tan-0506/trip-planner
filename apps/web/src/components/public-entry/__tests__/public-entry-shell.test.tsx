import { render, screen } from "@testing-library/react";
import { AuthScreenFrame } from "../auth-screen-frame";
import {
  getLandingPrimaryHref,
  getLandingSecondaryHref,
} from "../public-entry-cta";

describe("public-entry shell", () => {
  it("keeps signed-out and signed-in CTA destinations centralized", () => {
    expect(getLandingPrimaryHref(false)).toBe("/auth/login");
    expect(getLandingPrimaryHref(true)).toBe("/dashboard");
    expect(getLandingSecondaryHref(false)).toBe("/auth/register");
    expect(getLandingSecondaryHref(true)).toBe("/dashboard");
  });

  it("renders the shared auth frame without a public nav header", () => {
    render(
      <AuthScreenFrame>
        <div>AuthScreenFrame child content</div>
      </AuthScreenFrame>
    );

    expect(screen.getByText("AuthScreenFrame child content")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Đăng nhập" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Tạo tài khoản" })).not.toBeInTheDocument();
  });
});
