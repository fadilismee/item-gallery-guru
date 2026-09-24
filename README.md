# Buana Computer Store — Toko Laptop & PC Bantul, Yogyakarta

[![CI](https://github.com/fadilismee/item-gallery-guru/actions/workflows/ci.yml/badge.svg)](https://github.com/fadilismee/item-gallery-guru/actions)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://buanacomputer.web.id)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start%20SSR-orange?logo=react)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%204-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

Website resmi **Buana Computer Store** — toko laptop & komputer di Banguntapan, Bantul, D.I. Yogyakarta: **katalog laptop second teruji, PC rakitan custom, monitor, komponen & storage sentinel 100%**, checkout QRIS instan, **Buana Journal**, serta **dashboard admin** terpusat.

- **Live:** [buanacomputer.web.id](https://buanacomputer.web.id)
- **Deploy:** Vercel (otomatis dari branch `main`)

---

## 📑 Daftar Isi

1. [Fitur Toko](#-fitur-toko)
2. [Checkout & Pembayaran](#-checkout--pembayaran)
3. [Buana Journal & Tentang Toko](#-buana-journal--tentang-toko)
4. [Dashboard Admin](#-dashboard-admin)
5. [Tech Stack](#%EF%B8%8F-tech-stack)
6. [Struktur File & Data Layer](#-struktur-file--data-layer)
7. [Panduan Developer](#-panduan-developer)
8. [Kontak & Informasi Toko](#-kontak--informasi-toko)

---

## 🛍️ Fitur Toko

Halaman depan (`/`) dan detail produk (`/produk/$productId`) mengadopsi standar UX marketplace modern (Tokopedia/Shopee):

### 1. Katalog & Pencarian Cepat

- **Hero Carousel Responsif:** Slider banner promo dengan touch-swipe di HP, auto-play 3 detik, aset poster vertikal khusus HP vs horizontal desktop.
- **Kategori & Pengurutan:** Filter instan (_Laptop, PC Rakitan, Monitor, Komponen, Aksesoris, Storage_) serta sorting (_Terpopuler, Harga Terendah, Harga Tertinggi_).
- **Pencarian Real-time:** Sinkron URL (`/?q=...`).

### 2. Kartu Produk & Varian Harga Dinamis

- **Rentang Harga Otomatis:** Produk bervarian menampilkan rentang (misal `Rp 150.000 - Rp 450.000`) + badge jumlah pilihan varian.
- **Pills Selector Varian:** Harga, diskon, stok & pesan WA terupdate seketika sesuai varian terpilih.
- **Penanganan Stok Habis:** Badge merah, stepper & tombol keranjang terkunci.

### 3. Interactive Image Lightbox

Klik foto utama → modal layar penuh: navigasi panah ← / →, keyboard (`ArrowLeft`/`ArrowRight`/`Escape`), strip thumbnail.

---

## 💳 Checkout & Pembayaran

4 jalur pembelian di setiap produk & keranjang:

1. **⚡ QRIS Instan (Tripay):** Popup checkout → isi nama + WA → scan QRIS dinamis (semua bank & e-wallet) → status otomatis `PAID` via webhook → invoice resmi di `/order/:id`.
2. **💬 WhatsApp:** Pesan prefilled otomatis (nama, varian, qty, total) ke `0859-7922-0599`.
3. **🟢 Tokopedia / 🟠 Shopee:** Tombol rekber marketplace resmi toko.
4. **🛒 Keranjang:** Popup keranjang multi-varian, checkout QRIS atau WA sekaligus.

- **Kebijakan Garansi & Refund:** Modal SOP resmi (garansi 1–12 bulan per kategori, syarat video unboxing + segel utuh, tukar unit atau refund 100% maks 1×24 jam) — terpasang di halaman produk, checkout, dan footer.
- **Anti-ragu:** Foto fisik asli, alamat gerai + Google Maps, nota & segel toko, 1 nomor WA konsisten.

---

## 📰 Buana Journal & Tentang Toko

- **Buana Journal (`/blog`):** Artikel panduan rakit PC, review benchmark, dan tips perawatan hardware. Rendering modular 7 tipe section + progress bar baca.
- **Tentang Toko (`/about`):** Profil gerai, metrik kepercayaan, 5-tahap Quality Control, tabel perbandingan, fasilitas gerai, marquee testimoni, peta & FAQ (JSON-LD `AboutPage` + `ComputerStore` + `FAQPage`).

---

## 🔐 Dashboard Admin

Akses di `/admin` & `/admin-login` (password via `ADMIN_PASSWORD` di `.env`). Prinsip **local-first**: baca/tulis JSON lokal, tombol **Terbitkan** = commit + push `src/data` & sitemap → deploy Vercel.

| Rute Menu       | Fungsi Pengelolaan                                                              |
| --------------- | ------------------------------------------------------------------------------- |
| `/admin`        | Ringkasan nilai inventaris, stok kritis, top seller, artikel & review terbaru.  |
| `/admin/produk` | Tambah/edit/hapus barang, varian harga/stok, link Tokopedia/Shopee, _featured_. |
| `/admin/blog`   | Tulis & sunting artikel journal (drawer editor 720px, 7 blok konten).           |
| `/admin/review` | Kelola ulasan, rating bintang, dan media testimoni.                             |
| `/admin/banner` | Slot hero slider homepage (WebP HD `Buanacomputer-*.webp`, tersimpan di repo).  |

- **Keamanan:** Token sesi HMAC, proteksi timing-attack, guard unsaved-changes; fungsi tulis data menolak berjalan di production (view-only untuk review).
- **Mode Mudah vs Teknis:** Form visual + tombol Terbitkan, atau editor JSON + panel git.

---

## 🛠️ Tech Stack

- **TanStack Start** + TanStack Router + React 19 + Vite 8 + Nitro
- **Tailwind CSS 4** + shadcn/ui + Lucide icons
- TypeScript strict · ESLint + Prettier · Zod (validasi data)
- Data katalog: JSON statis di `src/data/` · Orders: Supabase PostgreSQL · Upload: Catbox (URL) / repo `public/banners` (WebP)

---

## 📂 Struktur File & Data Layer

```
src/routes/            → index (katalog), produk.$productId, blog.*, about,
                         order.$orderId (invoice), admin.* (dashboard)
src/components/        → SiteHeader/Footer, HeroCarousel, ProductCard,
                         QrisCheckoutModal, WarrantyModal, Reveal, admin/*
src/data/              → products, reviews, blog, banners, uploads (*.json)
src/lib/               → schemas.ts (Zod), validateAll.ts, supabase.ts,
                         adminClient.ts, adminMode.ts
src/server/            → admin.ts (CRUD dataset, git, upload, AI),
                         payment.ts (Tripay QRIS order & status)
src/server.ts          → entry: webhook Tripay + redirect legacy /jual → /
scripts/               → validate-data.ts, generate-sitemap.mjs (prebuild)
```

---

## 💻 Panduan Developer

```sh
npm i
npm run dev       # dev server, http://localhost:3000
npm run lint      # eslint — harus 0 error
npm run validate  # validasi 5 dataset JSON + keunikan id/slug
npm run build     # production build (Vite + Nitro, generate sitemap)
npm run preview   # pratinjau hasil build
```

Isi `.env` (lihat `.env.example`, **jangan pernah commit**):

```env
ADMIN_PASSWORD=password-rahasia-admin
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
TRIPAY_MERCHANT_CODE=T...
TRIPAY_API_KEY=...
TRIPAY_PRIVATE_KEY=...
GOOGLE_API_KEY=AIza...   # opsional, fitur AI admin
```

Push ke `main` = CI GitHub Actions (lint → build → validate) lalu auto-deploy Vercel.

---

## 📍 Kontak & Informasi Toko

- **Nama Usaha:** Buana Computer Store
- **WhatsApp Resmi:** [`0859-7922-0599`](https://wa.me/6285979220599?text=Halo%20Buana%20Computer)
- **Alamat:** Mertosan Kulon, Potorono, Kec. Banguntapan, Kab. Bantul, DI Yogyakarta 55196
- **Maps:** [Lihat Lokasi di Google Maps](https://maps.google.com/?q=-7.8372069,110.4148331)
- **Jam Operasional:** Senin – Sabtu 09.00 – 20.00 WIB · Minggu 10.00 – 17.00 WIB (janjian WA)
- **Tokopedia:** [tokopedia.com/bmccomp](https://www.tokopedia.com/bmccomp)

---

_© 2026 Buana Computer Store. Hak Cipta Dilindungi._
