// src/components/features/trends/TrendCard.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendBadge } from "./TrendBadge";
import { TrendingProduct } from "@/lib/jobs/compute-trends";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

interface TrendCardProps {
  trendingProduct: TrendingProduct;
  rank: number;
  onAddToBag?: (productOfferId: string) => void;
}

export function TrendCard({ trendingProduct, rank, onAddToBag }: TrendCardProps) {
  const { product, badges } = trendingProduct;
  const bestOffer = product.offers?.[0];

  if (!bestOffer) {
    return null; // No active offers
  }

  const price = (bestOffer.priceCents / 100).toFixed(2);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        {/* Rank Badge */}
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            #{rank}
          </div>
        </div>

        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100">
          {product.primaryImageUrl ? (
            <Image
              src={product.primaryImageUrl}
              alt={product.title}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Trend Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <TrendBadge key={badge} badge={badge} />
            ))}
          </div>
        )}

        {/* Product Title */}
        <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
          {product.title}
        </h3>

        {/* Merchant Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{bestOffer.merchant?.name || "Retailer"}</span>
          <span className="font-bold text-lg text-primary">${price}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {onAddToBag && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onAddToBag(bestOffer.id)}
              className="w-full"
            >
              Add to Bag
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full"
          >
            <a
              href={bestOffer.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              View
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
