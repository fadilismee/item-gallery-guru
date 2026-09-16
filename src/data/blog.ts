import { z } from "zod";
import blogData from "./blog.json";
import { BlogDataSchema, BlogSectionSchema, BlogArticleSchema } from "@/lib/schemas";

export type BlogSection = z.infer<typeof BlogSectionSchema>;
export type BlogArticle = z.infer<typeof BlogArticleSchema>;
export type TagTone = BlogArticle["tagTone"];

// Throws at startup/build with a clear message if blog.json is malformed.
const parsed = BlogDataSchema.parse(blogData);

export const blogCategories: string[] = parsed.categories;
export const blogArticles: BlogArticle[] = parsed.articles;

export function getArticle(slug: string): BlogArticle | undefined {
  return blogArticles.find((a) => a.slug === slug);
}

export function relatedArticles(slug: string, limit = 3): BlogArticle[] {
  const current = getArticle(slug);
  const rest = blogArticles.filter((a) => a.slug !== slug);
  if (!current) return rest.slice(0, limit);
  const sameCat = rest.filter((a) => a.category === current.category);
  const others = rest.filter((a) => a.category !== current.category);
  return [...sameCat, ...others].slice(0, limit);
}
