// src/app/(dashboard)/trends/page.tsx
"use client";

import { useState } from "react";
import { useTrends, useAllTrends } from "@/lib/hooks/useTrends";
import { TrendSection } from "@/components/features/trends/TrendSection";
import { ChildSelectorDialog } from "@/components/features/bag/ChildSelectorDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AGE_BANDS } from "@/lib/utils/constants";
import { Loader2 } from "lucide-react";

export default function TrendsPage() {
  const [selectedAgeBand, setSelectedAgeBand] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProductOfferId, setSelectedProductOfferId] = useState("");

  // Fetch trends based on selection
  const { data: singleBandData, isLoading: singleLoading } = useTrends(
    selectedAgeBand !== "ALL" ? selectedAgeBand : undefined
  );
  const { data: allTrendsData, isLoading: allLoading } = useAllTrends();

  const isLoading = selectedAgeBand === "ALL" ? allLoading : singleLoading;

  const handleAddToBag = (productOfferId: string) => {
    setSelectedProductOfferId(productOfferId);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Trending Gifts</h1>
            <p className="text-gray-600">
              Discover what's hot right now - updated daily
            </p>
          </div>

          {/* Age Band Filter */}
          <div className="w-64">
            <Select value={selectedAgeBand} onValueChange={setSelectedAgeBand}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Ages</SelectItem>
                {Object.entries(AGE_BANDS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Trends Display */}
        {!isLoading && (
          <div className="space-y-12">
            {selectedAgeBand === "ALL" ? (
              // Show all age bands
              <>
                {allTrendsData &&
                  Object.entries(AGE_BANDS).map(([bandKey, bandLabel]) => (
                    <TrendSection
                      key={bandKey}
                      ageBand={bandKey}
                      ageBandLabel={bandLabel}
                      trends={allTrendsData[bandKey] || []}
                      onAddToBag={handleAddToBag}
                    />
                  ))}
              </>
            ) : (
              // Show single age band
              <>
                {singleBandData && singleBandData.trends && (
                  <TrendSection
                    ageBand={selectedAgeBand}
                    ageBandLabel={AGE_BANDS[selectedAgeBand as keyof typeof AGE_BANDS]}
                    trends={singleBandData.trends}
                    onAddToBag={handleAddToBag}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Child Selector Dialog */}
        <ChildSelectorDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          productOfferId={selectedProductOfferId}
        />
      </div>
    </div>
  );
}
