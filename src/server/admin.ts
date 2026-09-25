import { createServerFn } from "@tanstack/react-start";
import { createHmac, timingSafeEqual } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ZodError, type ZodTypeAny } from "zod";
import {
  BannersDataSchema,
  BlogDataSchema,
  PaymentSettingsDataSchema,
  ProductsDataSchema,
  ReviewsDataSchema,
} from "@/lib/schemas";
import { validateAllData } from "@/lib/validateAll";
import { getSupabaseClient, type OrderRecord } from "@/lib/supabase";
import { getTotpSecret, verifyTotp } from "./totp";

const execFileAsync = promisify(execFile);
const TOKEN_LABEL = "buana-admin";
const ROOT = process.cwd();

const DATASETS: Record<string, { file: string; schema: ZodTypeAny }> = {
  products: { file: "src/data/products.json", schema: ProductsDataSchema },
  reviews: { file: "src/data/reviews.json", schema: ReviewsDataSchema },
  blog: { file: "src/data/blog.json", schema: BlogDataSchema },
  banners: { file: "src/data/banners.json", schema: BannersDataSchema },
  paymentSettings: { file: "src/data/paymentSettings.json", schema: PaymentSettingsDataSchema },
};

/* ---------------- auth & guard ---------------- */

function adminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw)
    throw new Error("ADMIN_PASSWORD belum diset. Tambahkan ke .env lalu restart dev server.");
  return pw;
}

function expectedToken(): string {
  return createHmac("sha256", adminPassword()).update(TOKEN_LABEL).digest("hex");
}

const REVIEWER_LABEL = "buana-reviewer";

/**
 * Password akun reviewer (akses lihat-saja untuk tim verifikasi eksternal).
 * Kosong = peran reviewer nonaktif. Ganti/rotasi setelah selesai diverifikasi.
 */
function reviewerPassword(): string {
  return (process.env.ADMIN_REVIEWER_PASSWORD || "").trim();
}

function reviewerToken(): string {
  return createHmac("sha256", reviewerPassword()).update(REVIEWER_LABEL).digest("hex");
}

function tokensEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ba.length === bb.length && bb.length > 0 && timingSafeEqual(ba, bb);
}

function assertUsableRepo() {
  if (!existsSync(join(ROOT, "src", "data", "products.json"))) {
    throw new Error(
      `Direktori data tidak ditemukan di ${ROOT}. Jalankan admin dari dev server project.`,
    );
  }
}

function assertWriteAllowed() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Penyuntingan data JSON hanya dapat dilakukan dari mesin dev server lokal lab Buana Computer.",
    );
  }
  assertUsableRepo();
}

function isLocalRepo(): boolean {
  return existsSync(join(ROOT, "src", "data", "products.json"));
}

export type CallerRole = "admin" | "reviewer";

function assertAuth(token: unknown): CallerRole {
  if (typeof token !== "string" || token.length === 0)
    throw new Error("Unauthorized: silakan login dulu.");
  if (tokensEqual(token, expectedToken())) return "admin";
  const rp = reviewerPassword();
  if (rp && tokensEqual(token, reviewerToken())) return "reviewer";
  throw new Error("Unauthorized: token tidak valid.");
}

/** Operasi tulis/hapus/sensitif — hanya peran admin penuh. */
function assertAdmin(token: unknown): void {
  if (assertAuth(token) !== "admin") {
    throw new Error("Mode reviewer: hanya boleh melihat, tidak boleh mengubah.");
  }
}

const readJson = (rel: string): unknown => JSON.parse(readFileSync(join(ROOT, rel), "utf-8"));

function zodIssues(e: unknown): string {
  if (e instanceof ZodError) {
    return e.issues
      .slice(0, 10)
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
  }
  return String(e);
}

/* ---------------- server functions ---------------- */

