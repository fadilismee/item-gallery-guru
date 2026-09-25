import { ProxyAgent, fetch as undiciFetch } from "undici";

/**
 * Egress statis untuk API Tripay (kolom "Whitelist IP" merchant Tripay).
 *
 * Vercel serverless memakai IP keluar dinamis. Bila env QUOTAGUARDSTATIC_URL
 * diset (proxy QuotaGuard, 2 IP statis), seluruh request ke Tripay dilewatkan
 * proxy tersebut sehingga IP yang terlihat Tripay selalu sama.
 * Tanpa env: fetch langsung seperti biasa (IP dinamis).
 */

type TripayInit = {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
};

function proxyUrl(): string {
  return (process.env.QUOTAGUARDSTATIC_URL || "").trim();
}

let agent: ProxyAgent | null = null;

function getAgent(): ProxyAgent | null {
  const url = proxyUrl();
  if (!url) return null;
  if (!agent) {
    try {
      agent = new ProxyAgent(url);
    } catch {
      return null;
    }
  }
  return agent;
}

/** True bila request Tripay saat ini keluar lewat IP statis. */
export function usesStaticEgress(): boolean {
  return getAgent() !== null;
}

/** fetch khusus ke API Tripay — via proxy statis bila tersedia. */
export async function tripayFetch(url: string, init?: TripayInit): Promise<Response> {
  const dispatcher = getAgent();
  if (!dispatcher) return fetch(url, init);
  try {
    const res = await undiciFetch(url, {
      method: init?.method,
      headers: init?.headers as Record<string, string> | undefined,
      body: init?.body as never,
      dispatcher,
    });
    return res as unknown as Response;
  } catch {
    // Proxy gagal (mis. env salah format) — fallback direct agar checkout tidak mati.
    return fetch(url, init);
  }
}

/** IP publik yang terlihat dari server ini (rute sama seperti request Tripay). */
export async function egressIp(): Promise<{ ip: string; viaProxy: boolean }> {
  const viaProxy = usesStaticEgress();
  const probe = viaProxy
    ? await tripayFetch("https://api.ipify.org?format=json")
    : await fetch("https://api.ipify.org?format=json");
  const json = (await probe.json()) as { ip?: string };
  return { ip: String(json.ip || ""), viaProxy };
}
