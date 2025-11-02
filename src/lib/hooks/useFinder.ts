"use client";

import { useMutation } from "@tanstack/react-query";
import { AgeBand } from "@prisma/client";

export type ProductWithOffer = {
  id: string;
  gtin: string;
  title: string;
  description: string;
  imageUrl: string;
  ageBands: AgeBand[];
  interests: string[];
  values: string[];
  createdAt: string;
  bestOffer?: {
    id: string;
    priceCents: number;
    listPriceCents?: number;
    currency: string;
    inStock: boolean;
    url: string;
    affiliateUrl: string;
    merchant: {
      id: string;
      name: string;
      logo: string;
    };
  };
};

type SearchParams = {
  ageBand?: AgeBand;
  interests?: string[];
  values?: string[];
  minPrice?: number;
  maxPrice?: number;
  merchantIds?: string[];
  limit?: number;
  offset?: number;
};

type SearchResponse = {
  products: ProductWithOffer[];
  count: number;
  limit: number;
  offset: number;
};

/**
 * Hook to search for gift recommendations
 */
export function useFinder() {
  return useMutation({
    mutationFn: async (params: SearchParams): Promise<SearchResponse> => {
      const response = await fetch("/api/finder/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to search products");
      }

      return response.json();
    },
  });
}