export const adminLogin = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { password: string; code?: string } }) => {
    const pw = data?.password ?? "";
    const a = Buffer.from(
      createHmac("sha256", adminPassword()).update(TOKEN_LABEL).digest("hex"),
      "utf8",
    );
    const b = Buffer.from(createHmac("sha256", pw).update(TOKEN_LABEL).digest("hex"), "utf8");
    if (a.length === b.length && timingSafeEqual(a, b) && pw.length > 0) {
      // Akun admin penuh (dengan 2FA bila diaktifkan)
      if (getTotpSecret()) {
        const code = String(data?.code ?? "").replace(/\s/g, "");
        if (!code) throw new Error("2FA_REQUIRED");
        if (!verifyTotp(getTotpSecret(), code)) {
          throw new Error("Kode 2FA salah atau kedaluwarsa.");
        }
      }
      return { token: expectedToken(), role: "admin" as const };
    }
    // Akun reviewer (lihat-saja, tanpa 2FA — password dirotasi setelah verifikasi)
    const rp = reviewerPassword();
    if (rp) {
      const ra = Buffer.from(createHmac("sha256", rp).update(REVIEWER_LABEL).digest("hex"), "utf8");
      const rb = Buffer.from(createHmac("sha256", pw).update(REVIEWER_LABEL).digest("hex"), "utf8");
      if (ra.length === rb.length && timingSafeEqual(ra, rb) && pw.length > 0) {
        return { token: reviewerToken(), role: "reviewer" as const };
      }
    }
    throw new Error("Password salah.");
  },
);

export const adminStatus = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { token: string } }) => {
    assertAuth(data?.token);

    type P = {
      id: string;
      name: string;
      category: string;
      price: number;
      stock: number;
      sold: number;
      image?: string;
      isFeatured?: boolean;
    };
    type B = {
      slug: string;
      category: string;
      tag: string;
      tagTone: string;
      title: string;
      author: string;
      date: string;
      readMinutes: number;
      readers: string;
      image: string;
    };
    type R = { id: string; name: string; rating: number; title: string; date: string };
    type N = { hero: string[]; footer: string };

    const safe = <T>(file: string, fallback: T): T => {
      try {
        return readJson(file) as T;
      } catch {
        return fallback;
      }
    };

    const products = safe<P[]>("src/data/products.json", []);
    const blog = safe<{ articles: B[] }>("src/data/blog.json", { articles: [] });
    const reviews = safe<R[]>("src/data/reviews.json", []);
    const banners = safe<N>("src/data/banners.json", { hero: [], footer: "" });
    const uploads = safe<unknown[]>("src/data/uploads.json", []);

    const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

    /* ---- inventaris ---- */
    const inventoryValue = products.reduce((s, p) => s + num(p.price) * num(p.stock), 0);
    const readyCount = products.filter((p) => num(p.stock) > 0).length;
    const featuredCount = products.filter((p) => p.isFeatured).length;
    const lowStock = products
      .filter((p) => num(p.stock) <= 2)
      .sort((a, b) => num(a.stock) - num(b.stock))
      .slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, category: p.category, stock: num(p.stock) }));
    const lowStockCount = products.filter((p) => num(p.stock) <= 2).length;
    const catMap = new Map<string, number>();
    for (const p of products) {
      const c = p.category || "Lainnya";
      catMap.set(c, (catMap.get(c) ?? 0) + 1);
    }
    const cats = [...catMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const best = [...products].sort((a, b) => num(b.sold) - num(a.sold))[0];
    const totalSold = products.reduce((s, p) => s + num(p.sold), 0);

    /* ---- blog (file sudah urut terbaru duluan) ---- */
    const articles = blog.articles ?? [];
    const readersNum = (s: string) => {
      const m = /([\d.,]+)\s*k?/i.exec(s ?? "");
      if (!m) return 0;
      const v = Number.parseFloat(m[1].replace(",", "."));
      return /k/i.test(s) ? Math.round(v * 1000) : Math.round(v);
    };
    const latest3 = articles.slice(0, 3);
    const maxReaders = Math.max(1, ...latest3.map((a) => readersNum(a.readers)));
    const blogLatest = latest3.map((a) => ({
      slug: a.slug,
      category: a.category,
      tag: a.tag,
      tagTone: a.tagTone,
      title: a.title,
      date: a.date,
      readMinutes: num(a.readMinutes),
      readers: a.readers,
      pct: Math.max(8, Math.round((readersNum(a.readers) / maxReaders) * 100)),
    }));
    const totalReadMinutes = articles.reduce((s, a) => s + num(a.readMinutes), 0);

    /* ---- review ---- */
    const avg =
      reviews.length > 0
        ? Math.round((reviews.reduce((s, r) => s + num(r.rating), 0) / reviews.length) * 10) / 10
        : 0;
    const reviewLatest = reviews.slice(0, 3).map((r) => ({
      id: r.id,
      name: r.name,
      rating: num(r.rating),
      title: r.title,
      date: r.date,
    }));

    const recentProducts = products.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: num(p.price),
      stock: num(p.stock),
      image: p.image || "",
    }));

    const cleanHeroBanners = (Array.isArray(banners.hero) ? banners.hero : [])
      .map((h) => String(h ?? "").trim())
      .filter(Boolean);

    return {
      ok: true as const,
      env: process.env.NODE_ENV ?? "development",
      // local=false (production/Vercel): file JSON tidak ada di serverless,
      // statistik katalog tampil 0 — tapi log transaksi Supabase tetap live.
      local: isLocalRepo(),
      counts: {
        products: products.length,
        articles: articles.length,
        reviews: reviews.length,
      },
      inv: {
        value: inventoryValue,
        ready: readyCount,
        featured: featuredCount,
        lowCount: lowStockCount,
        low: lowStock,
        sold: totalSold,
      },
      cats,
      top: best ? { name: best.name, sold: num(best.sold) } : null,
      recentProducts,
      uploadsCount: uploads.length,
      blog: { totalMinutes: totalReadMinutes, latest: blogLatest },
      reviews: { avg, latest: reviewLatest },
      banners: {
        hero: cleanHeroBanners.length,
        heroList: cleanHeroBanners,
        footer: Boolean(banners.footer?.trim()),
        footerUrl: banners.footer || "",
      },
    };
  },
);

