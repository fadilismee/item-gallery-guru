# AGENTS — Buana Computer Catalog

## Aturan Umum

- Jangan rewrite git history yang sudah push (no force push / rebase published commits).
- Jaga branch `main` selalu buildable (`npm run lint && npm run build` lolos).
- Semua perubahan besar catat di `note-01.md` atau commit message.

## Stack & Konvensi

- TanStack Start file-based routing: `src/routes/__root.tsx` adalah shell, `routeTree.gen.ts` auto-generated (jangan edit manual).
- Alias `@/*` -> `./src/*` (lihat `tsconfig.json:26`).
- Styling: Tailwind 4 + `src/styles.css` design tokens oklch. Tambah warna baru di `:root` + `@theme inline`.
- Data produk sementara di `src/data/products.ts`. Next step bisa pindah ke `createServerFn` + DB.

## Perintah

```sh
npm i
npm run dev
npm run lint
npm run build
```
