# PLAN.md — Data Layer Tetap File-Based + Dashboard Admin Local

> Status: APPROVED (2026-09-16). Keputusan: database belum perlu; kelola konten via Telegram bot + dashboard local (git-backed, local-first).
> Status eksekusi: SELESAI (2026-09-16) — lint 0 error, build lolos, render terverifikasi.
>
> Upgrade dashboard (2026-09-16, SELESAI): Mode Mudah (default, tile + tombol Terbitkan)
> vs Mode Teknis (JSON editor + git detail), upload gambar Catbox via ImageField + Gallery
> (`src/data/uploads.json`), akses LAN kantor (`vite.config host:true`, IP saat ini
> `http://192.168.11.245:3000`), satu password bersama. Verifikasi: upload Catbox live OK
> (file .exe ditolak), 8 target validasi OK, build lolos, 0 error eslint.
>
> Restyle dashboard ala reff-img/Dashboard-reff (2026-09-16, SELESAI): sistem CSS `.adm-*`
> (kartu terang, eyebrow mono uppercase, tombol biru, tabel, drawer form), navbar tetap di
> atas (tanpa sidebar). Dashboard: sapaan + aksi cepat + stat cards. Produk: nilai
> inventaris + siap jual + restock + terjual, search + pills kategori, tabel thumbnail,
> form drawer kanan. Blog/review/harga/banner: header + stat + kartu/tabel baru.
> Verifikasi: eslint 0 error, build lolos, semua rute admin + home 200.
>
> Dashboard pro v2 (2026-09-16, SELESAI): adminStatus diperkaya (nilai inventaris,
> stok kritis top-5, breakdown kategori, terlaris, 3 artikel + 3 review terbaru, sell,
> banner), font Material Symbols di __root, utility .adm-icon-chip/.adm-bar/.adm-foot-row/
> .adm-hero, dashboard rebuild ala reff: hero tanggal live + tombol berikon, 5 stat card
> (Katalog, Nilai Inventaris, Journal, Rating, Banner), banner Terbitkan, grid 12 kolom
> (Performa Konten dgn progress bar + Stok Menipis & Terlaris + Review Terbaru), tiles
> berikon, topbar nav berikon. Verifikasi: eslint 0 error, build lolos, semua rute 200.
>
> Perombakan UI/UX admin (2026-09-16, SELESAI): komponen bersama AdminIcon +
> ConfirmDialog (ganti semua window.confirm), ImageField/JsonEditor berikon Material,
> form Review & Blog pindah ke drawer kanan (blog 720px, .adm-drawer.wide) — hapus
> scrollTo hack, validasi client di produk/review/blog (Simpan nonaktif + daftar field
> kurang, cegah jebakan specs/galeri kosong), empty-state, label kolom harga,
> thumbnail preview banner, topbar responsif (nav scroll + aksi icon-only mobile),
> login show/hide password + link toko, guard beforeunload saat drawer editing terbuka,
> notifikasi simpan selalu ingatkan Terbitkan. Verifikasi: eslint 0 error, build lolos,
> semua rute 200, validate 8/8.
>
> Halaman /jual: hero banner + gallery barang (2026-09-16, SELESAI): dataset baru
> src/data/jualAssets.json {hero, heroCaption, gallery[6] {img,title,chip,note}} +
> schema JualAssetsDataSchema + registrasi validateAll & admin DATASETS (admin UI
> menyusul sesuai arahan). Hero kanan jadi banner image dgn caption, kartu Statistik
> Lab Buana pindah jadi strip ramping 4 kolom di bawah hero, GalleryTerima dirombak
> jadi grid foto 2 baris (lg 3 kolom) berisi contoh barang masuk + grade + note.
> Pricing/catalog tidak diubah. Verifikasi: eslint 0 error, build lolos, /jual 200,
> konten & image seed confirmed di HTML, validate 9/9 OK.
>
> Iterasi /jual (2026-09-16, SELESAI): PromoTopBanner dihapus (tidak dibutuhkan),
> GalleryTerima jadi carousel ala testimoni main page — panah kiri/kanan di tepi,
> auto-jalan tiap 3,5 dtk (pause saat hover/sentuh/tab hidden), swipe native via
> scroll-snap, teks kartu diringkas (chip + judul di atas gambar). Verifikasi: eslint
> 0 error, build lolos, /jual 200, tombol geser confirmed di HTML, teks promo hilang,
> validate 9/9 OK.
>
> Katalog SKU /jual ala reff section-skujual (2026-09-16, SELESAI): BuybackCard
> dirombak — chip grade + kode SKU (MOBO/GPU/LTP/CPU-0N, derive per kategori),
> foto 16:10 hover-zoom, judul + sub socket, panel "Estimasi Penawaran" + tombol
> Ajukan Jual; paragraf deskripsi & ribbon spec dibuang (teks minimal: barang + harga).
> Grid seragam 3 kolom semua kategori. sellPrices.json tidak diubah (foto/SKU
> placeholder per kategori). Verifikasi: eslint 0 error, build lolos, /jual 200,
> SKU & panel harga confirmed di HTML, validate 9/9 OK.
>
> Iterasi kecil (2026-09-16): foto kartu SKU dikecilin — rasio 16:10 → 2:1. Verifikasi:
> eslint 0 error, build lolos, /jual 200.
>
> Iterasi kecil 2 (2026-09-16): foto kartu SKU 2:1 → 21:9, sub socket dihapus (kartu
> hanya chip + SKU + foto + judul + panel harga). Verifikasi: eslint 0 error, build
> lolos, /jual 200, validate 9/9 OK.
>
> Iterasi kecil 3 (2026-09-16): foto kartu SKU jadi kotak (aspect-square 1:1).
> Verifikasi: eslint 0 error, build lolos, /jual 200.
>
> Iterasi kecil 4 (2026-09-16): foto kotak dikecilin 50% (w-1/2, rata tengah).
> Verifikasi: eslint 0 error, build lolos, /jual 200.
>
> Iterasi kecil 5 (2026-09-16): seluruh kartu SKU dikecilin — grid 4 kolom (xl),
> padding p-5→p-4, chip/SKU 11→10px, judul 15px, harga text-lg→base, tombol ramping.
> Verifikasi: eslint 0 error, build lolos, /jual 200.
>
> Iterasi kecil 6 (2026-09-16): foto kartu balik full-width + hover zoom scale-110;
> filter "Semua" jadi satu grid gabungan tanpa header pemisah kategori (SKU stabil
> per kategori, header hanya muncul saat filter kategori spesifik). Verifikasi:
> eslint 0 error, build lolos, /jual 200, header grup hilang saat mode semua,
> validate 9/9 OK.
>
> Iterasi kecil 7 (2026-09-16): foto kotak dikecilin 25% (w-3/4, rata tengah).
> Verifikasi: eslint 0 error, build lolos, /jual 200.
>
> Iterasi kecil 8 (2026-09-16): foto balik penuh (w-full, +33%), yang dikecilin
> seluruh isi kartu SKU — padding p-4→p-3, chip/SKU 10→9px, judul 14px, harga 15px,
> panel p-2, tombol xs. Verifikasi: eslint 0 error, build lolos, /jual 200,
> validate 9/9 OK.
>
> Iterasi kecil 9 (2026-09-16): kartu SKU ramping sedikit lagi — padding p-3→p-2.5,
> judul 14→13px, harga 15px→sm. Verifikasi: eslint 0 error, build lolos, /jual 200.
>
> Iterasi kecil 10 (2026-09-16): hero banner /jual jadi stack 3 foto fan-out —
> `heroStack` (3 picsum) di jualAssets.json + schema min(3); diam = numpuk
> (belakang ngintip kanan-bawah), hover = fan miring kipas; bar caption bawah
> banner dihapus. Fallback ke foto `hero` tunggal bila stack kurang. Verifikasi:
> eslint 0 error, build lolos, /jual 200 (3 seed + class fan terkonfirmasi,
> caption hilang), validate 9/9 OK.
>
> Iterasi kecil 11 (2026-09-16): stack hero dirombak — diam = numpuk rapat (cuma
> 1 foto depan keliatan, tanpa sliver), hover = foto belakang nyebar kanan & kiri
> (±80%, miring 2°) sementara foto depan tetap tengah. Verifikasi: eslint 0 error,
> build lolos, /jual 200 (class ±80% terkonfirmasi, fan lama hilang), validate 9/9 OK.
>
> Iterasi kecil 12 (2026-09-16): bingkai hero dibuang (tanpa border/bg/overflow
> clip — foto bebas meluncur keluar), rasio jadi portrait 3/4 (foto nampil penuh),
> tiap foto rounded-xl + durasi 500ms biar gerakan kanan-kiri jelas. Verifikasi:
> eslint 0 error, build lolos, /jual 200 (aspect-3/4 + frame hero hilang),
> validate 9/9 OK.
>
> Iterasi kecil 13 (2026-09-16): poros rotasi stack hero pindah ke bawah
> (origin-bottom) — miring cuma di bagian atas, bawah tetap. Verifikasi: eslint 0
> error, build lolos, /jual 200.
>
> Iterasi kecil 14 (2026-09-16): geser (translate/scale) dihapus total — hover
> cuma rotate ±8° poros bawah, bawah dipaku diam, atas ngipas kanan-kiri. Foto
> depan diam total. Verifikasi: eslint 0 error, build lolos, /jual 200.
>
> Iterasi kecil 15 (2026-09-16): miring ditambah ±8° → ±12°. Verifikasi: eslint 0
> error, build lolos, /jual 200.
>
> Iterasi kecil 16 (2026-09-16): miring ditambah dikit ±12° → ±15° (final).
> Verifikasi: eslint 0 error, build lolos, /jual 200.
>
> Git hygiene + docs (2026-09-16): .gitignore ditulis ulang ber-section
> (env/secrets, junk lokal, reff-img/**, OS/editor); bug komentar inline yang
> merusak pattern diperbaiki (terverifikasi via git check-ignore 8/8);
> session-export.json & link-embebgmpas.txt dilepas dari tracking
> (git rm --cached, file lokal tetap ada); docs/GIT.md (push vs jangan-push +
> alur rilis) & docs/ALIRAN.md (user & admin flow lengkap) dibuat; README
> ditambah pointer docs. Verifikasi: eslint 0 error (6 warning lama shadcn),
> build lolos, status git sesuai rencana. Commit/push BELUM dilakukan.
>
> Identitas git (2026-09-16): user.name fadlismee→fadilismee,
> user.email→ftahmirz.a06@gmail.com (typo lama bikin contribution tak terhitung).
> README ditulis ulang rapi (tabel fitur, struktur, admin, deploy, kontak).
>
> Fix build Vercel (2026-09-16): commit 90eb1aa menghapus link-embebgmpas.txt
> dari repo sementara SiteFooter.tsx masih raw-import → UNRESOLVED_IMPORT di
> Vercel. Perbaikan: iframe maps di-inline sebagai JSX (tanpa
> dangerouslySetInnerHTML), file txt dihapus dari disk, error.txt masuk
> .gitignore, docs/GIT.md dikoreksi. Verifikasi: eslint 0 error, build lolos
> tanpa file txt, validate 9/9 OK. Commit 11d5b3a + push ke main (upstream
> diset) → Vercel auto-rebuild.
>
> CI preventif (2026-09-16): Lovable nunjukkin error identik error.txt karena
> pegang snapshot lama (repo sudah bersih di HEAD 15a39c3). Tambah
> .github/workflows/ci.yml — tiap push main/PR jalan npm ci → lint → build →
> validate (Node dari .nvmrc), tanpa secret. docs/GIT.md tambah bab CI.
> Run pertama gagal di step validate (Node 20 tak bisa run .ts langsung) →
> .nvmrc 20→24 (samakan lokal v24.21.0 & Vercel nodejs24.x) → rerun.
> Run #2 (commit 3db17fd): completed + conclusion SUCCESS — CI hijau.
>
> Mobile UI/UX Overhaul (2026-09-16):
> - SiteHeader: hamburger menu slide-down drawer, backdrop dismiss, modal keranjang responsif (max-width viewport) + tombol close mobile, perbaikan layout logo vs actions.
> - HeroCarousel: tinggi minimum disesuaikan untuk smartphone (320px vs 420px lama) agar tidak mendominasi layar awal.
> - ProductCard & Katalog: grid gap proporsional (gap-3 vs gap-4/5), padding kartu p-3 pada mobile, tombol marketplace flex-col / stacked agar teks Tokopedia/Shopee tidak terpotong pada layar sempit.
> - Halaman Detail (/produk): selector kuantitas rapi, tombol "Hubungi Penjual" + "+ Keranjang" menjadi 2 kolom simetris pada mobile, produk serupa 2 kolom gap rapat.
> - Halaman /jual: hero 3-stack dibatasi max-w-xs agar proporsional di HP, strip statistik 2 kolom ringkas, katalog buyback menjadi 2 kolom rapi di HP (tidak lagi 1 kolom melar), heading responsif (text-2xl vs 3xl/4xl).
> - Form /jual/form: kartu live simulasi taksiran tetap di atas untuk feedback langsung, kartu bantuan sekunder (hotline, trust pillars, deals) dipindah ke bawah form agar form tidak terhalang scroll panjang di HP, tombol submit dibuat proporsional.
> - Blog & About: gambar hero artikel responsif (16/9 pada HP vs 21/9 desktop), scorecard metrik 2 kolom di HP, layout topbar admin 2 baris rapi.
> - Verifikasi: ESLint 0 error, build production Vite+Nitro lolos, validate 9/9 OK.

## 0. Kesimpulan Arsitektur

- **Format data tetap file (JSON).** Volume kecil (12 produk, 4 artikel, 12 review), tidak ada runtime API.
- Database baru dipertimbangkan kalau salah satu muncul: update real-time tanpa redeploy, admin yang di-hosting, atau input dari pengguna (order/review).
- **Alur konten:** edit (bot Telegram / dashboard local) → tulis JSON → `git commit + push` → Vercel auto-deploy.
- **Dashboard WAJIB jalan di local/dev machine.** Filesystem Vercel serverless ephemeral; git push gagal di production. Rute `/admin` dinonaktifkan di production + dilindungi password.

## 1. Peta Data Saat Ini

| Dataset | Jumlah | File | Status |
|---|---|---|---|
| Produk | 12 | `src/data/products.json` (+ tipe di `products.ts`) | JSON ✔ |
| Blog | 4 (7 tipe section) | `src/data/blog.ts` | TS → **pindah JSON** |
| Review | 12 | `src/data/reviews.ts` | TS → **pindah JSON** |
| Harga jual/taksir | 8 + 9 + 24 | `src/data/sellPrices.ts` | TS → **pindah JSON** |
| Banner | 0 | `src/data/banners.json` | JSON ✔ |
| Cart | client state | `src/data/cartStore.ts` (zustand + localStorage) | tetap |

## 2. Fase Eksekusi

### Fase 1 — Unifikasi data ke JSON
- `blog.ts` → `src/data/blog.json` (konten saja); `blog.ts` jadi tipe + helper (`getArticle`, `relatedArticles`) yang import JSON.
- `reviews.ts` → `src/data/reviews.json`; `reviews.ts` jadi tipe + helper.
- `sellPrices.ts` → `src/data/sellPrices.json`; `sellPrices.ts` jadi tipe + helper.
- Renderer tidak berubah (struktur identik, hanya sumber file pindah).

### Fase 2 — Validasi data
- `src/lib/schemas.ts` (zod): `ProductSchema`, `ReviewSchema`, `BlogArticleSchema` (+ union 7 section), `SellPricesSchema`, `BannersSchema`.
- Semua modul data (`products.ts`, `blog.ts`, `reviews.ts`, `sellPrices.ts`) ganti `as ...[]` → zod `parse()` dengan error jelas.
- `npm run validate` → `scripts/validate-data.ts` cek semua file (`node --experimental-strip-types`; fallback devDep `tsx` kalau Node < 22.6).
- Derive data turunan supaya tidak drift: `count` buyback dihitung dari item; rate appraisal vs harga buyback dicek konsistensinya.

### Fase 3 — Sitemap otomatis
- `scripts/generate-sitemap.mjs`: baca `products.json` + `blog.json` → tulis `public/sitemap.xml` (`/`, `/jual`, `/jual/form`, `/about`, `/blog`, semua `/produk/<id>`, semua `/blog/<slug>`, `lastmod` deterministik).
- `package.json`: tambah `"prebuild": "node scripts/generate-sitemap.mjs"`. Hapus sitemap manual.

### Fase 4 — Konsistensi konten (APPROVED: langsung ganti)
- `products.json`: brand placeholder (MicroBuild/MicroBook/MicroStore/MicroView/MicroGear/MicroPrint) → **brand asli + deskripsi realistis**; lokasi `"Batam"` → `"Bantul, Yogyakarta"` (12 produk).
- `reviews.json`: video sampel `big_buck_bunny` → gambar, tetap 12 entri.
- `blog.index.tsx`: H1/hero/labValue **hardcoded** → derive dari `blogArticles[0]`.
- `tools/bot.py`: default lokasi `"Batam"` → `"Bantul, Yogyakarta"`; rating lewat env.

### Fase 5 — Fix search `?q=`
- `src/routes/index.tsx`: tambah `validateSearch` zod `{ q? }`; filter katalog + value input diinisialisasi dari `search.q` (SiteHeader sudah navigate ke `/?q=...`).

### Fase 6 — Dashboard admin local (dev-only + password)
- **Auth**: env `ADMIN_PASSWORD`; `/admin/login` set cookie HMAC; guard `beforeLoad`; server fn menolak saat production/non-localhost.
- **`src/server/admin.ts`** (`createServerFn`): `listProducts`, `saveProduct`, `deleteProduct`, `listBlog`, `saveBlog`, `listReviews`, `saveReview`, `listSellPrices`, `saveSellPrices`, `listBanners`, `saveBanners`, `validateAll`, `gitStatus`, `gitCommitPush(message)`. Tiap save validasi zod dulu.
- **Rute UI** `/admin/*` (shadcn + sonner yang sudah ada):
  - `/admin` — ringkasan + panel Validasi + panel Git (status, 10 commit terakhir, "Commit & Push" + input pesan)
  - `/admin/produk` — list + form (specs baris, gallery URL, oldPrice, stock, featured, link tokped/shopee)
  - `/admin/blog` — editor per tipe section; `/admin/harga`; `/admin/review`; `/admin/banner`

### Fase 7 — Konsolidasi `tools/bot.py`
- Validasi minimal sisi Python (required field, tipe, harga ≥ 0) sebelum save; default lokasi benar; alur git tetap. Source of truth validasi = zod build-time.

## 3. Verifikasi
1. `npm run validate`, `npx eslint .`, `npm run build` (sitemap ter-generate).
2. Restart dev (`schtasks buana-dev`), cek: `/` (filter `?q=`), semua halaman blog render dari JSON, `/admin` login + CRUD uji lalu hapus, commit test (push hanya dengan izin).
3. `public/sitemap.xml` memuat produk + artikel + semua rute.

## 4. Risiko / Batasan
- Blog JSON: diff git kurang cantik dibanding Markdown (dipilih demi scope; renderer tidak berubah).
- Rename file data = route/& import harus ikut; regen routeTree otomatis oleh plugin.
- Commit test TIDAK di-push tanpa izin (push = trigger deploy Vercel).