export const adminGetDataset = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { token: string; name: string } }) => {
    assertAuth(data?.token);
    const ds = DATASETS[data.name];
    if (!ds) throw new Error(`Dataset tidak dikenal: ${data.name}`);
    return { data: readJson(ds.file) };
  },
);

export const adminSaveDataset = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { token: string; name: string; data: unknown } }) => {
    assertAdmin(data?.token);
    assertWriteAllowed();
    const ds = DATASETS[data.name];
    if (!ds) throw new Error(`Dataset tidak dikenal: ${data.name}`);
    try {
      ds.schema.parse(data.data);
    } catch (e) {
      throw new Error(`Validasi gagal: ${zodIssues(e)}`);
    }
    writeFileSync(join(ROOT, ds.file), JSON.stringify(data.data, null, 2) + "\n", "utf-8");
    return { ok: true as const };
  },
);

export const adminValidate = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { token: string } }) => {
    assertAuth(data?.token);
    return validateAllData(ROOT);
  },
);

export const adminGitStatus = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { token: string } }) => {
    assertAuth(data?.token);
    // Di production / tanpa repo git: kembalikan status kosong, bukan error,
    // agar dashboard mode lihat-jarak-jauh tetap bisa dibuka.
    try {
      const [status, log, branch] = await Promise.all([
        execFileAsync("git", ["status", "--porcelain"], { cwd: ROOT, timeout: 15000 }),
        execFileAsync("git", ["log", "--oneline", "-10"], { cwd: ROOT, timeout: 15000 }),
        execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: ROOT, timeout: 15000 }),
      ]);
      return {
        branch: branch.stdout.trim(),
        dirty: status.stdout.trim().split("\n").filter(Boolean),
        log: log.stdout.trim().split("\n").filter(Boolean),
      };
    } catch {
      return { branch: "-", dirty: [], log: [] };
    }
  },
);

export const adminGitCommitPush = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { token: string; message: string } }) => {
    assertAdmin(data?.token);
    assertWriteAllowed();
    const message = (data?.message ?? "").trim();
    if (message.length < 5) throw new Error("Pesan commit minimal 5 karakter.");
    const run = async (args: string[]) => {
      try {
        const r = await execFileAsync("git", args, { cwd: ROOT, timeout: 60000 });
        return r.stdout.trim();
      } catch (e) {
        const err = e as { stderr?: string; message?: string };
        throw new Error(`git ${args[0]} gagal: ${(err.stderr || err.message || "").trim()}`);
      }
    };
    await run(["add", "src/data", "public/sitemap.xml", "public/banners"]);
    const commitOut = await run(["commit", "-m", message]);
    if (/nothing to commit/i.test(commitOut)) return { pushed: false as const, output: commitOut };
    const pushOut = await run(["push"]);
    return { pushed: true as const, output: `${commitOut}\n${pushOut}` };
  },
);

/* ---------------- Catbox upload constants (shared with AI) ---------------- */

const CATBOX_API = "https://catbox.moe/user/api.php";
const UPLOADS_FILE = "src/data/uploads.json";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "gif"];

export type UploadRecord = { url: string; label: string; at: string };

function readUploads(): UploadRecord[] {
  try {
    const raw = JSON.parse(readFileSync(join(ROOT, UPLOADS_FILE), "utf-8")) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter((r): r is UploadRecord => typeof (r as UploadRecord)?.url === "string");
  } catch {
    return [];
  }
}

