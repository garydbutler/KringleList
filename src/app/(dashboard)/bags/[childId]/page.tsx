// src/app/(dashboard)/bags/[childId]/page.tsx
"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useBag } from "@/lib/hooks/useBag";
import { useChildren } from "@/lib/hooks/useChildren";
import { BagItemList } from "@/components/features/bag/BagItemList";
import { ShareBagButton } from "@/components/features/bag/ShareBagButton";

export default function ChildBagPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = use(params);

  // First, get the child to find their bag
  const { data: childrenData, isLoading: childrenLoading } = useChildren();
  const child = childrenData?.children?.find((c) => c.id === childId);

  // Get the bag with 5-second polling for real-time claim updates
  const { data: bag, isLoading: bagLoading } = useBag(
    child?.bagId || null,
    5000 // Poll every 5 seconds
  );

  if (childrenLoading || bagLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading bag...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-red-600">Child not found</p>
          <Button asChild className="mt-4">
            <Link href="/children">Back to Children</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/children">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Children
            </Link>
          </Button>

          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">
              {child.nickname}'s Gift Bag
            </h1>
            {bag && (
              <ShareBagButton
                bagId={bag.id}
                currentShareToken={bag.shareToken}
              />
            )}
          </div>

          <p className="text-gray-600">
            Age: {child.ageBand.replace(/_/g, "-")}
            {child.budgetCents && (
              <span className="ml-4">
                Budget: ${(child.budgetCents / 100).toFixed(2)}
              </span>
            )}
          </p>
        </div>

        {/* Bag Items */}
        {bag ? (
          <BagItemList
            items={bag.items}
            isParentView={true}
            budgetCents={child.budgetCents}
          />
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-gray-600 mb-4">No bag created yet</p>
            <p className="text-sm text-gray-500">
              Add items from the Gift Finder to create this bag
            </p>
            <Button asChild className="mt-4">
              <Link href="/finder">Browse Gifts</Link>
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/finder">
              Add More Gifts
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/children/${childId}/edit`}>
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
