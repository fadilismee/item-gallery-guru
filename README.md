# Buana Computer — E-Commerce, Circular Hardware Buyback & Lab Platform

[![CI](https://github.com/fadilismee/item-gallery-guru/actions/workflows/ci.yml/badge.svg)](https://github.com/fadilismee/item-gallery-guru/actions)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://buanacomputer.web.id)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start%20SSR-orange?logo=react)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%204-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

Platform resmi **Buana Computer** (Bantul, D.I. Yogyakarta): ekosistem terpadu untuk **katalog laptop & PC rakitan**, **layanan buyback & salvage hardware bekas/rusak**, **jurnal teknikal laboratorium mikro-elektronika**, serta **dashboard admin all-in-one** terpusat.

- **Domain Toko Utama:** [buanacomputer.web.id](https://buanacomputer.web.id)
- **Subdomain Buyback & Jual:** [jual.buanacomputer.web.id](https://jual.buanacomputer.web.id)
- **Subdomain Servis:** [service.buanacomputer.web.id](https://service.buanacomputer.web.id)

---

## 📑 Daftar Isi

1. [Ringkasan Ekosistem](#-ringkasan-ekosistem)
2. [Arsitektur Subdomain & Routing](#-arsitektur-subdomain--routing)
3. [Fitur Toko & Marketplace (`/` & `/produk/$productId`)](#-fitur-toko--marketplace)
4. [Platform Buyback Hardware Rusak (`/jual` & `/jual/form`)](#-platform-buyback-hardware-rusak)
5. [Buana Journal & Profil Lab (`/blog` & `/about`)](#-buana-journal--profil-lab)
6. [Dashboard Admin All-in-One (`/admin`)](#-dashboard-admin-all-in-one)
7. [Integrasi AI Google Nano Banana & Kompresi Gambar](#-integrasi-ai-google-nano-banana--kompresi-gambar)
8. [Optimasi SEO & Google Sitelinks](#-optimasi-seo--google-sitelinks)
9. [Struktur File & Data Layer](#-struktur-file--data-layer)
10. [Panduan Developer & Menjalankan Proyek](#-panduan-developer--menjalankan-proyek)
11. [Kontak & Informasi Toko](#-kontak--informasi-toko)

---

## 🏛️ Ringkasan Ekosistem

Buana Computer adalah bengkel riset mikro-elektronika sekaligus toko komputer yang berlokasi di Banguntapan, Bantul. Sistem ini dirancang untuk menjawab dua kebutuhan utama:

1. **Penjualan Perangkat & Komponen Teruji:** Menyediakan laptop second mulus, unit mesin bahan kanibal, motherboard laptop gaming/workstation, baterai original, dan storage teruji sentinel 100%.
2. **Sirkularitas Hardware (Zero E-Waste):** Membeli laptop mati total, VGA artefak, motherboard konslet, dan limbah IT kantor/sekolah untuk di-salvage komponen IC donor dan logam berharganya secara transparan.

---

## 🌐 Arsitektur Subdomain & Routing

Sistem dibangun menggunakan **1 Repositori Git Tunggal (`fadilismee/item-gallery-guru`)** dan **1 Proyek Deployment Vercel**, namun mampu melayani multi-domain secara cerdas melalui deteksi host di layer SSR (`src/server.ts` & `vercel.json`):

```
                               ┌───────────────────────────────────────────────────────────┐
                               │                 1 Vercel Project / Repo                   │
                               └─────────────────────────────┬─────────────────────────────┘
                                                             │
                              Host Detection via x-forwarded-host (src/server.ts)
                                                             │
                  ┌──────────────────────────────────────────┴──────────────────────────────────────────┐
                  ▼                                                                                     ▼
   Host: buanacomputer.web.id                                                            Host: jual.buanacomputer.web.id
   ┌──────────────────────────────────────────┐                                          ┌──────────────────────────────────────────┐
   │ • /                 -> Katalog Toko      │                                          │ • /        (rewrite internal ke /jual)   │
   │ • /produk/:id       -> Detail & Varian   │                                          │ • /form    (rewrite internal ke /jual/form)
   │ • /blog & /blog/:id -> Buana Journal     │                                          │ • /admin   -> 308 Redirect ke domain utama
   │ • /about            -> Profil Lab        │                                          │ • Sitemap: /sitemap-jual.xml             │
   │ • /admin/*          -> Dashboard Admin   │                                          │ • Canonical: jual.buanacomputer.web.id/  │
   │ • /jual*            -> 308 Redirect ke   │                                          └──────────────────────────────────────────┘
   │                        subdomain jual.*  │
   │ • Sitemap: /sitemap.xml                  │
   └──────────────────────────────────────────┘
```

- **Konsolidasi SEO Tanpa Duplikasi:** Rute lama `buanacomputer.web.id/jual` otomatis di-redirect `308 Permanent Redirect` ke `jual.buanacomputer.web.id/`.
- **Satu Dashboard Terpusat:** Admin tetap login di `buanacomputer.web.id/admin-login` dan dapat mengontrol produk toko maupun aset buyback di satu tempat.

---

## 🛍️ Fitur Toko & Marketplace

Halaman depan (`/`) dan detail produk (`/produk/$productId`) mengadopsi standar UX marketplace modern (Tokopedia/Shopee):

### 1. Katalog & Pencarian Cepat

- **Hero Carousel Responsif:** Slider banner promo dengan dukungan touch-swipe pada smartphone, auto-play 3 detik, dan pemilihan aset poster vertikal khusus HP (`Buanacomputer-hp*.jpg`) vs horizontal desktop (`Buanacomputer-poster*.jpg`).
- **Kategori & Pengurutan:** Filter kategori instan (_Laptop, PC Rakitan, Monitor, Komponen, Aksesoris, Storage_) serta sorting (_Terpopuler, Harga Terendah, Harga Tertinggi_).
- **Pencarian Real-time:** Pencarian produk dengan URL sinkron (`/?q=...`). Pada halaman selain home, input pencarian menunggu tombol Enter/Submit agar tidak memutus fokus ketik di perangkat mobile.

### 2. Kartu Produk & Varian Harga Dinamis

- **Format Rentang Harga:** Jika produk memiliki varian dengan harga berbeda (misal: Hardisk 500GB, 1TB, 2TB), kartu katalog otomatis menampilkan rentang harga: `Rp 150.000 - Rp 450.000` serta badge `3 Pilihan Varian`.
- **Pills Selector Varian:** Di halaman detail, pengunjung dapat memilih varian kapasitas/spesifikasi. Harga, harga coret, persentase diskon, dan stok otomatis diperbarui seketika.
- **Penanganan Stok Habis:** Jika stok produk bernilai 0, sistem mengunci tombol kuantitas, menampilkan badge merah `Stok Habis`, dan menonaktifkan tombol keranjang belanja.

### 3. Interactive Image Lightbox

- Mengklik foto utama produk akan membuka **modal Lightbox layar penuh** dengan latar belakang gelap _backdrop-blur_:
  - Navigasi foto berikutnya / sebelumnya via tombol panah (← / →).
  - Dukungan navigasi keyboard (`ArrowLeft`, `ArrowRight`, dan `Escape` untuk menutup).
  - Strip thumbnail mini di bagian bawah untuk navigasi cepat.

### 4. Keranjang Belanja WhatsApp Multi-Varian

- Pop-up keranjang belanja responsif di header (hover di desktop, klik modal di HP).
- Mendukung pencatatan item per-varian secara terpisah.
- Tombol **"Checkout via WhatsApp"** otomatis menyusun pesan pesanan terstruktur:
  ```text
  Halo Buana Computer, saya mau checkout:
  - Hardisk Laptop 2.5 Inch (500 GB) x1 = Rp 150.000
  - Hardisk Laptop 2.5 Inch (1 TB) x2 = Rp 500.000
  Total: Rp 650.000
  Mohon info stok & pembayaran, terima kasih!
  ```

---

## ♻️ Platform Buyback Hardware Rusak

Halaman buyback (`jual.buanacomputer.web.id` / `/jual`) dirancang khusus untuk menjaring masyarakat dan instansi yang ingin menjual laptop/PC mati total maupun komponen bekas:

### 1. Hero 3-Photo Stack Fan-Out

- Sisi kanan hero menampilkan **tumpukan 3 foto portrait asli workshop Buana**.
- **Efek Interaktif:** Saat diam foto bertumpuk rapat (hanya foto depan terlihat); saat kursor mouse mendekat (_hover_), foto belakang kiri miring `-15°` dan foto kanan miring `+15°` dengan poros bawah (`origin-bottom`) menyerupai kartu kipas yang terbuka rapi.

### 2. Strip Statistik & Pedoman Grade

- **Strip Statistik Lab:** Ringkasan metrik riil (_1.840+ Komponen Di-salvage_, _15 Mnt Uji Multi-tester_, _Alamat COD Bantul DIY_).
- **Pedoman Grade Transparan:**
  - **Grade A (70%–85% Pasar):** Normal tested, mulus, lengkap dus/box.
  - **Grade B (50%–70% Pasar):** Normal fungsional, minus kosmetik wajar.
  - **Grade C (30%–50% Pasar):** Rusak sebagian (LCD garis, kipas macet, artefak ringan).
  - **Grade D (Rp 50rb–1.5Jt+):** Mati total, konslet jalur 12V, korosi cairan (dibeli untuk kanibal IC).

### 3. Galeri Barang Masuk Lab Carousel

- Carousel otomatis (auto-scroll tiap 3.5 detik) menampilkan foto nyata barang yang sudah diterima dan dibayar lunas oleh lab Buana Computer.

### 4. Katalog SKU Buyback 2-Kolom

- Menampilkan daftar estimasi harga terima per kelompok hardware (_Motherboard LGA/AM4, VGA Card RTX/GTX, Laptop Second/Bangkai, Processor/RAM/SSD_).
- Tombol **"Ajukan Jual"** pada kartu langsung membawa pengguna ke formulir taksir dengan parameter model & kategori terisi otomatis.

### 5. Formulir Taksiran Online (`/jual/form`)

- **Simulasi Taksiran Live:** Kalkulator dinamis yang menampilkan estimasi harga terima seketika saat pengguna memilih kategori dan kondisi barang.
- **Multi-Step Form:** Pemilihan kategori hardware, merek/tipe spesifik, checklist kelengkapan (dus, adaptor, nota), status kondisi, metode penyerahan (Antar ke Toko / COD Jemput Jogja / Ekspedisi), dan metode pencairan dana (Cash / BCA / Mandiri / BRI / QRIS).
- **Anti-Popup Blocker:** Tombol submit otomatis mendeteksi perangkat mobile (`window.location.href`) sehingga jendela WhatsApp tidak terblokir oleh browser smartphone.

---

## 📰 Buana Journal & Profil Lab

### Buana Journal (`/blog` & `/blog/$articleId`)

- Publikasi artikel teknis seputar arsitektur PC gaming, benchmarking VRAM, teardown laptop, dan panduan thermal pad langsung dari meja kerja teknisi.
- Sistem rendering modular mendukung 7 tipe section konten: `lead`, `spec`, `part`, `advice`, `chart` (progress bar komparasi), `quote`, dan `takeaway`.
- Progress bar membaca artikel (_reading progress indicator_) di bagian atas layar.

### Profil Lab Servis (`/about`)

- Informasi fasilitas perlindungan ESD Level 4 (_Electrostatic Discharge_), mikroskop trinokular stereo, kamera termal FLIR, dan kebijakan transparansi meja periksa terbuka (_Zero-Malpractice Policy_).
- Peta topologi jaringan sirkular Yogyakarta dan metrik penyelamatan limbah elektronik (_>1.8 Ton E-Waste diverted_).

---

## 🔐 Dashboard Admin All-in-One

Akses dashboard admin berada di rute `/admin` dan `/admin-login`. Dashboard ini berjalan dengan prinsip **Local-First & Git-Backed CMS**:

```
                               ┌───────────────────────────────────────────────────────────┐
                               │             Dashboard Admin (Local / LAN)                 │
                               │          http://localhost:3000/admin-login                │
                               └─────────────────────────────┬─────────────────────────────┘
                                                             │
                                   1. Edit Konten Visual & Validasi Skema Zod
                                   2. Tulis File JSON Lokal (src/data/*.json)
                                   3. Klik Tombol "Terbitkan Perubahan"
                                                             │
                                                             ▼
                                     ┌───────────────────────────────┐
                                     │   adminGitCommitPush (Server) │
                                     │  git add src/data sitemap.xml │
                                     │  git commit -m "..."          │
                                     │  git push origin main         │
                                     └───────────────┬───────────────┘
                                                     │
                                                     ▼
                                     ┌───────────────────────────────┐
                                     │      Vercel Auto-Deploy       │
                                     │     Situs Live Terupdate      │
                                     └───────────────────────────────┘
```

### 1. Keamanan & Proteksi

- **Sandi Tim:** Dilindungi variabel lingkungan `ADMIN_PASSWORD` di `.env` lokal.
- **HMAC Token:** Server memvalidasi token sesi menggunakan `crypto.timingSafeEqual` untuk mencegah serangan _timing attack_. Token tersimpan aman di `sessionStorage` (otomatis logout saat tab ditutup).
- **Proteksi Production:** Fungsi server admin menolak eksekusi jika `NODE_ENV === "production"` (`assertLocal`), sehingga dashboard aman dari akses luar saat website live di Vercel.
- **Guard Unsaved Changes:** Peringatan konfirmasi `beforeunload` otomatis muncul jika admin menutup tab saat formulir sedang diedit.

### 2. Mode Tampilan: Mudah vs Teknis

- **Mode Mudah (Default):** Formulir visual sederhana, tabel interaktif, upload foto drag-and-drop, dan tombol hijau **"Terbitkan Perubahan"** di header atas.
- **Mode Teknis:** Panel editor JSON mentah dengan syntax validation real-time dan panel status git (branch, status dirty file, log commit).

### 3. Menu Kendali Admin

| Rute Menu       | Nama              | Fungsi Pengelolaan                                                                                                                                       |
| --------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin`        | **Dashboard**     | Ringkasan nilai inventaris, produk stok kritis (≤2), breakdown kategori, top seller, artikel & review terbaru, status git dirty, dan validasi 9 dataset. |
| `/admin/produk` | **Produk**        | Tambah/edit/hapus barang dagangan toko, kelola pilihan varian harga/stok, tabel thumbnail, tautan Tokopedia/Shopee, dan status unggulan (_Featured_).    |
| `/admin/jual`   | **Aset Jual**     | Kelola 3 slot foto portrait Hero Stack `/jual`, teks caption lab, foto cadangan (_fallback_), dan 6 kartu carousel barang masuk lab.                     |
| `/admin/harga`  | **Harga Buyback** | Kelola matriks taksiran live rate, kategori buyback, dan editor visual kartu SKU buyback hardware bekas/rusak.                                           |
| `/admin/blog`   | **Blog Journal**  | Tulis dan sunting artikel teknikal dengan drawer editor lebar (720px) mendukung 7 jenis blok konten modular.                                             |
| `/admin/review` | **Review**        | Kelola ulasan & testimoni pelanggan, rating bintang, dan media lampiran foto/video.                                                                      |
| `/admin/banner` | **Banner**        | Atur slot slider banner promo homepage dan poster footer.                                                                                                |

---

## 🍌 Integrasi AI Google Nano Banana & Kompresi Gambar

Dashboard admin dilengkapi asisten kecerdasan buatan (AI) terintegrasi untuk mempercepat pembuatan katalog produk yang profesional:

### 1. Pemolesan Deskripsi Produk AI (`adminPolishText`)

- Didukung model **`gemini-3.6-flash`** melalui REST API resmi Google AI Studio.
- Tombol **"Poles Singkat AI"** dan **"Poles Deskripsi AI"** pada form produk otomatis menyusun kalimat spesifikasi yang rapi, padat, berstandar EYD, dan nyaman dibaca di smartphone tanpa mengubah data teknis asli.

### 2. Pemolesan Foto Produk Studio AI (`adminEnhanceImage`)

- Didukung keluarga model **Google Nano Banana (Gemini Image)**.
- Tombol **"Poles AI"** pada field gambar mengirim foto mentah dan menerapkan prompt studio konsisten:
  > _"E-commerce catalog photo, pure white background #ffffff, studio softbox lighting, centered product, sharp focus, 4k, clean and tidy"_
- **Fallback Chain Otomatis:** Server mencoba 6 model gambar secara sekuensial (`gemini-2.5-flash-image`, `gemini-3.1-flash-image`, `gemini-3.1-flash-lite-image`, `gemini-3-pro-image`, `nano-banana-pro-preview`, `gemini-3.1-flash-image-preview`).

### 3. Alternatif Instan: "Poles Studio Lokal"

- Tombol biru **"Poles Studio Lokal"** berjalan 100% di browser klien (Canvas HTML5) tanpa menggunakan kuota API/Google.
- Menerapkan filter _auto-contrast_, _brightness_, dan _saturation balance_ seketika untuk mencerahkan foto komponen di meja kerja.

### 4. Standar Kompresi Otomatis (< 100 KB)

- Setiap gambar yang diunggah melalui admin (baik foto asli, hasil AI, maupun poles lokal) otomatis diproses oleh `compressImageClient`:
  - Dimensi dibatasi maksimal **1200px**.
  - Format diekspor ke JPEG kualitas **0.68** dengan _adaptive pass_ (otomatis menurunkan ke 0.58 jika ukuran masih > 100KB).
  - Menjamin seluruh aset katalog selalu berukuran **~85 KB – 100 KB** (menghemat kuota dan mempercepat loading web hingga 90%).
- Foto diunggah ke CDN Catbox permanen, dan repositori git hanya menyimpan string URL-nya.

---

## 🔍 Optimasi SEO & Google Sitelinks

Sistem dirancang dengan kepatuhan penuh terhadap standar _Core Web Vitals_ dan pedoman mesin pencari Google:

### 1. Verifikasi & Sitemap

- **Google Search Console Tag:** `<meta name="google-site-verification" content="D9D4lVIRUuQ1KP4nHWeOJWaH5SgfFGUJf1bpLSFjkEY" />` terpasang di `<head>`.
- **Split Sitemap Generator (`scripts/generate-sitemap.mjs`)**:
  - Otomatis berjalan saat `npm run prebuild` (sebelum build Vite).
  - Menghasilkan `public/sitemap.xml` untuk domain utama (22 URL) dan `public/sitemap-jual.xml` untuk subdomain (2 URL).
- **Robots.txt:** Terbuka untuk seluruh web crawler utama dan mereferensikan kedua sitemap XML.

### 2. Schema.org Structured Data (JSON-LD)

- **`WebSite`**: Nama resmi `"Buana Computer"`, alias `"Buana Komputer Bantul"`, dan deskripsi situs.
- **`SiteNavigationElement` (Google Sitelinks)**: Mendeklarasikan 3 menu navigasi utama (_Katalog Laptop & PC, Buana Journal, Tentang Laboratorium Buana_).
- **`LocalBusiness`**: Titik koordinat GPS Bantul (`-7.8372069, 110.4148331`), nomor telepon, alamat fisik, jam buka, dan rentang harga.
- **`Product`**: Schema detail produk lengkap dengan nama, brand, harga IDR, ketersediaan stok (`InStock`/`OutOfStock`), dan rating ulasan.
- **`BreadcrumbList`**: Terpasang di seluruh rute subhalaman (`/produk/*`, `/blog/*`, `/about`, `/jual`, `/jual/form`).

---

## 📂 Struktur File & Data Layer

```
C:\Users\fadilismee\Documents\Buanacomp\
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI (lint -> build -> validate)
├── docs/
│   ├── ALIRAN.md                # Dokumentasi detail alur User & Admin
│   └── GIT.md                   # Panduan aturan commit & deploy
├── public/
│   ├── sitemap.xml              # Sitemap XML domain utama
│   ├── sitemap-jual.xml         # Sitemap XML subdomain jual.*
│   ├── robots.txt               # Pengaturan bot crawler
│   ├── manifest.json            # Web App Manifest PWA
│   └── Buanacomputer-logo.png   # Logo & favicon web
├── scripts/
│   ├── generate-sitemap.mjs     # Generator sitemap otomatis saat prebuild
│   └── validate-data.ts         # Runner validasi seluruh skema data Zod
├── src/
│   ├── components/
│   │   ├── admin/               # Komponen admin (AdminIcon, ConfirmDialog, ImageField, JsonEditor)
│   │   ├── ui/                  # Komponen UI dasar (Button, Dialog, Badge, Tabs, dll)
│   │   ├── HeroCarousel.tsx     # Slider banner homepage responsif
│   │   ├── ProductCard.tsx      # Kartu produk katalog dengan rentang varian
│   │   ├── PurePoster.tsx       # Banner poster statis footer
│   │   ├── ReviewReels.tsx      # Komponen reel testimoni pembeli
│   │   ├── SiteFooter.tsx       # Footer toko & iframe peta Google Maps
│   │   └── SiteHeader.tsx       # Topbar running text, pencarian, & keranjang WA
│   ├── data/                    # Sumber data statis (JSON-First)
│   │   ├── banners.json         # Slot banner hero & footer
│   │   ├── blog.json            # Artikel Buana Journal (7 tipe section)
│   │   ├── jualAssets.json      # Hero 3-stack & galeri lab halaman /jual
│   │   ├── products.json        # Database katalog produk & varian harga
│   │   ├── reviews.json         # Database review & rating pelanggan
│   │   ├── sellPrices.json      # Matriks harga buyback & SKU barang rusak
│   │   ├── uploads.json         # Riwayat upload gambar Catbox
│   │   └── cartStore.ts         # Global store keranjang belanja (Zustand)
│   ├── lib/
│   │   ├── adminClient.ts       # Manajemen token admin di sessionStorage
│   │   ├── adminMode.ts         # State mode mudah/teknis (Zustand persist)
│   │   ├── schemas.ts           # Skema validasi Zod untuk seluruh dataset
│   │   ├── seo.ts               # Helper deteksi host & canonical URL
│   │   └── validateAll.ts       # Logika validator 9 dataset
│   ├── routes/                  # File-based routing TanStack Start
│   │   ├── __root.tsx           # Shell HTML, font, meta tag, & JSON-LD root
│   │   ├── index.tsx            # Halaman katalog toko utama (/)
│   │   ├── produk.$productId.tsx# Halaman detail produk & Image Lightbox
│   │   ├── jual.index.tsx       # Halaman utama buyback hardware (/jual)
│   │   ├── jual.form.tsx        # Formulir pengajuan taksir (/jual/form)
│   │   ├── blog.index.tsx       # Beranda Buana Journal (/blog)
│   │   ├── blog.$articleId.tsx  # Detail artikel journal (/blog/$articleId)
│   │   ├── about.tsx            # Halaman profil lab & standar servis (/about)
│   │   ├── admin.tsx            # Shell layout & navigasi dashboard admin
│   │   ├── admin.index.tsx      # Beranda metrik operasional dashboard (/admin)
│   │   ├── admin.produk.tsx     # Editor visual produk & varian
│   │   ├── admin.jual.tsx       # Editor aset hero stack & galeri lab
│   │   ├── admin.harga.tsx      # Editor visual SKU buyback & matriks harga
│   │   ├── admin.blog.tsx       # Editor artikel journal modular
│   │   ├── admin.review.tsx     # Editor ulasan & rating
│   │   ├── admin.banner.tsx     # Editor slot banner promo
│   │   └── admin-login.tsx      # Halaman login dashboard admin
│   ├── server/
│   │   └── admin.ts             # Server Functions admin (auth, dataset CRUD, AI, Catbox)
│   ├── server.ts                # Server entry point, host detection, & redirect 308
│   ├── start.ts                 # Inisialisasi TanStack Start instance & middleware
│   └── styles.css               # Desain token Tailwind CSS 4 & kelas .adm-*
├── .env.example                 # Template variabel lingkungan
├── nitro.config.ts              # Konfigurasi engine server Nitro
├── package.json                 # Daftar dependensi & npm scripts
├── tsconfig.json                # Konfigurasi TypeScript
├── vercel.json                  # Konfigurasi URL rewrite host Vercel
└── vite.config.ts               # Konfigurasi bundler Vite 8 & LAN access
```

---

## 💻 Panduan Developer & Menjalankan Proyek

### 1. Kebutuhan Sistem

- **Node.js**: Versi `>= 22.0.0` (disarankan **Node.js v24.x** sesuai `.nvmrc` dan runtime Vercel).
- **Git**: Terpasang di sistem.

### 2. Instalasi & Setup Lingkungan

```bash
# 1. Clone repositori
git clone https://github.com/fadilismee/item-gallery-guru.git
cd item-gallery-guru

# 2. Install dependensi
npm install

# 3. Buat file .env lokal
cp .env.example .env
```

Isi variabel di file `.env`:

```env
ADMIN_PASSWORD=password-rahasia-admin-anda
GOOGLE_API_KEY=AIzaSy...  # Opsional: untuk fitur AI di dashboard admin
```

### 3. Menjalankan Server Pengembangan (Local Dev)

```bash
npm run dev
```

- Buka browser: `http://localhost:3000`
- Login admin: `http://localhost:3000/admin-login`
- **Akses LAN Kantor:** Dev server di-bind ke `host: true`, sehingga perangkat lain se-WiFi (HP/laptop teknisi) dapat mengakses via `http://<IP-PC-LOKAL>:3000/admin-login`.

> **Catatan Windows Service:** Di komputer utama lab, dev server dapat dijalankan di latar belakang melalui Windows Task Scheduler `buana-dev`.  
> Perintah restart task: `schtasks /End /TN buana-dev` lalu `schtasks /Run /TN buana-dev`.

### 4. Perintah Validasi & Build

```bash
# Validasi integritas seluruh 9 file JSON data
npm run validate

# Pengecekan linter & format kode
npm run lint

# Kompilasi build produksi (otomatis generate sitemap XML baru)
npm run build

# Menjalankan preview hasil build produksi lokal
npm run preview
```

### 5. Alur Deployment ke Vercel

Setiap kali perubahan di-push ke branch `main`:

1. **GitHub Actions CI** otomatis memvalidasi `npm ci -> npm run lint -> npm run build -> npm run validate`.
2. Jika seluruh tes hijau, **Vercel** otomatis melakukan build dan memperbarui website live di `buanacomputer.web.id` dan `jual.buanacomputer.web.id`.

---

## 📍 Kontak & Informasi Toko

- **Nama Usaha:** Buana Computer
- **WhatsApp Resmi:** [`+62 859-7922-0599`](https://wa.me/6285979220599?text=Halo%20Buana%20Computer)
- **Alamat Gerai & Workshop:**  
  Mertosan Kulon, Potorono, Kec. Banguntapan, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55196
- **Google Maps:** [Lihat Lokasi di Google Maps](https://maps.google.com/?q=-7.8372069,110.4148331)
- **Jam Operasional:**
  - **Senin – Sabtu:** 09.00 – 20.00 WIB
  - **Minggu:** 10.00 – 17.00 WIB (dengan janjian terlebih dahulu via WhatsApp)
- **Marketplace Tokopedia:** [tokopedia.com/bmccomp](https://www.tokopedia.com/bmccomp)

---

_© 2026 Buana Computer. Hak Cipta Dilindungi._
