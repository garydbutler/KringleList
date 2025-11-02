import { z } from "zod";

// Age Band Schema
export const AgeBandSchema = z.enum(["0-2", "3-4", "5-7", "8-10", "11-13", "14+"]);

// Child Profile Schema
export const ChildProfileSchema = z.object({
  nickname: z.string().min(2, "Nickname must be at least 2 characters").max(20, "Nickname must be at most 20 characters"),
  ageBand: AgeBandSchema,
  interests: z.array(z.string()).min(1, "Select at least 1 interest").max(8, "Select at most 8 interests"),
  values: z.array(z.string()).max(8, "Select at most 8 values").optional(),
  budgetCents: z.number().int().min(0).max(100000, "Budget must be at most $1,000").optional(),
});

export type ChildProfile = z.infer<typeof ChildProfileSchema>;

// Bag Item Schema
export const BagItemSchema = z.object({
  productOfferId: z.string().uuid("Invalid product offer ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
  isSurprise: z.boolean().default(false),
  backupOfferIds: z.array(z.string().uuid()).default([]),
  alertEnabled: z.boolean().default(false),
});

export type BagItem = z.infer<typeof BagItemSchema>;

// Claim Schema
export const ClaimSchema = z.object({
  claimerName: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  claimerEmail: z.string().email("Invalid email address").optional(),
});

export type Claim = z.infer<typeof ClaimSchema>;

// Campaign Schema
export const CampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(200, "Name must be at most 200 characters"),
  startDate: z.date(),
  endDate: z.date(),
  targeting: z.object({
    ageBands: z.array(AgeBandSchema).optional(),
    interests: z.array(z.string()).optional(),
    values: z.array(z.string()).optional(),
  }).optional(),
  pricingModel: z.enum(["FLAT", "CPC", "HYBRID"]),
  flatFeeCents: z.number().int().min(0).optional(),
  cpcCents: z.number().int().min(0).optional(),
  dailyBudgetCents: z.number().int().min(0).optional(),
  totalBudgetCents: z.number().int().min(0).optional(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

// Alert Settings Schema
export const AlertSettingsSchema = z.object({
  enabled: z.boolean(),
  priceDropThreshold: z.number().min(0).max(100).default(10), // percentage
  restockEnabled: z.boolean().default(true),
  quietHoursStart: z.number().min(0).max(23).optional(),
  quietHoursEnd: z.number().min(0).max(23).optional(),
});

export type AlertSettings = z.infer<typeof AlertSettingsSchema>;

// Search Query Schema
export const SearchQuerySchema = z.object({
  query: z.string().optional(),
  ageBand: AgeBandSchema.optional(),
  interests: z.array(z.string()).optional(),
  values: z.array(z.string()).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  merchants: z.array(z.string()).optional(),
  inStockOnly: z.boolean().optional(),
  sortBy: z.enum(["relevance", "price-asc", "price-desc", "popularity", "newest"]).default("relevance"),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