function writeUploads(list: UploadRecord[]): void {
  writeFileSync(join(ROOT, UPLOADS_FILE), JSON.stringify(list, null, 2) + "\n", "utf-8");
}

/* ---------------- Google Nano Banana AI (optional) ---------------- */

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function googleApiKey(): string {
  const direct = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
  if (direct.trim()) return direct.trim();
  // Fallback: read from .env-apikey* file (e.g. .env-apikey.Ab8RN...) — API key bisa diawali AQ. juga
  try {
    const files = readdirSync(ROOT).filter((f: string) => f.startsWith(".env-apikey"));
    for (const f of files) {
      const txt = readFileSync(join(ROOT, f), "utf-8").trim();
      const firstLine = txt.split(/\r?\n/)[0]?.trim() || "";
      const m =
        /AIza[0-9A-Za-z_-]{20,}/.exec(txt) ||
        /AQ\.[0-9A-Za-z_-]{20,}/.exec(txt) ||
        /AIza[0-9A-Za-z_-]{20,}/.exec(firstLine);
      if (m) return m[0];
      if (
        firstLine &&
        !firstLine.startsWith("curl") &&
        !firstLine.startsWith("#") &&
        firstLine.length > 20
      ) {
        return firstLine;
      }
    }
  } catch {
    // ignore
  }
  throw new Error(
    "GOOGLE_API_KEY belum diset. Tambahkan ke .env atau file .env-apikey lalu restart dev server.",
  );
}

