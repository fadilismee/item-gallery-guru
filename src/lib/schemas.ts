import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Produk (src/data/products.json)                                     */
/* ------------------------------------------------------------------ */

export const ProductVariantSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  oldPrice: z.number().int().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
});

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  price: z.number().int().nonnegative(),
  oldPrice: z.number().int().positive().optional(),
  rating: z.number().min(0).max(5),
  sold: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  condition: z.enum(["Baru", "Bekas"]),
  location: z.string().min(1),
  shortDescription: z.string().min(1),
  description: z.string().min(1),
  specs: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).min(1),
  images: z.number().int().nonnegative(),
  image: z.string().min(1),
  gallery: z.array(z.string().min(1)).min(1),
  tokopediaUrl: z.string().optional(),
  shopeeUrl: z.string().optional(),
  isFeatured: z.boolean().optional(),
  variants: z.array(ProductVariantSchema).optional(),
});

export const ProductsDataSchema = z.array(ProductSchema).min(1);

/* ------------------------------------------------------------------ */
/* Review (src/data/reviews.json)                                      */
/* ------------------------------------------------------------------ */

export const ReviewSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rating: z.number().min(0).max(5),
  title: z.string().min(1),
  text: z.string().min(1),
  mediaType: z.enum(["image", "video"]),
  mediaUrl: z.string().min(1),
  productLabel: z.string().optional(),
  date: z.string().min(1),
});

export const ReviewsDataSchema = z.array(ReviewSchema);

/* ------------------------------------------------------------------ */
/* Blog (src/data/blog.json) — 7 tipe section                          */
/* ------------------------------------------------------------------ */

export const LeadSectionSchema = z.object({
  kind: z.literal("lead"),
  text: z.string().min(1),
});

export const SpecSectionSchema = z.object({
  kind: z.literal("spec"),
  title: z.string().min(1),
  badge: z.string().min(1),
  items: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
        sub: z.string().min(1),
      }),
    )
    .min(1),
});

export const PartSectionSchema = z.object({
  kind: z.literal("part"),
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
});

export const AdviceSectionSchema = z.object({
  kind: z.literal("advice"),
  title: z.string().min(1),
  text: z.string().min(1),
});

export const ChartSectionSchema = z.object({
  kind: z.literal("chart"),
  title: z.string().min(1),
  hint: z.string().min(1),
  caption: z.string().min(1),
  bars: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
        width: z.number().min(0).max(100),
        highlight: z.boolean().optional(),
      }),
    )
    .min(1),
});

export const QuoteSectionSchema = z.object({
  kind: z.literal("quote"),
  text: z.string().min(1),
  cite: z.string().min(1),
});

export const TakeawaySectionSchema = z.object({
  kind: z.literal("takeaway"),
  items: z.array(z.object({ title: z.string().min(1), text: z.string().min(1) })).min(1),
});

export const BlogSectionSchema = z.discriminatedUnion("kind", [
  LeadSectionSchema,
  SpecSectionSchema,
  PartSectionSchema,
  AdviceSectionSchema,
  ChartSectionSchema,
  QuoteSectionSchema,
  TakeawaySectionSchema,
]);

export const BlogArticleSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug harus lowercase alfanumerik + strip"),
  category: z.string().min(1),
  tag: z.string().min(1),
  tagTone: z.enum(["pri", "sec", "tertiary"]),
  serial: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  author: z.string().min(1),
  role: z.string().min(1),
  date: z.string().min(1),
  readMinutes: z.number().int().positive(),
  readers: z.string().min(1),
  image: z.string().min(1),
  labLabel: z.string().min(1),
  labValue: z.string().min(1),
  cta: z.string().min(1),
  heroSpecs: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).optional(),
  sections: z.array(BlogSectionSchema).min(1),
  tags: z.array(z.string().min(1)).min(1),
});

export const BlogDataSchema = z.object({
  categories: z.array(z.string().min(1)).min(1),
  articles: z.array(BlogArticleSchema).min(1),
});

/* ------------------------------------------------------------------ */
/* Banner promo homepage toko (src/data/banners.json)                  */
/* ------------------------------------------------------------------ */

export const BannersDataSchema = z.object({
  hero: z.array(z.string()),
  footer: z.string(),
});

/* ------------------------------------------------------------------ */
/* Pengaturan payment gateway toko (src/data/paymentSettings.json)      */
/* Publik & commit ke git (tanpa secret!). Secret API key tersimpan di  */
/* src/data/paymentSecrets.json yang gitignored + hanya bisa dibaca    */
/* lewat dashboard admin lokal.                                         */
/* ------------------------------------------------------------------ */

export const PaymentMethodSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  enabled: z.boolean(),
});

/** Rekening bank / e-wallet milik toko untuk pembayaran manual (bukan secret!). */
export const ManualAccountSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(["bank", "ewallet"]),
  number: z.string(),
  holder: z.string(),
});

export const PaymentShippingSchema = z.object({
  javaFee: z.number().int().nonnegative(),
  outsideJavaFee: z.number().int().nonnegative(),
});

export const PaymentSettingsDataSchema = z.object({
  activeGateway: z.enum(["tripay", "tokopay", "manual"]),
  mode: z.enum(["sandbox", "live"]),
  methods: z.array(PaymentMethodSchema).min(1),
  staticQrisUrl: z.string(),
  shipping: PaymentShippingSchema,
  manualAccounts: z.array(ManualAccountSchema).default([]),
});

/* ------------------------------------------------------------------ */
/* Media library (src/data/uploads.json) — daftar link hasil upload     */
/* ------------------------------------------------------------------ */

export const UploadsDataSchema = z.array(
  z.object({
    url: z.string().min(1),
    label: z.string(),
    at: z.string(),
  }),
);
