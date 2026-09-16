import { z } from "zod";
import sellPricesData from "./sellPrices.json";
import {
  AppraisalCategorySchema,
  AppraisalConditionSchema,
  BuybackCategorySchema,
  BuybackItemSchema,
  SellPriceSchema,
  SellPricesDataSchema,
} from "@/lib/schemas";

export type SellPrice = z.infer<typeof SellPriceSchema>;
export type BuybackCategory = z.infer<typeof BuybackCategorySchema>;
export type BuybackItem = z.infer<typeof BuybackItemSchema>;
export type AppraisalCategory = z.infer<typeof AppraisalCategorySchema>;
export type AppraisalCondition = z.infer<typeof AppraisalConditionSchema>;

// Throws at startup/build with a clear message if sellPrices.json is malformed.
const parsed = SellPricesDataSchema.parse(sellPricesData);

export const sellPrices: SellPrice[] = parsed.sellPrices;
export const buybackItems: BuybackItem[] = parsed.buybackItems;
export const appraisalCategories: { id: AppraisalCategory; label: string }[] =
  parsed.appraisalCategories;
export const appraisalConditions: { id: AppraisalCondition; label: string }[] =
  parsed.appraisalConditions;
export const appraisalRates: Record<
  AppraisalCategory,
  Record<AppraisalCondition, string>
> = parsed.appraisalRates;

// "count" selalu dihitung dari jumlah item aktual supaya tidak drift dari data.
export const buybackCategoryMeta: Record<
  BuybackCategory,
  { title: string; desc: string; count: string }
> = (Object.keys(parsed.buybackCategoryMeta) as BuybackCategory[]).reduce(
  (acc, key) => {
    const meta = parsed.buybackCategoryMeta[key];
    if (!meta) throw new Error(`buybackCategoryMeta missing key: ${key}`);
    const n = parsed.buybackItems.filter((i) => i.category === key).length;
    acc[key] = { title: meta.title, desc: meta.desc, count: `${n} SKU Terdaftar` };
    return acc;
  },
  {} as Record<BuybackCategory, { title: string; desc: string; count: string }>,
);