export const adminPolishText = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { token: string; text: string; context?: string } }) => {
    assertAdmin(data?.token);
    const text = (data?.text ?? "").trim();
    if (!text) throw new Error("Teks kosong.");
    if (text.length > 6000) throw new Error("Teks terlalu panjang (maks 6000 karakter).");
    const key = googleApiKey();
    const prompt =
      `Kamu adalah copywriter katalog e-commerce Indonesia untuk Buana Computer Bantul. ` +
      `Tugas: rapikan teks produk berikut agar jadi deskripsi katalog yang rapi, jelas, persuasif tapi jujur, ` +
      `bahasa Indonesia, tanpa hiperbola berlebihan. Perbaiki EYD, struktur paragraf, dan buat mudah dibaca di HP. ` +
      (data?.context ? `Konteks produk: ${data.context}. ` : "") +
      `Jangan tambah fakta baru yang tidak ada di teks asli. Hasilkan hanya teks yang sudah dirapikan.\n\nTeks asli:\n${text}`;

    const models = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-flash-latest"];
    let lastErr = "";
    for (const model of models) {
      try {
        const res = await fetch(
          `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.6, maxOutputTokens: 1200 },
            }),
          },
        );
        const json = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
          error?: { message?: string };
        };
        if (res.ok && json.candidates?.[0]?.content?.parts?.[0]?.text) {
          const out = json.candidates[0].content.parts
            .map((p) => p.text || "")
            .join("")
            .trim();
          return { polished: out };
        }
        lastErr = json?.error?.message || `Error ${res.status}`;
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
      }
    }
    throw new Error(`Gagal memoles teks dengan AI (${lastErr})`);
  },
);

export const adminEnhanceImage = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { token: string; imageUrl: string; prompt?: string } }) => {
    assertAdmin(data?.token);
    const imageUrl = (data?.imageUrl ?? "").trim();
    if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) throw new Error("URL gambar tidak valid.");
    const key = googleApiKey();
    const userPrompt =
      (data?.prompt ?? "").trim() ||
      "E-commerce catalog photo, pure white background #ffffff, studio softbox lighting, centered product, sharp focus, 4k, no shadow, no watermark, clean and tidy";

    // Fetch original image as base64
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Gagal ambil gambar sumber: ${imgRes.status}`);
    const imgBuf = Buffer.from(await imgRes.arrayBuffer());
    if (imgBuf.length > MAX_UPLOAD_BYTES) throw new Error("Gambar sumber terlalu besar (>10MB).");
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const mimeType = contentType.split(";")[0] || "image/jpeg";
    const b64 = imgBuf.toString("base64");

    // Try each Nano Banana / Gemini image model in sequence
    const imageModels = [
      "gemini-2.5-flash-image",
      "gemini-3.1-flash-image",
      "gemini-3.1-flash-lite-image",
      "gemini-3-pro-image",
      "nano-banana-pro-preview",
      "gemini-3.1-flash-image-preview",
    ];

    let outB64: string | undefined;
    let outMime = "image/jpeg";
    let isQuotaError = false;
    let lastErr = "";

    for (const model of imageModels) {
      try {
        const gemRes = await fetch(
          `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ inlineData: { mimeType, data: b64 } }, { text: userPrompt }],
                },
              ],
            }),
          },
        );
        const gemJson = (await gemRes.json()) as {
          candidates?: {
            content?: {
              parts?: { inlineData?: { mimeType?: string; data?: string }; text?: string }[];
            };
          }[];
          error?: { code?: number; message?: string; status?: string };
        };

        if (gemRes.ok) {
          const outPart = gemJson.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
          if (outPart?.inlineData?.data) {
            outB64 = outPart.inlineData.data;
            outMime = outPart.inlineData.mimeType || "image/jpeg";
            break; // Succeeded!
          }
        } else {
          if (gemJson?.error?.code === 429 || gemJson?.error?.status === "RESOURCE_EXHAUSTED") {
            isQuotaError = true;
          }
          lastErr = gemJson?.error?.message || `Status ${gemRes.status}`;
        }
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
      }
    }

    if (!outB64) {
      if (isQuotaError) {
        throw new Error(
          "Kuota Google AI Image habis (limit free tier project = 0). Untuk mengaktifkan fitur poles foto AI Nano Banana, hubungkan billing Pay-as-you-go di https://aistudio.google.com. Sementara ini gunakan foto asli yang sudah otomatis terkompres rapi (~200KB).",
        );
      }
      throw new Error(`Gagal memproses gambar dengan AI (${lastErr})`);
    }

    const outBuf = Buffer.from(outB64, "base64");
    // Upload hasil ke Catbox (otomatis terkompres di client, tapi di server tetap cek 10MB)
    if (outBuf.length > MAX_UPLOAD_BYTES) throw new Error("Hasil AI terlalu besar (>10MB).");
    const form = new FormData();
    const ext = outMime.includes("png") ? "png" : "jpg";
    const fileName = `ai-enhanced-${Date.now()}.${ext}`;
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", new Blob([outBuf], { type: outMime }), fileName);
    const catRes = await fetch(CATBOX_API, { method: "POST", body: form });
    const catUrl = (await catRes.text()).trim();
    if (!catRes.ok || !catUrl.startsWith("http"))
      throw new Error(`Upload hasil AI gagal: ${catUrl.slice(0, 120)}`);
    const record: UploadRecord = { url: catUrl, label: fileName, at: new Date().toISOString() };
    writeUploads([record, ...readUploads().filter((r) => r.url !== catUrl)].slice(0, 200));
    return { url: catUrl };
  },
);

/* ---------------- upload gambar (Catbox) + media library ---------------- */

export const adminUploadImage = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { token: string; fileName: string; dataUrl: string } }) => {
    assertAdmin(data?.token);
    const fileName = (data?.fileName ?? "upload").trim() || "upload";
    const ext = (fileName.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      throw new Error("Format file harus gambar: jpg / png / webp / gif.");
    }
    const m = /^data:image\/[\w+]+;base64,([A-Za-z0-9+/=]+)$/.exec((data?.dataUrl ?? "").trim());
    const b64 = m?.[1] ?? "";
    if (!b64) throw new Error("Data gambar tidak valid.");
    const buf = Buffer.from(b64, "base64");
    if (buf.length === 0 || buf.length > MAX_UPLOAD_BYTES) {
      throw new Error("Ukuran gambar maks 10MB.");
    }

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append(
      "fileToUpload",
      new Blob([buf], { type: `image/${ext === "jpg" ? "jpeg" : ext}` }),
      fileName,
    );
    let res: Response;
    try {
      res = await fetch(CATBOX_API, { method: "POST", body: form });
    } catch {
      throw new Error("Catbox tidak bisa dihubungi. Cek koneksi internet PC ini.");
    }
    const url = (await res.text()).trim();
    if (!res.ok || !url.startsWith("http")) {
      throw new Error(`Upload ke Catbox gagal: ${url.slice(0, 120)}`);
    }

    // Catat ke library (maks 200 terbaru) agar bisa dipakai ulang dari Gallery.
    const record: UploadRecord = { url, label: fileName, at: new Date().toISOString() };
    writeUploads([record, ...readUploads().filter((r) => r.url !== url)].slice(0, 200));
    return { url };
  },
);

/* ---------------- upload banner lokal (WebP HD, Git-Backed, prefix Buanacomputer) ---------------- */

export const adminUploadLocalBanner = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { token: string; fileName: string; dataUrl: string } }) => {
    assertAdmin(data?.token);
    assertWriteAllowed();
    const rawName = (data?.fileName ?? "banner").trim() || "banner";
    // Bersihkan nama file dan buang ekstensi lama
    const baseClean = rawName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Pastikan SELALU diawali kata "Buanacomputer-"
    const finalBase = /^buanacomputer-/i.test(baseClean)
      ? `Buanacomputer-${baseClean.replace(/^buanacomputer-/i, "")}`
      : `Buanacomputer-${baseClean || "banner"}`;

    // Selalu gunakan format WebP
    const finalFileName = `${finalBase}.webp`;

    const m = /^data:image\/[\w+]+;base64,([A-Za-z0-9+/=]+)$/.exec((data?.dataUrl ?? "").trim());
    const b64 = m?.[1] ?? "";
    if (!b64) throw new Error("Data gambar WebP tidak valid.");
    const buf = Buffer.from(b64, "base64");
    if (buf.length === 0 || buf.length > MAX_UPLOAD_BYTES) {
      throw new Error("Ukuran gambar maks 10MB.");
    }

    const bannersDir = join(ROOT, "public", "banners");
    if (!existsSync(bannersDir)) {
      mkdirSync(bannersDir, { recursive: true });
    }

    const targetPath = join(bannersDir, finalFileName);
    writeFileSync(targetPath, buf);

    const localUrl = `/banners/${finalFileName}`;
    const record: UploadRecord = {
      url: localUrl,
      label: finalFileName,
      at: new Date().toISOString(),
    };
    writeUploads([record, ...readUploads().filter((r) => r.url !== localUrl)].slice(0, 200));

    return { url: localUrl, fileName: finalFileName, sizeBytes: buf.length };
  },
);

export const adminListUploads = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { token: string } }) => {
    assertAuth(data?.token);
    return { uploads: readUploads() };
  },
);

/* ---------------- log transaksi & order (Supabase, bukan file lokal) ---------------- */

export type OrderLogFilter = {
  token: string;
  status?: "ALL" | "PENDING" | "PAID" | "EXPIRED" | "FAILED" | "CANCELLED" | "REFUNDED";
  query?: string;
  limit?: number;
};

export const adminListOrders = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: OrderLogFilter }) => {
    assertAuth(data?.token);
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        orders: [] as OrderRecord[],
        stats: { total: 0, pending: 0, paid: 0, problem: 0, revenue: 0 },
        offline: true as const,
      };
    }

    const limit = Math.min(Math.max(data?.limit ?? 200, 1), 500);
    const { data: rows, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`Gagal membaca tabel orders: ${error.message}`);

    let orders = (rows ?? []) as OrderRecord[];
    const status = (data?.status ?? "ALL").toUpperCase();
    if (status !== "ALL") {
      orders = orders.filter((o) => o.payment_status === status);
    }
    const q = (data?.query ?? "").trim().toLowerCase();
    if (q) {
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.toLowerCase().includes(q),
      );
    }

    const all = (rows ?? []) as OrderRecord[];
    const stats = {
      total: all.length,
      pending: all.filter((o) => o.payment_status === "PENDING").length,
      paid: all.filter((o) => o.payment_status === "PAID").length,
      problem: all.filter((o) => ["EXPIRED", "FAILED", "CANCELLED"].includes(o.payment_status))
        .length,
      revenue: all
        .filter((o) => o.payment_status === "PAID")
        .reduce((s, o) => s + (Number(o.total_amount) || 0), 0),
    };

    return { orders, stats, offline: false as const };
  },
);

/**
 * Verifikasi silang 1 order langsung ke API Tripay (cek ke PG),
 * lalu sinkronkan hasilnya ke Supabase.
 */
export const adminVerifyOrder = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { token: string; orderId: string } }) => {
    // Reviewer boleh membandingkan status, tapi sinkron tulis hanya untuk admin.
    const role = assertAuth(data?.token);
    const orderId = (data?.orderId ?? "").trim();
    if (!orderId) throw new Error("Order ID kosong.");

    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase belum terhubung.");

    const { data: row, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (error || !row) throw new Error("Order tidak ditemukan di database.");
    const order = row as OrderRecord;

    // Samakan sumber kredensial dengan payment.ts: file secrets lokal dulu, lalu env.
    let apiKey = (process.env.TRIPAY_API_KEY || "").trim();
    try {
      const raw = readJson(PAYMENT_SECRETS_FILE) as Partial<PaymentSecrets>;
      if (raw.tripay?.apiKey) apiKey = String(raw.tripay.apiKey);
    } catch {
      // abaikan, pakai env
    }
    if (!apiKey) throw new Error("TRIPAY_API_KEY belum diset di server.");
    const baseUrl = apiKey.startsWith("DEV-")
      ? "https://tripay.co.id/api-sandbox"
      : "https://tripay.co.id/api";

    const refParam = order.tripay_reference
      ? `reference=${encodeURIComponent(order.tripay_reference)}`
      : `merchant_ref=${encodeURIComponent(order.id)}`;

    const res = await fetch(`${baseUrl}/transaction/detail?${refParam}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const json = (await res.json()) as {
      success?: boolean;
      message?: string;
      data?: { status?: string; paid_at?: number | string; amount_received?: number };
    };
    if (!json.success) {
      throw new Error(`Tripay: ${json.message || "gagal memeriksa status"}`);
    }

    const tripayStatus = String(json?.data?.status || "UNKNOWN").toUpperCase();
    const mapped: OrderRecord["payment_status"] =
      tripayStatus === "PAID"
        ? "PAID"
        : tripayStatus === "EXPIRED"
          ? "EXPIRED"
          : tripayStatus === "FAILED"
            ? "FAILED"
            : tripayStatus === "REFUND"
              ? "REFUNDED"
              : "PENDING";

    const paidAt =
      mapped === "PAID"
        ? typeof json.data?.paid_at === "number"
          ? new Date(json.data.paid_at * 1000).toISOString()
          : typeof json.data?.paid_at === "string"
            ? json.data.paid_at
            : new Date().toISOString()
        : undefined;

    if (mapped !== order.payment_status && role === "admin") {
      const patch: Partial<OrderRecord> = { payment_status: mapped };
      if (paidAt) patch.paid_at = paidAt;
      if (mapped === "REFUNDED") patch.refunded_at = new Date().toISOString();
      const { error: upErr } = await supabase.from("orders").update(patch).eq("id", orderId);
      if (upErr) throw new Error(`Gagal sinkron ke database: ${upErr.message}`);
      order.payment_status = mapped;
      if (paidAt) order.paid_at = paidAt;
      if (mapped === "REFUNDED") order.refunded_at = patch.refunded_at;
    }

    return { ok: true as const, order, tripayStatus, readOnly: role !== "admin" };
  },
);

/** Hapus order testing / sampah dari log (operasi cloud, bukan file lokal). */
export const adminDeleteOrder = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { token: string; orderId: string } }) => {
    assertAdmin(data?.token);
    const orderId = (data?.orderId ?? "").trim();
    if (!orderId) throw new Error("Order ID kosong.");
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase belum terhubung.");
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) throw new Error(`Gagal menghapus: ${error.message}`);
    return { ok: true as const, orderId };
  },
);

