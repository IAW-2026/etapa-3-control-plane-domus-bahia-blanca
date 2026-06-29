export const ROLES = {
  SELLER: "seller",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function extractRoles(sessionClaims: Record<string, unknown> | null): Role[] {
  if (!sessionClaims) return [];
  const metadata = sessionClaims.metadata as { roles?: string[] } | undefined;
  return (metadata?.roles ?? []) as Role[];
}

export function hasRole(roles: Role[], role: Role): boolean {
  return roles.includes(role);
}

export function isAdmin(roles: Role[]): boolean {
  return hasRole(roles, ROLES.ADMIN);
}
