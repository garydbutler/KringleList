"use client";

import { Child, Bag, BagItem, ProductOffer } from "@prisma/client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ChildWithBag = Child & {
  bag?: {
    id: string;
    shareToken: string;
    items: Array<{
      id: string;
      quantity: number;
      productOffer: {
        priceCents: number;
      };
    }>;
  } | null;
};

type ChildProfileCardProps = {
  child: ChildWithBag;
  onDelete?: (id: string) => void;
};

export function ChildProfileCard({ child, onDelete }: ChildProfileCardProps) {
  const budgetDisplay = child.budgetCents
    ? `$${(child.budgetCents / 100).toFixed(2)}`
    : "No budget set";

  // Calculate total spend from bag items
  const totalSpendCents = child.bag?.items?.reduce((total, item) => {
    return total + item.productOffer.priceCents * item.quantity;
  }, 0) || 0;

  const totalSpend = totalSpendCents / 100;

  // Calculate budget status
  let budgetStatus: "green" | "yellow" | "red" | null = null;
  let percentUsed = 0;

  if (child.budgetCents && totalSpendCents > 0) {
    percentUsed = (totalSpendCents / child.budgetCents) * 100;
    if (percentUsed >= 95) budgetStatus = "red";
    else if (percentUsed >= 75) budgetStatus = "yellow";
    else budgetStatus = "green";
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{child.nickname}</CardTitle>
            <CardDescription>Age: {child.ageBand}</CardDescription>
          </div>
          {child.budgetCents && (
            <div className="text-right">
              <Badge variant="outline">{budgetDisplay}</Badge>
              {totalSpendCents > 0 && budgetStatus && (
                <div className="mt-1 text-xs text-gray-600">
                  ${totalSpend.toFixed(2)} spent
                </div>
              )}
            </div>
          )}
        </div>
        {/* Mini budget progress bar */}
        {child.budgetCents && totalSpendCents > 0 && budgetStatus && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
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
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Interests */}
        <div>
          <h4 className="text-sm font-medium mb-2">Interests</h4>
          <div className="flex flex-wrap gap-2">
            {child.interests.slice(0, 4).map((interest) => (
              <Badge key={interest} variant="secondary">
                {interest}
              </Badge>
            ))}
            {child.interests.length > 4 && (
              <Badge variant="secondary">+{child.interests.length - 4} more</Badge>
            )}
          </div>
        </div>

        {/* Values */}
        {child.values && child.values.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Values</h4>
            <div className="flex flex-wrap gap-2">
              {child.values.map((value) => (
                <Badge key={value} variant="outline">
                  {value}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button asChild variant="default" size="sm">
            <Link href={`/finder?childId=${child.id}`}>Find Gifts</Link>
          </Button>
          <Button asChild variant="default" size="sm">
            <Link href={`/bags/${child.id}`}>View Bag</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/children/${child.id}/edit`}>Edit</Link>
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(child.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
