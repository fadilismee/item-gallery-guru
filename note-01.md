# PLAN — Bersihkan Lovable + Fix Semua Masalah (Buanacomp)

> Status: Build mode aktif — file ini adalah snapshot plan sebelum eksekusi.
> Workspace: `C:\Project\Kerjaan\Buanacomp` | Stack: TanStack Start + Vite + React 19 + Tailwind 4 + shadcn/new-york

## Tujuan

- Hapus total jejak Lovable (asset, config, prompt, md, telemetry, wrapper vite)
- Fix semua masalah fungsional/SEO/UX yang ditemukan di review awal
- Rebrand ke Buanacomp (ganti MicroComputer/MC jika dikonfirmasi)
- Pastikan `npm run lint` & `npm run build` lolos tanpa sisa string `lovable`

---

## A. Inventory Jejak Lovable (Wajib Dibersihkan/Ganti)

| #   | File/Folder                                                                                     | Jejak Lovable                                                                                                       | Aksi Rencana                                                                                                                                                                                                                                                        |
| --- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `.lovable/`                                                                                     | Folder config Lovable                                                                                               | **HAPUS total folder**                                                                                                                                                                                                                                              |
| 2   | `.lovable/project.json:2`                                                                       | `template: tanstack_start_ts_current`                                                                               | Hapus bersama folder                                                                                                                                                                                                                                                |
| 3   | `AGENTS.md:1`                                                                                   | `<!-- LOVABLE:BEGIN --> ... LOVABLE:END -->` 10 baris                                                               | **HAPUS file** atau rewrite jadi AGENTS.md generik Buanacomp                                                                                                                                                                                                        |
| 4   | `README.md:5-12`                                                                                | `This project was built with [Lovable]... Build with Lovable ... lovable.dev/projects/465f2b52...`                  | **Rewrite total** jadi README Buanacomp (deskripsi katalog, cara install, tech stack, tanpa link Lovable)                                                                                                                                                           |
| 5   | `package.json:73`                                                                               | `devDependencies: "@lovable.dev/vite-tanstack-config": "^2.20.0"`                                                   | **HAPUS dep**                                                                                                                                                                                                                                                       |
| 6   | `bunfig.toml:6`                                                                                 | `minimumReleaseAgeExcludes = ["@lovable.dev/..."]`                                                                  | **HAPUS baris / file** jika pindah ke npm, atau sederhanakan                                                                                                                                                                                                        |
| 7   | `vite.config.ts:1,7`                                                                            | `import { defineConfig } from "@lovable.dev/vite-tanstack-config"` + comment header Lovable                         | **Rewrite total** jadi vite vanilla: `vite + @vitejs/plugin-react + @tailwindcss/vite + vite-tsconfig-paths + @tanstack/router-plugin + nitro` (preserve `tanstackStart.server.entry: "server"`)                                                                    |
| 8   | `src/lib/lovable-error-reporting.ts:1`                                                          | File 59 baris `__lovableEvents`, `__lovableReportRuntimeError`, `reportLovableError`                                | **HAPUS file**                                                                                                                                                                                                                                                      |
| 9   | `src/routes/__root.tsx:13,41`                                                                   | `import { reportLovableError }` + `useEffect reportLovableError`                                                    | **HAPUS import & useEffect**, ganti errorComponent generik                                                                                                                                                                                                          |
| 10  | `src/routes/__root.tsx:80-87`                                                                   | `title: "Lovable App"`, `description: "Lovable Generated Project"`, `author: "Lovable"`, `twitter:site: "@Lovable"` | **Ganti** jadi `Buanacomp - Katalog Laptop & PC` (sinkron dengan `index.tsx:12`)                                                                                                                                                                                    |
| 11  | `src/routes/__root.tsx:104`                                                                     | `<html lang="en">`                                                                                                  | Ganti `lang="id"`                                                                                                                                                                                                                                                   |
| 12  | `src/lib/error-capture.ts:1` + `src/lib/error-page.ts:1` + `src/server.ts:1` + `src/start.ts:1` | File inject oleh `vite-tanstack-config` (h3 swallow, console.error wrap)                                            | **Opsi A (Recommended): Sederhanakan** — hapus wrap `console.error` global di `error-capture.ts`, ganti `server.ts` jadi proxy clean ke `server-entry` tanpa `normalizeCatastrophicSsrResponse`. **Opsi B: Keep** logic tapi hapus label Lovable. Butuh konfirmasi. |
| 13  | `src/routeTree.gen.ts:7`                                                                        | Auto-generated, depend ke `src/start.ts` wrapper                                                                    | Regenerate otomatis setelah vite baru (`npx @tanstack/router-cli generate`)                                                                                                                                                                                         |

