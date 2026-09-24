import { renderErrorPage } from "./lib/error-page";
import { getSupabaseClient } from "./lib/supabase";

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

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // Webhook Endpoint for Tripay.co.id Callbacks
      if (url.pathname === "/api/webhook/tripay" || url.pathname === "/api/webhook/tokopay") {
        try {
          let refId =
            url.searchParams.get("merchant_ref") ||
            url.searchParams.get("ref_id") ||
            url.searchParams.get("reff_id") ||
            "";
          let rawStatus = (url.searchParams.get("status") || "").toUpperCase();

          if (request.method === "POST") {
            const contentType = request.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              const body = (await request.json()) as {
                merchant_ref?: string;
                ref_id?: string;
                reff_id?: string;
                status?: string;
                is_closed_payment?: number;
                paid_at?: number | string;
              };
              refId = body.merchant_ref || body.ref_id || body.reff_id || refId;
              rawStatus = String(body.status || rawStatus).toUpperCase();
            } else if (contentType.includes("application/x-www-form-urlencoded")) {
              const formData = await request.formData();
              refId = String(
                formData.get("merchant_ref") ||
                  formData.get("ref_id") ||
                  formData.get("reff_id") ||
                  refId,
              );
              rawStatus = String(formData.get("status") || rawStatus).toUpperCase();
            }
          }

          const isPaid =
            rawStatus === "PAID" ||
            rawStatus === "SUCCESS" ||
            rawStatus === "SETTLED" ||
            rawStatus === "DIBAYAR" ||
            rawStatus === "TERBAYAR" ||
            rawStatus === "1";

          if (refId && isPaid) {
            const supabase = getSupabaseClient();
            if (supabase) {
              await supabase
                .from("orders")
                .update({ payment_status: "PAID", paid_at: new Date().toISOString() })
                .eq("id", refId);
            }
          }

          return new Response(JSON.stringify({ success: true, message: "OK", ref_id: refId }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (webhookErr) {
          console.error("Payment webhook processing error:", webhookErr);
          return new Response(JSON.stringify({ success: false, error: String(webhookErr) }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      }

      // Redirect any legacy /jual routes to homepage store
      if (url.pathname.startsWith("/jual")) {
        return Response.redirect("https://buanacomputer.web.id/", 301);
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
