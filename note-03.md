# note-03 — Bot Telegram Full CRUD + JSON Aman + Banner + Badge 4.5

> 12 Sep 2026 — Build Mode | PC Windows 10/11 + Python 3.10+ + PAT sudah ada | Catbox | Detail lengkap | JSON aman | Tokped/Shopee hidden | Specs ketik baris | Banner footer = poster1 | Badge semua card

## 1. Data Aman — src/data/products.json

- **Sekarang:** `src/data/products.ts:1` type `Product` 17 field (`id, name, brand, category 6, price, oldPrice?, rating, sold, stock, condition, location, shortDescription, description, specs:[], images, image, gallery`) 12 items hardcode. `formatPrice:392` + `getProduct:399` util. `cartStore.ts:1` zustand persist localStorage. `src/img/Buana-poster1.png` hero.
- **Jadi:** Pindah `products:27` array ke `src/data/products.json` (murni JSON). Keep `type Product` + `formatPrice`/`getProduct` di `products.ts` re-export `import products from "./products.json"`. Aktifkan `tsconfig.json` `resolveJsonModule: true`. Tambah optional `tokopediaUrl?: string; shopeeUrl?: string;` di type. `stock` wajib, `rating` default `4.5` untuk baru, `specs` array, `oldPrice` potongan. Vite + `nitro` (`vite.config.ts:9`) bundle JSON, Vercel `git push` trigger deploy. Aman: `src/` (bukan `public/`) untuk SSR `produk.$productId.tsx:14` loader.

## 2. Bot di PC C:\Project\Kerjaan\Buanacomp\tools/bot.py

- **Jalan:** `python-telegram-bot` polling (Windows Task Scheduler At startup + `bot.log` + auto-restart). Whitelist `chat_id`. `.env` (`TELEGRAM_TOKEN`, `GITHUB_TOKEN`, `GITHUB_REPO=fadilismee/item-gallery-guru`) di `.gitignore:14`. PAT sudah ada.
- **Flow simless ketik baris (detail lengkap):**
  ```
  /add → foto 1-4 → Catbox → url → Nama? → Brand? → Kategori (Laptop/PC Rakitan/Monitor/Komponen/Aksesoris/Storage) → Harga? → OldPrice? (kosong=tanpa badge -%) → Stok? → Kondisi Baru/Bekas? → ShortDesc? → Deskripsi? → Specs: ketik "Prosesor: i7-13650HX" per baris → /done → Tokopedia link? (kosong=hidden) → Shopee link? → Preview → /confirm → tulis products.json → git add/commit/push → Vercel deploy
  /edit <id> → pilih field → update | /hapus <id> | /list (12 produk + stock) | /stock <id> <angka>
  /banner hero → kirim 1-3 foto → Catbox → update banners.json/hero | /banner footer → kirim foto → samain poster1
  ```
- **Image:** Catbox `https://catbox.moe/user/api.php` `reqtype=fileupload` (200MB, unlimited, tanpa key, 3 baris `requests`) → `https://files.catbox.moe/abc.jpg` embed `<img>` enteng. 5-20/hari sangat aman.

## 3. UI — Tokped/Shopee + Badge + Banner

- **Tombol:** `ProductCard.tsx:61` (`+ Keranjang` `h-8`) → tambah `grid 2 cols mt-2` → jika `tokopediaUrl` ada → `<Button asChild className="bg-[#03AC0E] hover:bg-[#03940C] text-white"><img src="https://cdn.simpleicons.org/tokopedia/FFFFFF" class="h-3.5 w-3.5"> Tokopedia</Button>` else hidden. Shopee `bg-[#EE4D2D]` `shopee/FFFFFF`. `produk.$productId.tsx:159` row `flex gap-2 mt-3` sama. `target="_blank" rel="noreferrer"`.
- **Badge semua card:** `ProductCard.tsx:57` di atas `image` → `span absolute left-4 top-10 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full` `★ 4.5 Produk Pilihan` (hardcode, tidak baca rating).
- **Banner:** `HeroCarousel.tsx:11` `defaultImages=[poster1,poster2,poster3]` tetap. `PurePoster.tsx:1` `reff-v2.png` → ganti `import poster1 from "@/img/Buanacomputer-poster1.png"` biar footer samain atas (sesuai request).

## 4. File Terdampak (saat gas build)

- `tools/bot.py` (baru) + `.env.example`
- `src/data/products.json` (baru) + `src/data/products.ts` (re-export)
- `src/components/ProductCard.tsx`, `src/routes/produk.$productId.tsx`, `src/components/PurePoster.tsx`
- `tsconfig.json` (resolveJsonModule), `.gitignore` (sudah ada `*.local`)

## 5. Verifikasi

- `python tools/bot.py` polling → `/add` test 1 produk lengkap → cek `products.json` → `git log` → Vercel `Build Completed` → `buana-computer.vercel.app` tampil produk baru + badge + tombol Tokped/Shopee.
