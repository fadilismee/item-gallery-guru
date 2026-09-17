export function isJualHost(host: string): boolean {
  return host.toLowerCase().startsWith("jual.");
}

export function getSiteUrl(host: string): string {
  return isJualHost(host) ? "https://jual.buanacomputer.web.id" : "https://buanacomputer.web.id";
}

export function getHostFromRequest(request?: Request): string {
  if (!request) return "buanacomputer.web.id";
  return (
    request.headers.get("x-forwarded-host") || request.headers.get("host") || "buanacomputer.web.id"
  );
}
