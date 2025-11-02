"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Child, AgeBand } from "@prisma/client";

type CreateChildInput = {
  nickname: string;
  ageBand: AgeBand;
  interests: string[];
  values?: string[];
  budgetCents?: number;
};

type UpdateChildInput = {
  nickname?: string;
  ageBand?: AgeBand;
  interests?: string[];
  values?: string[];
  budgetCents?: number;
};

/**
 * Hook to fetch all children for the current user
 */
export function useChildren() {
  return useQuery<{ children: Child[] }>({
    queryKey: ["children"],
    queryFn: async () => {
      const response = await fetch("/api/children");
      if (!response.ok) {
        throw new Error("Failed to fetch children");
      }
      return response.json();
    },
  });
}

/**
 * Hook to fetch a single child by ID
 */
export function useChild(id: string) {
  return useQuery<{ child: Child }>({
    queryKey: ["children", id],
    queryFn: async () => {
      const response = await fetch(`/api/children/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch child");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new child
 */
export function useCreateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateChildInput) => {
      const response = await fetch("/api/children", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create child");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
}

/**
 * Hook to update a child
 */
export function useUpdateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateChildInput }) => {
      const response = await fetch(`/api/children/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update child");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      queryClient.invalidateQueries({ queryKey: ["children", variables.id] });
    },
  });
}

/**
 * Hook to delete a child
 */
export function useDeleteChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/children/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete child");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
}
