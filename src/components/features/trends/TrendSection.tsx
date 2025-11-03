// src/components/features/trends/TrendSection.tsx
"use client";

import { TrendCard } from "./TrendCard";
import { TrendingProduct } from "@/lib/jobs/compute-trends";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface TrendSectionProps {
  ageBand: string;
  ageBandLabel: string;
  trends: TrendingProduct[];
  onAddToBag?: (productOfferId: string) => void;
}

export function TrendSection({
  ageBand,
  ageBandLabel,
  trends,
  onAddToBag,
}: TrendSectionProps) {
  if (!trends || trends.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold">{ageBandLabel}</h2>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">No trending gifts yet</p>
              <p className="text-sm mt-1">
                Check back soon for trending recommendations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Flame className="h-6 w-6 text-orange-500" />
        <h2 className="text-2xl font-bold">{ageBandLabel}</h2>
        <span className="text-sm text-gray-500">Top {trends.length} Trending</span>
      </div>

      {/* Trending Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {trends.map((trend) => (
          <TrendCard
            key={trend.productId}
            trendingProduct={trend}
            rank={trend.rank}
            onAddToBag={onAddToBag}
          />
        ))}
      </div>
    </div>
  );
}
