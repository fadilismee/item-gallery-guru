import { z } from "zod";
import reviewsData from "./reviews.json";
import { ReviewSchema, ReviewsDataSchema } from "@/lib/schemas";

export type ReviewReel = z.infer<typeof ReviewSchema>;

// Throws at startup/build with a clear message if reviews.json is malformed.
export const reviewReels: ReviewReel[] = ReviewsDataSchema.parse(reviewsData);
