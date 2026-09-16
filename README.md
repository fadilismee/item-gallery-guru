# Buana Computer — Katalog Laptop & PC

Katalog online Buana Computer (Bantul, Yogyakarta): laptop & PC rakitan, monitor, komponen, storage, dan aksesoris — plus layanan **buyback hardware bekas/rusak** dan **blog teknisi**. Terinspirasi UX marketplace (Tokopedia/Shopee).

> **Live:** [buanacomputer.web.id](https://buanacomputer.web.id) · **Deploy:** Vercel (otomatis dari `main`)

## ✨ Fitur

| Halaman | Isi |
|---|---|
| `/` Katalog | Hero poster, kategori, banner promo, search + filter + sort, grid responsif, badge "Produk Pilihan" |
| `/produk/:id` | Galeri, harga + diskon, stok & qty, spesifikasi, produk serupa, tombol WA prefilled |
| `/jual` Buyback | Hero stack foto fan-out, strip statistik, gallery carousel grade A–D, katalog SKU + filter, tombol **Ajukan Jual** |
| `/jual/form` | Form taksir hardware (kategori × kondisi) → kirim pengajuan via WhatsApp |
| `/blog`, `/blog/:slug` | Artikel + CTA diskusi via WA |
| `/about` | Profil lab servis & buyback |
| `/admin/*` | Dashboard lokal: kelola produk, blog, harga, review, banner (lihat di bawah) |

Semua transaksi dinegosiasikan via WhatsApp (`6285979220599`) — cek lab 15 menit, dana cair instan (cash/BCA/QRIS).

## 🛠️ Tech Stack

- **TanStack Start** + TanStack Router + React 19 + Vite 8 + Nitro
- **Tailwind CSS 4** + shadcn/ui (new-york) + Lucide icons
- TypeScript strict · ESLint + Prettier · Zod (validasi data)
- Data: JSON statis di `src/data/` (siap pindah ke DB bila perlu)
- Upload gambar: Catbox (repo hanya menyimpan URL)

## 🚀 Cara Menjalankan

```sh
npm i
npm run dev       # dev server (atau scheduled task buana-dev, port 3000)
npm run lint      # eslint — harus 0 error
npm run validate  # validasi 9 file data + keunikan id/slug
npm run build     # production build (Vite + Nitro)
npm run preview   # pratinjau hasil build
```

## 📁 Struktur Proyek

```
src/routes/            → halaman (index, produk.$productId, jual.index, jual.form, blog.*, about, admin.*)
src/components/        → komponen UI (shadcn) + admin/ (AdminIcon, ConfirmDialog, ImageField, JsonEditor)
src/data/              → products, sellPrices, reviews, blog, banners, jualAssets, uploads (*.json)
src/lib/               → schemas.ts (Zod), validateAll.ts, adminClient.ts, adminMode.ts
src/server/admin.ts    → server functions admin (auth, dataset, upload, git, validate)
scripts/               → validate-data.ts, generate-sitemap.mjs (jalan saat prebuild)
tools/bot.py           → Bot Telegram pengelola katalog (token di tools/.env — JANGAN commit)
docs/                  → GIT.md (aturan push) & ALIRAN.md (user & admin flow lengkap)
```

## 🔐 Dashboard Admin (lokal + LAN kantor)

- Login: `http://localhost:3000/admin-login` (atau `http://<IP-PC>:3000/admin-login` dari HP/PC se-WiFi). Password: `ADMIN_PASSWORD` di `.env`.
- **Mode Mudah** (default): form + tombol hijau **Terbitkan Perubahan**. **Mode Teknis**: editor JSON + panel git + detail validasi.
- Gambar: tombol **Upload** (ke Catbox → link terisi otomatis) + **Gallery** (riwayat upload).
- Alur: Simpan per halaman (tulis JSON lokal, lolos validasi Zod) → Terbitkan (commit + push `src/data` & sitemap → deploy Vercel).
- ⚠️ Nonaktif di production. Detail lengkap: [`docs/ALIRAN.md`](docs/ALIRAN.md).

## 🌐 Deploy & Git

Push ke `main` = deploy otomatis Vercel. Aturan apa yang boleh/tidak boleh di-push ada di [`docs/GIT.md`](docs/GIT.md) — intinya: **jangan pernah commit `.env` / `tools/.env`** (berisi password & token).

## 📞 Kontak

- WhatsApp: `6285979220599`
- Alamat: Mertosan Kulon, Potorono, Banguntapan, Bantul, DI Yogyakarta 55196
