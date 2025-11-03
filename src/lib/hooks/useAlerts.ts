// src/lib/hooks/useAlerts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to fetch alert history
 */
export function useAlertHistory() {
  return useQuery({
    queryKey: ["alerts", "history"],
    queryFn: async () => {
      const response = await fetch("/api/alerts/history");

      if (!response.ok) {
        throw new Error("Failed to fetch alert history");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to toggle alerts for a bag item
 */
export function useToggleAlerts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      enabled,
    }: {
      itemId: string;
      enabled: boolean;
    }) => {
      const response = await fetch(`/api/bag-items/${itemId}/alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle alerts");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate bag queries to refresh alert status
      queryClient.invalidateQueries({ queryKey: ["bag"] });
      queryClient.invalidateQueries({ queryKey: ["alerts", "history"] });
    },
  });
}
