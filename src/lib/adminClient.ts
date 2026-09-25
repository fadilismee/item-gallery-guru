const KEY = "buana-admin-token";
const ROLE_KEY = "buana-admin-role";

export type AdminRole = "admin" | "reviewer";

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string) {
  sessionStorage.setItem(KEY, token);
}

export function getAdminRole(): AdminRole | null {
  try {
    const r = sessionStorage.getItem(ROLE_KEY);
    return r === "reviewer" ? "reviewer" : r === "admin" ? "admin" : null;
  } catch {
    return null;
  }
}

export function setAdminRole(role: AdminRole) {
  try {
    sessionStorage.setItem(ROLE_KEY, role);
  } catch {
    /* abaikan */
  }
}

export function isReviewer(): boolean {
  return getAdminRole() === "reviewer";
}

export function clearAdminToken() {
  try {
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem(ROLE_KEY);
  } catch {
    /* abaikan */
  }
}

export function errMsg(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  return m.replace(/^(Error| manage):?\s*/i, "").slice(0, 600);
}
