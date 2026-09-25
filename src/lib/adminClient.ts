const KEY = "buana-admin-token";

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

export function clearAdminToken() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* abaikan */
  }
}

export function errMsg(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  return m.replace(/^(Error| manage):?\s*/i, "").slice(0, 600);
}