/**
 * Proses refund manual: Tripay closed-payment tidak punya API refund otomatis,
 * dana dikembalikan via transfer bank manual oleh admin, lalu dicatat di sini.
 * Hanya untuk order berstatus PAID.
 */
export const adminRefundOrder = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { token: string; orderId: string; note?: string } }) => {
    assertAdmin(data?.token);
    const orderId = (data?.orderId ?? "").trim();
    const note = String(data?.note ?? "")
      .trim()
      .slice(0, 500);
    if (!orderId) throw new Error("Order ID kosong.");
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase belum terhubung.");

    const { data: row, error: readErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (readErr || !row) throw new Error("Order tidak ditemukan di database.");
    if ((row as OrderRecord).payment_status !== "PAID") {
      throw new Error("Refund hanya bisa diproses untuk order berstatus LUNAS.");
    }

    const refundedAt = new Date().toISOString();
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: "REFUNDED", refunded_at: refundedAt, refund_note: note })
      .eq("id", orderId);
    if (error) throw new Error(`Gagal mencatat refund: ${error.message}`);
    return { ok: true as const, orderId, refunded_at: refundedAt };
  },
);

/* ---------------- kredensial payment gateway (file lokal gitignored) ---------------- */

const PAYMENT_SECRETS_FILE = "src/data/paymentSecrets.json";

