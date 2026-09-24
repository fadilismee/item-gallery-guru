# GIT — Apa yang Di-push vs Jangan Di-push

Repo: `fadilismee/item-gallery-guru` (branch `main`). Push ke `main` = **deploy otomatis Vercel**.

## WAJIB di-commit

| Kelompok      | Contoh                                                                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kode aplikasi | `src/**` (routes, `components/`, `lib/`, `server/`, `data/*.json` + `*.ts`)                                                                                                                 |
| Utilitas data | `scripts/validate-data.ts`, `scripts/generate-sitemap.mjs`                                                                                                                                  |
| Aset publik   | `public/**` (sitemap.xml, robots.txt, ikon, logo, gambar terpakai)                                                                                                                          |
| Bot Telegram  | `tools/bot.py`, `tools/.env.example` (template, tanpa secret asli)                                                                                                                          |
| Konfigurasi   | `package.json` + `package-lock.json`, `vite.config.ts`, `nitro.config.ts`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `components.json`, `.nvmrc`, `.gitignore` |
| Dokumentasi   | `README.md`, `AGENTS.md`, `PLAN.md`, `note-*.md` (dev diary), `docs/**`                                                                                                                     |

## JANGAN di-push (sudah di `.gitignore`)

| Item                                                                               | Alasan                                                                                                                                           |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.env`, `.env.local`, `.env.*.local`                                               | Isinya `ADMIN_PASSWORD` dashboard lokal                                                                                                          |
| `tools/.env`                                                                       | Isinya `TELEGRAM_TOKEN`, `GITHUB_TOKEN`, `ALLOWED_CHAT_ID` bot (hanya `tools/.env.example` yang di-commit)                                       |
| `node_modules/`, `.output/`, `dist/`, `.tanstack/`, `.vinxi`, `.nitro`, `.vercel/` | Build artifact — bisa di-generate ulang                                                                                                          |
| `session-export.json`                                                              | Dump sesi dev internal (WA + ringkasan sesi)                                                                                                     |
| `link-embebgmpas.txt`                                                              | Snippet iframe Google Maps — sudah di-inline langsung sebagai `<iframe>` di `src/components/SiteFooter.tsx` (tidak ada lagi ketergantungan file) |

> Catatan: kedua file di atas **pernah ter-track** — sudah dilepas via `git rm --cached`, file lokal tetap ada.
> | `reff-img/**` (~8MB) | Referensi desain, tidak dipakai aplikasi |
> | `error.txt`, `error*.log` | Salinan log build (mis. tempelan log Vercel) |
> | `*.log`, `*.bak`, `*.tmp`, `*.local`, folder editor (`.vscode`, `.idea`), file OS (`.DS_Store`, `Thumbs.db`, `desktop.ini`) | Junk lokal |

> Gambar hasil upload **tidak masuk repo sebagai file biner** — admin mengupload ke Catbox, repo hanya menyimpan URL di `src/data/uploads.json` (maks 200 record terbaru).

## Alur rilis manual (terminal)

```powershell
git status --porcelain            # lihat yang berubah — pastikan hanya file "WAJIB" yang ikut
git add <file-terpilih>           # JANGAN git add . tanpa cek; pastikan .env/uploads junk tidak ikut
git commit -m "<pesan jelas>"
git push                          # Vercel otomatis build + deploy
```

Sebelum push, jaga branch `main` selalu buildable:

```powershell
npm run lint; npm run build; npm run validate
```

## CI otomatis (GitHub Actions)

Setiap push ke `main` dan setiap PR otomatis menjalankan `.github/workflows/ci.yml`:

```text
npm ci → npm run lint → npm run build → npm run validate
```

Hasilnya berupa check hijau/merah di commit — error build (mis. import file yang hilang seperti kasus `link-embebgmpas.txt`) ketangkap di GitHub **sebelum** sampai ke Vercel/Lovable. Workflow tanpa secret dan read-only; `ADMIN_PASSWORD` & `tools/.env` tetap tidak ikut.

## Alur rilis via admin (tombol Terbitkan)

Tombol **Terbitkan Perubahan** di header admin memanggil `adminGitCommitPush` yang **hanya** me-`add` `src/data/` + `public/sitemap.xml`, lalu commit + push. File kode lain (src/routes, dsb) **tidak ikut** — harus lewat terminal/manual di atas. Lihat `docs/ALIRAN.md` bagian Admin Flow untuk detail.
