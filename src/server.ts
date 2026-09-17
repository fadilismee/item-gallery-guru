import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function getHost(request: Request): string {
  return (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  ).toLowerCase();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      const host = getHost(request);
      const isJualHost = host.startsWith("jual.");

      // Subdomain jual.buanacomputer.web.id → serve /jual internally
      if (isJualHost) {
        if (url.pathname.startsWith("/admin")) {
          return Response.redirect(`https://buanacomputer.web.id${url.pathname}${url.search}`, 308);
        }
        if (url.pathname === "/") {
          url.pathname = "/jual";
          request = new Request(url, request);
        } else if (
          !url.pathname.startsWith("/jual") &&
          !url.pathname.startsWith("/_") &&
          !url.pathname.startsWith("/assets") &&
          url.pathname !== "/favicon.ico" &&
          url.pathname !== "/manifest.json" &&
          url.pathname !== "/robots.txt" &&
          url.pathname !== "/sitemap.xml" &&
          url.pathname !== "/sitemap-jual.xml"
        ) {
          // Keep API & static untouched, otherwise /form on subdomain -> /jual/form
          if (url.pathname === "/form") {
            url.pathname = "/jual/form";
            request = new Request(url, request);
          }
        }
      } else {
        // Main domain: redirect old /jual → subdomain
        if (url.pathname === "/jual" || url.pathname === "/jual/") {
          return Response.redirect(`https://jual.buanacomputer.web.id/${url.search}`, 308);
        }
        if (url.pathname.startsWith("/jual/")) {
          const rest = url.pathname.replace(/^\/jual\/?/, "");
          return Response.redirect(`https://jual.buanacomputer.web.id/${rest}${url.search}`, 308);
        }
      }

      const handler = await getServerEntry();
      return await handler.fetch(request, env, ctx);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
