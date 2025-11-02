"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AgeBand } from "@prisma/client";
import { useChild } from "@/lib/hooks/useChildren";
import { GiftFinderSearch } from "@/components/features/gift-finder/GiftFinderSearch";
import { toast } from "sonner";

function FinderContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("childId");

  const { data: childData } = useChild(childId || "");

  const handleAddToBag = (productOfferId: string) => {
    // TODO: Implement add to bag functionality in User Story 2
    toast.info("Add to bag feature coming soon in User Story 2!");
    console.log("Add to bag:", productOfferId);
  };

  const child = childData?.child;
  const initialAgeBand = child?.ageBand as AgeBand | undefined;
  const initialInterests = child?.interests || [];

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gift Finder</h1>
          {child ? (
            <p className="text-gray-600">
              Finding gifts for {child.nickname} ({child.ageBand})
            </p>
          ) : (
            <p className="text-gray-600">
              Discover personalized gift recommendations
            </p>
          )}
        </div>

        <GiftFinderSearch
          initialAgeBand={initialAgeBand}
          initialInterests={initialInterests}
          onAddToBag={handleAddToBag}
        />
      </div>
    </div>
  );
}

export default function FinderPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <FinderContent />
    </Suspense>
  );
}
