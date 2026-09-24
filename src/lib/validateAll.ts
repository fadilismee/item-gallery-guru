import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ZodError, type ZodTypeAny } from "zod";
import {
  BannersDataSchema,
  BlogDataSchema,
  ProductsDataSchema,
  ReviewsDataSchema,
  UploadsDataSchema,
} from "./schemas.ts";

export type ValidationResult = {
  file: string;
  ok: boolean;
  issues: string[];
};

const TARGETS: [string, ZodTypeAny][] = [
  ["src/data/products.json", ProductsDataSchema],
  ["src/data/reviews.json", ReviewsDataSchema],
  ["src/data/blog.json", BlogDataSchema],
  ["src/data/banners.json", BannersDataSchema],
  ["src/data/uploads.json", UploadsDataSchema],
];

const load = (rootDir: string, p: string): unknown =>
  JSON.parse(readFileSync(join(rootDir, p), "utf-8"));

export function validateAllData(rootDir: string): {
  results: ValidationResult[];
  failed: boolean;
} {
  const results: ValidationResult[] = [];
  let failed = false;

  for (const [file, schema] of TARGETS) {
    try {
      schema.parse(load(rootDir, file));
      results.push({ file, ok: true, issues: [] });
    } catch (e) {
      failed = true;
      const issues: string[] =
        e instanceof ZodError
          ? e.issues.slice(0, 25).map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
          : [String(e)];
      results.push({ file, ok: false, issues });
    }
  }

  // Cross-check: id & slug harus unik
  try {
    const products = load(rootDir, "src/data/products.json") as { id: string }[];
    const dupes = findDupes(products.map((p) => p.id));
    if (dupes.length > 0) {
      failed = true;
      results.push({ file: "unik product.id", ok: false, issues: dupes });
    } else {
      results.push({ file: `unik product.id (${products.length})`, ok: true, issues: [] });
    }
    const blog = load(rootDir, "src/data/blog.json") as { articles: { slug: string }[] };
    const slugDupes = findDupes(blog.articles.map((a) => a.slug));
    if (slugDupes.length > 0) {
      failed = true;
      results.push({ file: "unik blog.slug", ok: false, issues: slugDupes });
    } else {
      results.push({
        file: `unik blog.slug (${blog.articles.length})`,
        ok: true,
        issues: [],
      });
    }
  } catch {
    // error schema sudah dilaporkan di atas
  }

  return { results, failed };
}

function findDupes(values: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const v of values) {
    if (seen.has(v)) dupes.add(v);
    seen.add(v);
  }
  return [...dupes];
}
