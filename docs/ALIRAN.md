# ALIRAN LENGKAP — User & Admin

Kontak toko: WA `6285979220599` · Mertosan Kulon, Potorono, Banguntapan, Bantul 55196.

## 1. USER FLOW (situs publik)

### 1.1 Katalog (`/`)
1. Pengunjung buka `/`: hero poster, kategori 6 grid, banner promo, search + filter kategori + sort (populer/termurah/termahal).
2. Grid produk responsif + badge (mis. "Produk Pilihan") → klik kartu → detail.

### 1.2 Detail produk (`/produk/:id`)
1. Galeri foto, harga + diskon, stok & qty, spesifikasi & deskripsi, produk serupa.
2. Tombol "Tanya stok & garansi" / "Hubungi Penjual" → buka WhatsApp dengan pesan prefilled berisi nama produk + harga × qty.
3. Kesepakatan & pembayaran lanjut manual via chat WA.

### 1.3 Jual hardware (`/jual`)
1. Hero banner stack 3 foto (hover: fan-out), strip statistik (1.840+ salvage, 15 mnt uji, alamat lab, CTA price list).
2. Gallery carousel "Kami Terima": grade A–D dengan panah + auto-jalan.
3. Katalog buyback: search seri + filter kategori (Semua/Motherboard/VGA/Laptop/Prosesor-RAM). Mode "Semua" = satu grid gabungan tanpa pemisah.
4. Kartu SKU: chip grade + kode SKU (MOBO-01, GPU-01, …) + foto + harga "Estimasi Penawaran" + tombol **Ajukan Jual** → `/jual/form?model=...&category=...` terisi otomatis.

### 1.4 Form pengajuan (`/jual/form`)
1. Pengguna isi: kategori hardware, kondisi, detail/model, kontak.
2. Tombol submit membangun pesan WhatsApp terstruktur (encodeURIComponent) → tombol "Kirim via WA" membuka chat dengan admin.
3. Admin menaksir → negosiasi di chat → cek lab 15 menit (COD Jogja & sekitarnya) → **dana cair instan** (cash/BCA/QRIS).

### 1.5 Blog & About
- `/blog`: daftar artikel (kategori, tag, estimasi baca) → `/blog/:slug` detail → CTA "diskusi artikel" via WA.
- `/about`: profil lab (servis mikro-elektronika, buyback, e-waste) + tombol konsultasi servis via WA.
- Footer: alamat, peta embed, link cepat, kontak WA.

### 1.6 SEO & data publik
- Sitemap di-generate saat `prebuild` (`scripts/generate-sitemap.mjs`), `robots.txt`, meta OG/Twitter, JSON-LD Product + LocalBusiness.
- Data katalog dari JSON statis: `products`, `sellPrices`, `reviews`, `blog`, `banners`, `jualAssets` (lihat `src/lib/schemas.ts` + `validateAll.ts`).

## 2. ADMIN FLOW (lokal + LAN, NONAKTIF di production)

> Server menolak semua fungsi admin saat `NODE_ENV=production` (`assertLocal` di `src/server/admin.ts`). Artinya: halaman admin hanya hidup di PC dev / LAN kantor, tidak bisa diakses dari situs production.

### 2.1 Login
1. Buka `http://localhost:3000/admin-login` (dari HP/PC se-WiFi: `http://<IP-PC>:3000/admin-login`).
2. Masukkan password = `ADMIN_PASSWORD` di file `.env` (tidak di-commit; restart dev server setelah mengubah).
3. Server (`adminLogin`) membandingkan HMAC-SHA256 password dengan `timingSafeEqual`; jika cocok → token HMAC dikembalikan.
4. Token disimpan di `sessionStorage["buana-admin-token"]` (lihat `src/lib/adminClient.ts`) — hilang saat tab/browser ditutup (logout otomatis).

### 2.2 Dashboard (`/admin`)
- Guard: tanpa token → redirect ke `/admin-login` (`src/routes/admin.tsx`).
- Drawer 5 menu: **Dashboard, Produk, Blog, Harga Jual, Review, Banner** (dataset `jualAssets` sudah terdaftar di server, halaman UI-nya menyusul).
- Dashboard memanggil `adminStatus` → ringkasan: nilai inventaris, stok ready/hampir habis, produk featured, top seller, artikel terbaru + estimasi pembaca, rata-rata rating review, statistik tabel harga, jumlah banner hero.
- Toggle **Mode Mudah** (default, form sederhana) vs **Mode Teknis** (editor JSON + panel git + detail validasi) di header.

### 2.3 Kelola konten per halaman
1. Halaman memuat dataset via `adminGetDataset` (baca `src/data/*.json` di server).
2. Field gambar punya tombol **Upload** (file → POST `adminUploadImage` → upload ke Catbox maks 10MB → URL otomatis terisi) + tombol **Gallery** (pilih dari `adminListUploads` = `src/data/uploads.json`, 200 terbaru).
3. Tombol **Simpan** → `adminSaveDataset` → server validasi dulu dengan skema Zod (`src/lib/schemas.ts`); gagal = pesan error detail, file tidak ditulis. Berhasil = JSON ditulis lokal ke `src/data/`.
4. Header menampilkan badge jumlah file data yang "kotor" (belum diterbitkan) via `adminGitStatus`.

### 2.4 Terbitkan Perubahan → deploy
1. Klik **Terbitkan Perubahan** di header → konfirmasi (`ConfirmDialog`) → `adminGitCommitPush` dengan pesan commit (min. 5 karakter).
2. Server menjalankan: `git add src/data public/sitemap.xml` → `git commit` → `git push`. **Hanya file data + sitemap** yang ikut — perubahan kode (routes, komponen) TIDAK ikut, harus commit manual via terminal (lihat `docs/GIT.md`).
3. Push ke `main` memicu **Vercel auto-deploy** → situs production update beberapa menit kemudian.
4. Verifikasi produksi: buka URL publik, cek halaman yang diubah.

### 2.5 Verifikasi & operasional lokal
- `npm run validate` → validasi 9 file data + keunikan id/slug (dipakai juga oleh `adminValidate` di dashboard).
- `npm run lint` (ESLint + Prettier) dan `npm run build` (Vite + Nitro) harus lolos sebelum commit/push.
- Dev server jalan sebagai scheduled task Windows `buana-dev` (port 3000, `host: true` untuk akses LAN). Restart: `schtasks /End /TN buana-dev` lalu `schtasks /Run /TN buana-dev`.
- File otentikasi: `ADMIN_PASSWORD` hanya di `.env` lokal (+ Vercel env bila perlu); **jangan pernah commit**.