export type PaymentSecrets = {
  tripay: { merchantCode: string; apiKey: string; privateKey: string };
  tokopay: { merchantId: string; secretKey: string };
};

const blankSecrets = (): PaymentSecrets => ({
  tripay: { merchantCode: "", apiKey: "", privateKey: "" },
  tokopay: { merchantId: "", secretKey: "" },
});

function readSecrets(): PaymentSecrets {
  try {
    const raw = readJson(PAYMENT_SECRETS_FILE) as Partial<PaymentSecrets>;
    const base = blankSecrets();
    return {
      tripay: { ...base.tripay, ...(raw.tripay ?? {}) },
      tokopay: { ...base.tokopay, ...(raw.tokopay ?? {}) },
    };
  } catch {
    return blankSecrets();
  }
}

export const adminGetPaymentSecrets = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { token: string } }) => {
    // Reviewer tidak boleh melihat API key — kembalikan kosong agar UI tidak crash.
    if (assertAuth(data?.token) !== "admin") {
      return { secrets: blankSecrets(), masked: true as const };
    }
    return { secrets: readSecrets(), masked: false as const };
  },
);

export const adminSavePaymentSecrets = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { token: string; secrets: PaymentSecrets } }) => {
    assertAdmin(data?.token);
    assertWriteAllowed();
    const s = data?.secrets;
    if (!s || typeof s !== "object" || !s.tripay || !s.tokopay) {
      throw new Error("Format kredensial tidak valid.");
    }
    const clean = (v: unknown) => String(v ?? "").trim();
    const next: PaymentSecrets = {
      tripay: {
        merchantCode: clean(s.tripay.merchantCode),
        apiKey: clean(s.tripay.apiKey),
        privateKey: clean(s.tripay.privateKey),
      },
      tokopay: {
        merchantId: clean(s.tokopay.merchantId),
        secretKey: clean(s.tokopay.secretKey),
      },
    };
    writeFileSync(join(ROOT, PAYMENT_SECRETS_FILE), JSON.stringify(next, null, 2) + "\n", "utf-8");
    return { ok: true as const };
  },
);

