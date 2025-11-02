// Age bands
export const AGE_BANDS = ["0-2", "3-4", "5-7", "8-10", "11-13", "14+"] as const;

export type AgeBand = (typeof AGE_BANDS)[number];

// Interests
export const INTERESTS = [
  "Art & Crafts",
  "Books",
  "Building & Construction",
  "Dolls & Figures",
  "Electronics",
  "Games & Puzzles",
  "Music & Instruments",
  "Outdoor & Sports",
  "Science & STEM",
  "Stuffed Animals",
  "Vehicles & Remote Control",
  "Dress-Up & Pretend Play",
] as const;

// Values
export const VALUES = [
  "STEM",
  "screen-free",
  "sensory-friendly",
  "eco",
  "educational",
  "creative",
  "active",
  "quiet",
] as const;

// Price bands for filtering
export const PRICE_BANDS = [
  { label: "Under $15", min: 0, max: 1500 },
  { label: "$15 - $30", min: 1500, max: 3000 },
  { label: "$30 - $50", min: 3000, max: 5000 },
  { label: "$50 - $100", min: 5000, max: 10000 },
  { label: "Over $100", min: 10000, max: Infinity },
] as const;

// Budget thermometer thresholds
export const BUDGET_THRESHOLDS = {
  GREEN: 0.75, // < 75% = green
  YELLOW: 0.95, // 75-95% = yellow
  // > 95% = red
} as const;
