import { createServerFn } from "@tanstack/react-start";
import { createHmac, timingSafeEqual } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ZodError, type ZodTypeAny } from "zod";
import {
  BannersDataSchema,
  BlogDataSchema,
  JualAssetsDataSchema,
  ProductsDataSchema,
  ReviewsDataSchema,
  SellPricesDataSchema,
} from "@/lib/schemas";
import { validateAllData } from "@/lib/validateAll";

const execFileAsync = promisify(execFile);
const TOKEN_LABEL = "buana-admin";
const ROOT = process.cwd();

const DATASETS: Record<string, { file: string; schema: ZodTypeAny }> = {
  products: { file: "src/data/products.json", schema: ProductsDataSchema },
  reviews: { file: "src/data/reviews.json", schema: ReviewsDataSchema },
  blog: { file: "src/data/blog.json", schema: BlogDataSchema },
  sellPrices: { file: "src/data/sellPrices.json", schema: SellPricesDataSchema },
  banners: { file: "src/data/banners.json", schema: BannersDataSchema },
  jualAssets: { file: "src/data/jualAssets.json", schema: JualAssetsDataSchema },
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

function assertUsableRepo() {
  if (!existsSync(join(ROOT, "src", "data", "products.json"))) {
    throw new Error(
      `Direktori data tidak ditemukan di ${ROOT}. Jalankan admin dari dev server project.`,
    );
  }
}

function assertLocal() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Halaman admin hanya tersedia di local/dev, nonaktif di production.");
  }
  assertUsableRepo();
}

function assertAuth(token: unknown) {
  assertLocal();
  if (typeof token !== "string" || token.length === 0)
    throw new Error("Unauthorized: silakan login dulu.");
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(expectedToken(), "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Unauthorized: token tidak valid.");
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
  async ({ data }: { data: { password: string } }) => {
    assertLocal();
    const pw = data?.password ?? "";
    const a = Buffer.from(
      createHmac("sha256", adminPassword()).update(TOKEN_LABEL).digest("hex"),
      "utf8",
    );
    const b = Buffer.from(createHmac("sha256", pw).update(TOKEN_LABEL).digest("hex"), "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new Error("Password salah.");
    }
    return { token: expectedToken() };
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
    type S = {
      sellPrices: unknown[];
      buybackItems: unknown[];
      appraisalCategories: unknown[];
      appraisalConditions: unknown[];
    };
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
    const sell = safe<S>("src/data/sellPrices.json", {
      sellPrices: [],
      buybackItems: [],
      appraisalCategories: [],
      appraisalConditions: [],
    });
    const banners = safe<N>("src/data/banners.json", { hero: [], footer: "" });

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

    return {
      ok: true as const,
      env: process.env.NODE_ENV ?? "development",
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
      blog: { totalMinutes: totalReadMinutes, latest: blogLatest },
      reviews: { avg, latest: reviewLatest },
      sell: {
        rows: sell.sellPrices.length,
        items: sell.buybackItems.length,
        cells: sell.appraisalCategories.length * sell.appraisalConditions.length,
      },
      banners: { hero: banners.hero.filter((h) => String(h ?? "").trim().length > 0).length },
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
    assertAuth(data?.token);
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
    } catch (e) {
      throw new Error(`git gagal: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
);

export const adminGitCommitPush = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { token: string; message: string } }) => {
    assertAuth(data?.token);
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
    await run(["add", "src/data", "public/sitemap.xml"]);
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
    assertAuth(data?.token);
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
    assertAuth(data?.token);
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

    // Call Nano Banana (Gemini image generation/edit)
    const gemRes = await fetch(
      `${GEMINI_API_BASE}/models/gemini-2.5-flash-image:generateContent?key=${encodeURIComponent(key)}`,
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
      error?: { message?: string };
    };
    if (!gemRes.ok)
      throw new Error(gemJson?.error?.message || `Gemini image error ${gemRes.status}`);
    const outPart = gemJson.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    const outB64 = outPart?.inlineData?.data;
    const outMime = outPart?.inlineData?.mimeType || "image/jpeg";
    if (!outB64)
      throw new Error("Gemini tidak mengembalikan gambar. Coba prompt lain atau cek kuota API.");
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
    assertAuth(data?.token);
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

export const adminListUploads = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { token: string } }) => {
    assertAuth(data?.token);
    return { uploads: readUploads() };
  },
);
