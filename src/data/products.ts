import productsData from "./products.json";

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  sold: number;
  stock: number;
  condition: "Baru" | "Bekas";
  location: string;
  shortDescription: string;
  description: string;
  specs: { label: string; value: string }[];
  images: number;
  image: string;
  gallery: string[];
  tokopediaUrl?: string;
  shopeeUrl?: string;
  isFeatured?: boolean;
};

export const categories = ["Laptop", "PC Rakitan", "Monitor", "Komponen", "Aksesoris", "Storage"];

export const products: Product[] = productsData as Product[];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const getProduct = (id: string) => products.find((p) => p.id === id);
