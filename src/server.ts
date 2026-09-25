import { renderErrorPage } from "./lib/error-page";
import { getSupabaseClient } from "./lib/supabase";
import { createHmac, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function tripayPrivateKey(): string {
  try {
    const p = join(process.cwd(), "src", "data", "paymentSecrets.json");
    if (existsSync(p)) {
      const raw = JSON.parse(readFileSync(p, "utf-8")) as {
        tripay?: { privateKey?: string };
      };
      if (raw.tripay?.privateKey) return String(raw.tripay.privateKey);
    }
  } catch {
    // abaikan, fallback ke env
  }
  return (process.env.TRIPAY_PRIVATE_KEY || "").trim();
}

function signaturesEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ba.length === bb.length && ba.length > 0 && timingSafeEqual(ba, bb);
}

function getHost(request: Request): string {
  return (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  ).toLowerCase();
}

const PASS_THROUGH_PATHS = [
  "/favicon.ico",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
];

function isInternalPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/api/") ||
    PASS_THROUGH_PATHS.includes(pathname)
  );
}

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
      // Sesuai docs resmi: https://tripay.co.id/developer (#callback)
      // - POST JSON + header X-Callback-Signature = HMAC-SHA256(raw body, privateKey)
      // - Header X-Callback-Event harus "payment_status"
      // - Respons sukses wajib { "success": true } (selain itu dicoba ulang 3x)
      if (url.pathname === "/api/webhook/tripay" || url.pathname === "/api/webhook/tokopay") {
        const jsonRes = (obj: unknown) =>
          new Response(JSON.stringify(obj), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        try {
          // Alur legacy Tokopay via query string (kompatibilitas mundur)
          if (request.method === "GET") {
            const refId = url.searchParams.get("ref_id") || url.searchParams.get("reff_id") || "";
            const rawStatus = (url.searchParams.get("status") || "").toUpperCase();
            const isPaidLegacy = ["SUCCESS", "PAID", "DIBAYAR", "TERBAYAR", "1"].includes(
              rawStatus,
            );
            if (refId && isPaidLegacy) {
              const supabase = getSupabaseClient();
              if (supabase) {
                await supabase
                  .from("orders")
                  .update({ payment_status: "PAID", paid_at: new Date().toISOString() })
                  .eq("id", refId);
              }
            }
            return jsonRes({ success: true });
          }

          if (request.method !== "POST") {
            return jsonRes({ success: false, message: "Method not allowed" });
          }

          // 1. Baca raw body (wajib utuh untuk verifikasi signature)
          const rawBody = await request.text();
          let body: {
            reference?: string;
            merchant_ref?: string;
            status?: string;
            total_amount?: number;
            paid_at?: number | null;
          };
          try {
            body = JSON.parse(rawBody) as typeof body;
          } catch {
            return jsonRes({ success: false, message: "Invalid JSON body" });
          }

          // 2. Alur Tripay (ada merchant_ref) → verifikasi signature ketat
          if (body.merchant_ref) {
            const event = request.headers.get("x-callback-event") || "";
            if (event && event !== "payment_status") {
              return jsonRes({ success: false, message: `Unrecognized event: ${event}` });
            }
            const sentSig = request.headers.get("x-callback-signature") || "";
            const privateKey = tripayPrivateKey();
            if (!privateKey) {
              console.error("Webhook: TRIPAY_PRIVATE_KEY belum diset.");
              return jsonRes({ success: false, message: "Server misconfigured" });
            }
            const expectedSig = createHmac("sha256", privateKey).update(rawBody).digest("hex");
            if (!signaturesEqual(sentSig, expectedSig)) {
              console.warn("Webhook: invalid Tripay signature.");
              return jsonRes({ success: false, message: "Invalid signature" });
            }

            const status = String(body.status || "").toUpperCase();
            const mapped =
              status === "PAID"
                ? "PAID"
                : status === "EXPIRED"
                  ? "EXPIRED"
                  : status === "FAILED"
                    ? "FAILED"
                    : status === "REFUND"
                      ? "REFUNDED"
                      : null;
            if (!mapped) {
              return jsonRes({ success: false, message: "Unrecognized payment status" });
            }

            // 3. Cocokkan nominal dengan invoice agar callback palsu tidak lolos
            const supabase = getSupabaseClient();
            if (supabase) {
              const { data: order } = await supabase
                .from("orders")
                .select("id, total_amount, tripay_reference")
                .eq("id", body.merchant_ref)
                .single();
              if (!order) {
                return jsonRes({ success: false, message: "Invoice not found" });
              }
              if (
                (order as { tripay_reference?: string }).tripay_reference &&
                body.reference &&
                (order as { tripay_reference?: string }).tripay_reference !== body.reference
              ) {
                return jsonRes({ success: false, message: "Reference mismatch" });
              }
              if (
                typeof body.total_amount === "number" &&
                Number((order as { total_amount?: number }).total_amount) !== body.total_amount
              ) {
                return jsonRes({ success: false, message: "Amount mismatch" });
              }
              const patch: Record<string, string> = { payment_status: mapped };
              if (mapped === "PAID") {
                patch.paid_at =
                  typeof body.paid_at === "number"
                    ? new Date(body.paid_at * 1000).toISOString()
                    : new Date().toISOString();
              }
              if (mapped === "REFUNDED") {
                patch.refunded_at = new Date().toISOString();
              }
              await supabase.from("orders").update(patch).eq("id", body.merchant_ref);
            }
            return jsonRes({ success: true });
          }

          // 3b. Fallback legacy (tokopay-style POST tanpa signature)
          const refId = String(
            (body as { ref_id?: string; reff_id?: string }).ref_id ||
              (body as { reff_id?: string }).reff_id ||
              "",
          );
          const rawStatus = String((body as { status?: string }).status || "").toUpperCase();
          if (refId && ["SUCCESS", "PAID", "DIBAYAR", "TERBAYAR", "1"].includes(rawStatus)) {
            const supabase = getSupabaseClient();
            if (supabase) {
              await supabase
                .from("orders")
                .update({ payment_status: "PAID", paid_at: new Date().toISOString() })
                .eq("id", refId);
            }
          }
          return jsonRes({ success: true });
        } catch (webhookErr) {
          console.error("Payment webhook processing error:", webhookErr);
          return jsonRes({ success: false, error: String(webhookErr) });
        }
      }

      // Subdomain admin.buanacomputer.web.id = khusus area admin.
      // Selain /admin* & /admin-login, arahkan ke toko utama.
      // Admin lokal (localhost / LAN kantor / preview) TIDAK di-redirect
      // agar dashboard local-first tetap bisa dibuka langsung.
      const host = getHost(request);
      const isLiveHost = host.endsWith("buanacomputer.web.id");
      const isAdminPath = url.pathname === "/admin-login" || url.pathname.startsWith("/admin");
      if (isLiveHost && host.startsWith("admin.")) {
        if (!isAdminPath && !isInternalPath(url.pathname)) {
          return Response.redirect(`https://buanacomputer.web.id${url.pathname}${url.search}`, 308);
        }
      } else if (isLiveHost && isAdminPath) {
        // Area admin di domain live hanya dilayani dari subdomain admin
        return Response.redirect(
          `https://admin.buanacomputer.web.id${url.pathname}${url.search}`,
          308,
        );
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
