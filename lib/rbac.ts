/** Staff roles allowed into the Admin portal (RequireStaff). */
export const STAFF_ROLES = ["admin", "support"] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

/** Routes that only administrators may open (page-level guard). */
export const ADMIN_ONLY_ROUTES = ["/categories", "/banners", "/support"] as const;

export type AdminOnlyRoute = (typeof ADMIN_ONLY_ROUTES)[number];

export function isStaff(role: string | null | undefined): boolean {
  return role === "admin" || role === "support";
}

/** Strict admin-only actions (RequireAdmin). */
export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin";
}

export function isAdminOnlyRoute(pathname: string): boolean {
  return ADMIN_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
