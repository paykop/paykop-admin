/** Staff roles allowed into the Admin portal (RequireStaff). */
export const STAFF_ROLES = ["admin", "support"] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

/** Routes accessible to support staff (allowlist). */
export const SUPPORT_ROUTES = ["/tickets", "/users", "/kyc", "/settings"] as const;

export type SupportRoute = (typeof SUPPORT_ROUTES)[number];

/** Routes that only administrators may open (page-level guard). */
export const ADMIN_ONLY_ROUTES = [
  "/",
  "/categories",
  "/banners",
  "/support",
  "/agents",
  "/campaigns",
  "/blood",
  "/service-categories",
  "/subscriptions",
  "/products",
  "/services",
  "/payments",
  "/commerce",
  "/logs",
  "/devtools",
] as const;

export type AdminOnlyRoute = (typeof ADMIN_ONLY_ROUTES)[number];

export function isStaff(role: string | null | undefined): boolean {
  return role === "admin" || role === "support";
}

/** Strict admin-only actions (RequireAdmin). */
export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin";
}

export function isSupport(role: string | null | undefined): boolean {
  return role === "support";
}

export function isAdminOnlyRoute(pathname: string): boolean {
  return ADMIN_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function canAccessRoute(
  role: string | null | undefined,
  pathname: string
): boolean {
  if (!isStaff(role)) return false;
  if (isAdmin(role)) return true;
  return SUPPORT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function getDefaultLandingPath(role: string | null | undefined): string {
  if (isSupport(role)) return "/tickets";
  return "/";
}

export type RouteResolution = "allow" | "redirect:/tickets" | "deny";

/** Single source of truth for route access decisions. */
export function resolveRouteForRole(
  role: string | null | undefined,
  pathname: string
): RouteResolution {
  if (!isStaff(role)) return "deny";
  if (isAdmin(role)) return "allow";
  if (pathname === "/" || pathname === "") return "redirect:/tickets";
  if (canAccessRoute(role, pathname)) return "allow";
  return "deny";
}
