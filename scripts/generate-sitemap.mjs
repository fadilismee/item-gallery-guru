/**
 * npm prebuild — generate public/sitemap.xml dari data aktual.
 * Sumber: src/data/products.json + src/data/blog.json + rute statis.
 * Jangan edit public/sitemap.xml manual; file ini ditimpa setiap build.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://buanacomputer.web.id";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const load = (p) => JSON.parse(readFileSync(join(root, p), "utf-8"));

const today = new Date().toISOString().slice(0, 10);

const products = load("src/data/products.json");
const blog = load("src/data/blog.json");

const urls = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/jual", changefreq: "monthly", priority: "0.8" },
  { loc: "/jual/form", changefreq: "monthly", priority: "0.6" },
  { loc: "/about", changefreq: "monthly", priority: "0.6" },
  { loc: "/blog", changefreq: "weekly", priority: "0.8" },
  ...products.map((p) => ({
    loc: `/produk/${p.id}`,
    changefreq: "weekly",
    priority: p.isFeatured ? "0.9" : "0.7",
  })),
  ...blog.articles.map((a) => ({
    loc: `/blog/${a.slug}`,
    changefreq: "monthly",
    priority: "0.7",
  })),
];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (u) =>
        `  <url>\n    <loc>${SITE}${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join("\n") +
  `\n</urlset>\n`;

writeFileSync(join(root, "public", "sitemap.xml"), xml, "utf-8");
console.log(
  `sitemap.xml: ${urls.length} URL (${products.length} produk, ${blog.articles.length} artikel)`,
);
