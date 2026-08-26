/** Staff roles allowed into the Admin portal (RequireStaff). */
export const STAFF_ROLES = ["admin", "support"] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaff(role: string | null | undefined): boolean {
  return role === "admin" || role === "support";
}

/** Strict admin-only actions (RequireAdmin). */
export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin";
}
