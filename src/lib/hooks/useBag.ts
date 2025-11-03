// src/lib/hooks/useBag.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface BagItem {
  id: string;
  productOfferId: string;
  quantity: number;
  isSurprise: boolean;
  backupOfferIds: string[];
  alertEnabled: boolean;
  createdAt: string;
  claim: {
    id: string;
    claimerName: string;
    claimerEmail: string | null;
    status: string;
    claimedAt: string;
  } | null;
  productOffer: {
    id: string;
    priceCents: number;
    productId: string;
    product: {
      id: string;
      title: string;
      primaryImageUrl: string | null;
    };
  };
}

export interface Bag {
  id: string;
  childId: string;
  shareToken: string;
  totalBudgetCents: number | null;
  createdAt: string;
  updatedAt: string;
  items: BagItem[];
  child: {
    id: string;
    nickname: string;
    ageBand: string;
  };
}

interface AddToBagInput {
  productOfferId: string;
  childId: string;
  quantity?: number;
  isSurprise?: boolean;
}

interface UpdateBagItemInput {
  quantity?: number;
  isSurprise?: boolean;
  alertEnabled?: boolean;
}

/**
 * Hook to fetch bag by bag ID (for authenticated parent)
 */
export function useBag(bagId: string | null | undefined, pollingInterval?: number) {
  return useQuery<Bag>({
    queryKey: ["bag", bagId],
    queryFn: async () => {
      if (!bagId) throw new Error("No bag ID provided");

      const response = await fetch(`/api/bags/${bagId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch bag");
      }
      const data = await response.json();
      return data.bag;
    },
    enabled: !!bagId,
    refetchInterval: pollingInterval, // Enable polling if interval is provided
    refetchIntervalInBackground: true,
  });
}

/**
 * Hook to fetch shared bag by token (public, no auth)
 */
export function useSharedBag(token: string | null | undefined) {
  return useQuery<Bag>({
    queryKey: ["sharedBag", token],
    queryFn: async () => {
      if (!token) throw new Error("No token provided");

      const response = await fetch(`/api/shared/bags/${token}`);
      if (!response.ok) {
        throw new Error("Failed to fetch shared bag");
      }
      const data = await response.json();
      return data.bag;
    },
    enabled: !!token,
    refetchInterval: 5000, // Poll every 5 seconds for real-time claim updates
    refetchIntervalInBackground: true,
  });
}

/**
 * Hook to add item to bag
 */
export function useAddToBag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddToBagInput) => {
      // We use "new" as bagId to auto-create bag if it doesn't exist
      const response = await fetch(`/api/bags/new/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add item to bag");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate bag queries to refetch with new item
      queryClient.invalidateQueries({ queryKey: ["bag"] });
      // Also invalidate children query to update bag status
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
}

/**
 * Hook to update bag item (quantity, surprise status, alerts)
 */
export function useUpdateBagItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      ...input
    }: UpdateBagItemInput & { itemId: string }) => {
      const response = await fetch(`/api/bag-items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update bag item");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate bag queries to refetch with updated item
      queryClient.invalidateQueries({ queryKey: ["bag"] });
    },
  });
}

/**
 * Hook to remove item from bag
 */
export function useRemoveBagItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/bag-items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove item from bag");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate bag queries to refetch without removed item
      queryClient.invalidateQueries({ queryKey: ["bag"] });
    },
  });
}

/**
 * Hook to generate/regenerate share link
 */
export function useGenerateShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bagId: string) => {
      const response = await fetch(`/api/bags/${bagId}/share`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate share link");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate bag queries to get new share token
      queryClient.invalidateQueries({ queryKey: ["bag"] });
    },
  });
}

/**
 * Hook to claim a bag item (public, no auth)
 */
export function useClaimBagItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      claimerName,
      claimerEmail,
    }: {
      itemId: string;
      claimerName: string;
      claimerEmail?: string;
    }) => {
      const response = await fetch(`/api/bag-items/${itemId}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ claimerName, claimerEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to claim item");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate bag and shared bag queries to show claim
      queryClient.invalidateQueries({ queryKey: ["bag"] });
      queryClient.invalidateQueries({ queryKey: ["sharedBag"] });
    },
  });
}

/**
 * Hook to unclaim a bag item (within 24 hours)
 */
export function useUnclaimBagItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/bag-items/${itemId}/claim`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unclaim item");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate bag and shared bag queries to remove claim
      queryClient.invalidateQueries({ queryKey: ["bag"] });
      queryClient.invalidateQueries({ queryKey: ["sharedBag"] });
    },
  });
}
