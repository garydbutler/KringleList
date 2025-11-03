// src/components/features/bag/BagItemList.tsx
"use client";

import { BagItem } from "@/lib/hooks/useBag";
import { BagItemCard } from "./BagItemCard";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

interface BagItemListProps {
  items: BagItem[];
  isParentView: boolean;
  budgetCents?: number | null;
}

export function BagItemList({
  items,
  isParentView,
  budgetCents,
}: BagItemListProps) {
  // Calculate total spend
  const totalSpendCents = items.reduce((total, item) => {
    return total + item.productOffer.priceCents * item.quantity;
  }, 0);

  const totalSpend = totalSpendCents / 100;

  // Calculate budget status if budget is set
  let budgetStatus: "green" | "yellow" | "red" | null = null;
  let percentUsed = 0;

  if (budgetCents) {
    percentUsed = (totalSpendCents / budgetCents) * 100;
    if (percentUsed >= 95) budgetStatus = "red";
    else if (percentUsed >= 75) budgetStatus = "yellow";
    else budgetStatus = "green";
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">No items in bag yet</p>
            <p className="text-sm mt-1">
              {isParentView
                ? "Start adding gifts to build this bag"
                : "The gift giver hasn't added any items yet"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Budget Thermometer (if budget is set) */}
      {budgetCents && isParentView && (
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Budget Progress</span>
                <span className="font-bold">
                  ${totalSpend.toFixed(2)} / ${(budgetCents / 100).toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${
                    budgetStatus === "green"
                      ? "bg-green-500"
                      : budgetStatus === "yellow"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(percentUsed, 100)}%`,
                  }}
                />
              </div>
              <div className="text-xs text-gray-600">
                {percentUsed >= 100 ? (
                  <span className="text-red-600 font-medium">
                    Over budget by ${((totalSpendCents - budgetCents) / 100).toFixed(2)}
                  </span>
                ) : (
                  <span>
                    {((budgetCents - totalSpendCents) / 100).toFixed(2)} remaining
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item) => (
          <BagItemCard key={item.id} item={item} isParentView={isParentView} />
        ))}
      </div>

      {/* Total Summary */}
      <Card className="border-2 border-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total ({items.length} items)</p>
              <p className="text-2xl font-bold text-primary">
                ${totalSpend.toFixed(2)}
              </p>
            </div>
            {items.some((item) => item.claim) && (
              <div className="text-right">
                <p className="text-sm text-green-600 font-medium">
                  {items.filter((item) => item.claim).length} claimed
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