/**
 * Tes koneksi API key ke payment gateway (tanpa membuat transaksi).
 * Tripay: cek detail transaksi dummy — key valid bila server merespons
 * (bukan error autentikasi). Tokopay: cek info saldo merchant.
 */
export const adminTestPaymentConnection = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { token: string; gateway: "tripay" | "tokopay"; mode?: string } }) => {
    assertAuth(data?.token);
    const gateway = data?.gateway === "tokopay" ? "tokopay" : "tripay";
    const secrets = readSecrets();

    if (gateway === "tripay") {
      const apiKey = secrets.tripay.apiKey || (process.env.TRIPAY_API_KEY || "").trim();
      if (!apiKey) throw new Error("API Key Tripay masih kosong.");
      const baseUrl = apiKey.startsWith("DEV-")
        ? "https://tripay.co.id/api-sandbox"
        : "https://tripay.co.id/api";
      const res = await fetch(`${baseUrl}/transaction/detail?merchant_ref=TEST-CONNECTION-PROBE`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const json = (await res.json()) as { success?: boolean; message?: string };
      const msg = String(json.message || "");
      if (json.success) return { ok: true as const, message: "Terhubung ke Tripay." };
      if (/not found|tidak ditemukan|data not found/i.test(msg)) {
        return {
          ok: true as const,
          message: `Terhubung ke Tripay (${apiKey.startsWith("DEV-") ? "mode Sandbox" : "mode Live"}).`,
        };
      }
      throw new Error(`Tripay menolak key: ${msg || `HTTP ${res.status}`}`);
    }

    const merchantId = secrets.tokopay.merchantId || (process.env.TOKOPAY_MERCHANT_ID || "").trim();
    const secretKey = secrets.tokopay.secretKey || (process.env.TOKOPAY_SECRET_KEY || "").trim();
    if (!merchantId || !secretKey)
      throw new Error("Merchant ID / Secret Key Tokopay masih kosong.");
    const { createHash } = await import("node:crypto");
    const signature = createHash("md5").update(`${merchantId}:${secretKey}`).digest("hex");
    const res = await fetch(
      `https://api.tokopay.id/v1/merchant/balance?merchant=${encodeURIComponent(
        merchantId,
      )}&signature=${signature}`,
    );
    const json = (await res.json()) as {
      status?: number | string | boolean;
      rc?: number;
      data?: { nama_toko?: string };
      error_msg?: string;
    };
    if (json.status === 1 || json.rc === 200) {
      return {
        ok: true as const,
        message: `Terhubung ke Tokopay (toko: ${json.data?.nama_toko || "-"}).`,
      };
    }
    throw new Error(`Tokopay menolak kredensial: ${json.error_msg || `HTTP ${res.status}`}`);
  },
);
