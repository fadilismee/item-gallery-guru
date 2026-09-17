import { z } from "zod";
import productsData from "./products.json";
import { ProductSchema, ProductVariantSchema, ProductsDataSchema } from "@/lib/schemas";

export type Product = z.infer<typeof ProductSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

// Throws at startup/build with a clear message if products.json is malformed.
export const products: Product[] = ProductsDataSchema.parse(productsData);

export const categories = ["Laptop", "PC Rakitan", "Monitor", "Komponen", "Aksesoris", "Storage"];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const getProduct = (id: string) => products.find((p) => p.id === id);