Verifikasi akhir: `Select-String lovable -Recurse` harus 0 hit.

---

## B. Inventory Masalah Lain (Review Awal) — Akan Di-fix Barengan

| #   | Lokasi                                            | Masalah                                                                 | Fix Rencana                                                                                                                      |
| --- | ------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 14  | `__root.tsx:76`                                   | SEO default masih Lovable (sudah #10)                                   | Ganti meta default                                                                                                               |
| 15  | `SiteFooter.tsx:12` + `produk.$productId.tsx:149` | Kontak placeholder, WA button tidak fungsional                          | Isi footer Buanacomp + `Hubungi Penjual` jadi `<a href="https://wa.me/62...?text=...">`                                          |
| 16  | `index.tsx:36,81`                                 | Search client-only, tombol Cari tanpa action, tidak shareable URL       | Tambah `validateSearch` zod + `useSearch`/`navigate`, wrapper `<form onSubmit>` + Enter, sync `q/category/sort` ke URL           |
| 17  | `data/products.ts:17`                             | Hardcoded array, tidak ada CMS                                          | Tetap file ini (sesuai request canvas kosong) tapi rapikan + tambah helper `getRelated()`, siapkan migrasi `serverFn` next phase |
| 18  | `package.json` + env                              | `bun.lock` tapi `bun` tidak ada, `npm run lint` fail `eslint not found` | `npm i`, re-test lint/build; decide stay `bun` atau pindah `npm` (hapus `bun.lock`/`bunfig.toml`)                                |
| 19  | `eslint.config.js:35`                             | `no-unused-vars: off`                                                   | Aktifkan `warn`                                                                                                                  |
| 20  | `.gitignore:14`                                   | Cek `.env`                                                              | Tambah `.env` jika belum                                                                                                         |
| 21  | `SiteHeader.tsx:7`                                | Branding `MC / MicroComputer` legacy                                    | Ganti ke `Buanacomp` (jika dikonfirmasi)                                                                                         |
| 22  | `index.tsx:63` + `produk.$productId.tsx:64`       | Poster `bg-primary` hardcoded copy                                      | Keep layout, ganti copy jadi Buanacomp                                                                                           |

---

## C. Rencana Eksekusi (4 Fase)

### Fase 1 — De-Lovable Core

1. Hapus `.lovable/`, `src/lib/lovable-error-reporting.ts`
2. Rewrite `vite.config.ts` vanilla
3. Edit `package.json` (hapus dep Lovable) + `bunfig.toml`
4. Rewrite `AGENTS.md` + `README.md`

### Fase 2 — Root & SSR Cleanup

5. Edit `src/routes/__root.tsx` (hapus import Lovable, fix meta, `lang="id"`, sederhanakan ErrorComponent)
6. Sederhanakan `src/server.ts`, `src/start.ts`, (opsional hapus `error-capture.ts` wrap)
7. Regenerate `routeTree.gen.ts`

### Fase 3 — Fix Fungsional

8. Edit `src/routes/index.tsx` (search URL-sync + form submit)
9. Edit `src/routes/produk.$productId.tsx` (WA link dinamis)
10. Edit `SiteHeader.tsx`/`SiteFooter.tsx` rebrand Buanacomp + kontak real

### Fase 4 — Verifikasi

11. `npm i && npm run lint && npm run build` + `grep lovable == 0` + `tsc --noEmit`

---

## D. Pertanyaan Konfirmasi Sebelum Eksekusi

1. **Branding:** Ganti `MicroComputer / MC` jadi `Buanacomp` di semua tempat?
2. **SSR error handling:** Opsi A (hapus `error-capture.ts` wrap & sederhanakan `server.ts`) atau Opsi B (keep logic anti-h3-swallow)?
3. **Package manager:** Stay `bun` atau pindah full `npm`?
4. **Kontak footer & WA:** Beri nomor WA/email/alamat real atau tetap placeholder format Buanacomp?

> Jawab 4 poin ini, eksekusi Fase 1-4 langsung jalan.
