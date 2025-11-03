// src/app/(public)/shared/bag/[token]/page.tsx
"use client";

import { use } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Heart } from "lucide-react";
import { useSharedBag } from "@/lib/hooks/useBag";
import { ClaimButton } from "@/components/features/bag/ClaimButton";

export default function SharedBagPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  // Auto-poll every 5 seconds for real-time claim updates
  const { data: bag, isLoading, error } = useSharedBag(token);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gift bag...</p>
        </div>
      </div>
    );
  }

  if (error || !bag) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Bag Not Found
          </h2>
          <p className="text-gray-600">
            This gift bag link may be invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  // Calculate total spend
  const totalSpendCents = bag.items.reduce((total, item) => {
    return total + item.productOffer.priceCents * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Heart className="h-8 w-8 text-white" fill="currentColor" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              {bag.child.nickname}'s Gift Wishlist
            </h1>
            <p className="text-gray-600 text-lg">
              Age Group: {bag.child.ageBand.replace(/_/g, "-")}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Pick an item to claim - the gift giver will be notified!
            </p>
          </div>

          {/* Items Grid */}
          {bag.items.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <Gift className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-medium">No items added yet</p>
                  <p className="text-sm mt-1">
                    The gift giver is still building this list
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bag.items.map((item) => (
                <Card
                  key={item.id}
                  className={
                    item.claim
                      ? "border-green-200 bg-green-50"
                      : "hover:shadow-lg transition-shadow"
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        {item.productOffer.product.primaryImageUrl ? (
                          <Image
                            src={item.productOffer.product.primaryImageUrl}
                            alt={item.productOffer.product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Gift className="h-12 w-12" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {item.productOffer.product.title}
                        </h3>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-2xl font-bold text-primary">
                            $
                            {(
                              (item.productOffer.priceCents * item.quantity) /
                              100
                            ).toFixed(2)}
                          </div>
                          {item.quantity > 1 && (
                            <Badge variant="secondary">
                              Qty: {item.quantity}
                            </Badge>
                          )}
                        </div>

                        {/* Claim Button */}
                        <div className="max-w-xs">
                          <ClaimButton itemId={item.id} claim={item.claim} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Summary */}
              <Card className="border-2 border-primary bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Total Value ({bag.items.length} items)
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        ${(totalSpendCents / 100).toFixed(2)}
                      </p>
                    </div>
                    {bag.items.some((item) => item.claim) && (
                      <div className="text-right">
                        <p className="text-sm text-green-600 mb-1">
                          Items Claimed
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          {bag.items.filter((item) => item.claim).length}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Powered by KringleList - Gift Giving Made Easy
            </p>
            <p className="text-xs text-gray-500">
              Want to create your own gift list?{" "}
              <a href="/" className="text-primary hover:underline">
                Get Started
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
