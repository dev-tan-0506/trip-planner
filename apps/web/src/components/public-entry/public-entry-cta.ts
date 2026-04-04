export function getLandingPrimaryHref(isAuthenticated: boolean): "/dashboard" | "/auth/login" {
  return isAuthenticated ? "/dashboard" : "/auth/login";
}

export function getLandingSecondaryHref(isAuthenticated: boolean): "/dashboard" | "/auth/register" {
  return isAuthenticated ? "/dashboard" : "/auth/register";
}
