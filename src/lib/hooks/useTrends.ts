// src/lib/hooks/useTrends.ts
import { useQuery } from "@tanstack/react-query";
import { TrendingProduct } from "../jobs/compute-trends";

interface TrendsResponse {
  ageBand?: string;
  trends?: TrendingProduct[];
  trends?: Record<string, TrendingProduct[]>;
}

/**
 * Hook to fetch trending products for a specific age band
 */
export function useTrends(ageBand?: string) {
  return useQuery<TrendsResponse>({
    queryKey: ["trends", ageBand],
    queryFn: async () => {
      const url = ageBand
        ? `/api/trends?ageBand=${encodeURIComponent(ageBand)}`
        : `/api/trends`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch trends");
      }

      return response.json();
    },
    // Cache for 24 hours since trends update daily
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Hook to fetch all trends across all age bands
 */
export function useAllTrends() {
  return useQuery<Record<string, TrendingProduct[]>>({
    queryKey: ["trends", "all"],
    queryFn: async () => {
      const response = await fetch("/api/trends");

      if (!response.ok) {
        throw new Error("Failed to fetch all trends");
      }

      const data = await response.json();
      return data.trends || {};
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}
