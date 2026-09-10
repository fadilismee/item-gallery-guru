# Buana Computer — Katalog Laptop & PC

Katalog toko untuk Buana Computer: menampilkan semua produk laptop, PC rakitan, monitor, komponen, storage, dan aksesoris. Terinspirasi dari microbatam.com dan UX marketplace (Tokopedia/Shopee) dengan 2 halaman utama: katalog & detail produk.

Semua gambar menggunakan placeholder `ImageCanvas` (canvas kosong border-dashed) agar mudah diganti foto asli nanti.

## Fitur

- **Katalog** (`/`): hero poster, kategori 6 grid, banner promo, search + filter kategori + sort (populer/termurah/termahal), grid responsif 2/3/5 kolom, SEO meta OG
- **Detail Produk** (`/produk/$productId`): loader `notFound`, galeri canvas, harga + diskon, stok/qty, tombol Hubungi Penjual (WA), spesifikasi & deskripsi, related products
- **Branding Buana Computer**: header `BC`, footer kontak WA + alamat Bantul, `lang="id"`
- **Data**: `src/data/products.ts` (12 produk mock, mudah ganti ke API/DB)

## Tech Stack

- TanStack Start + TanStack Router + React 19 + Vite 8 + Nitro (node-server)
- Tailwind CSS 4 + shadcn/ui (new-york, slate)
- TypeScript strict, ESLint + Prettier

## Development

```sh
npm i
npm run dev      # vite dev
npm run build    # vite build (Nitro)
npm run preview  # vite preview
npm run lint     # eslint
npm run format   # prettier --write .
```

## Struktur Penting

```
src/routes/index.tsx              -> katalog
src/routes/produk.$productId.tsx  -> detail
src/components/ProductCard.tsx, ImageCanvas.tsx, SiteHeader.tsx, SiteFooter.tsx
src/data/products.ts              -> data produk
src/server.ts / src/start.ts      -> SSR entry (Opsi A: simple proxy)
vite.config.ts                    -> vanilla vite (konfigurasi mandiri)
```

## Kontak

- WhatsApp: 6285979220599
- Alamat: Mertosan Kulon, Potorono, Kec. Banguntapan, Kabupaten Bantul, DI Yogyakarta 55196
