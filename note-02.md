# note-02 — Reels Review + Laman Jual Barang Rusak

> Build mode: 10 Sep 2026 | Konfirmasi user: gas build sesuai plan
> Konteks: Reels auto-scroll sebelum footer (global), 8/12 mock statis local, image via link internet nanti, shape 9:16 reels, image+text h1/h2 overlay vs video full. Jual URL `/jual`, placeholder ke WA 6285979220599, tanpa upload file, estimasi via WA.

## 1. Reels Review — Global

- **Data:** `src/data/reviews.ts` — type `ReviewReel { id, name, rating, title, text, mediaType: "image"|"video", mediaUrl, productLabel?, date }` — 12 mock (8 image + 4 video) sample picsum/sample-videos
- **Component:** `src/components/ReviewReels.tsx` — card `w-[148px] sm:w-[176px] lg:w-[192px] aspect-[9/16] rounded-2xl border overflow-hidden` — image: `ImageCanvas`/img + gradient bottom `title`+`text`+rating; video: `<video autoPlay muted loop playsInline object-cover>` full
- **Animasi:** duplicate array untuk infinite, `src/styles.css` tambah `@keyframes marquee { from translateX(0) to -50% }` + `.animate-marquee 28s linear infinite` pause hover, `prefers-reduced-motion`
- **Integrasi:** sisip `<ReviewReels />` sebelum `<SiteFooter />` di `src/routes/index.tsx:176` & `src/routes/produk.$productId.tsx:190` & `src/routes/jual.tsx` (global dekat footer). Alternatif global `__root.tsx:106` jika footer dipusatkan nanti.

## 2. Laman Jual Barang Rusak — `/jual`

- **Route:** `src/routes/jual.tsx` — `createFileRoute("/jual")` + SEO Buana Computer
- **Kategori:** `sellCategories = ["Laptop Rusak","PC Rakitan Rusak","HDD/SSD Rusak","HP Rusak","Mainboard","CPU","GPU","Lainnya"]`
- **Form:** `react-hook-form` + `zod` (sudah di deps) — fields: kategori select, brand/model, kondisi (Mati Total/Rusak Sebagian), deskripsi kerusakan, perkiraan harga harapan, nama, WA, alamat. Tidak ada file upload — foto via WA. Submit → `waHref = https://wa.me/6285979220599?text=encodeURIComponent(template)` + card sukses lokal.
- **Nav:** `src/components/SiteHeader.tsx:16` tambah `<Link to="/jual">Jual</Link>`
- **Verifikasi:** `npx tsc --noEmit`, `npx eslint .`, `npm run build`, fetch `GET /`, `/produk/:id`, `/jual` 200

## Eksekusi

1. Buat reviews.ts + ReviewReels.tsx + CSS marquee
2. Sisip Reels di index/produk/jual
3. Buat jual.tsx + header link
4. Verifikasi build/fetch
