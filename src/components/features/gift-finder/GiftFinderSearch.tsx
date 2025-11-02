"use client";

import { useState } from "react";
import { AgeBand } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinder, ProductWithOffer } from "@/lib/hooks/useFinder";
import { ProductCard } from "./ProductCard";
import { INTERESTS, VALUES, PRICE_BANDS } from "@/lib/utils/constants";

type GiftFinderSearchProps = {
  initialAgeBand?: AgeBand;
  initialInterests?: string[];
  onAddToBag?: (productOfferId: string) => void;
};

export function GiftFinderSearch({
  initialAgeBand,
  initialInterests = [],
  onAddToBag,
}: GiftFinderSearchProps) {
  const [ageBand, setAgeBand] = useState<AgeBand | undefined>(initialAgeBand);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialInterests);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});

  const finderMutation = useFinder();

  const handleSearch = () => {
    finderMutation.mutate({
      ageBand,
      interests: selectedInterests.length > 0 ? selectedInterests : undefined,
      values: selectedValues.length > 0 ? selectedValues : undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      limit: 20,
    });
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleValue = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const resetFilters = () => {
    setAgeBand(initialAgeBand);
    setSelectedInterests(initialInterests);
    setSelectedValues([]);
    setPriceRange({});
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        <div className="space-y-6">
          {/* Age Band */}
          <div>
            <label className="text-sm font-medium mb-2 block">Age Band</label>
            <Select
              value={ageBand}
              onValueChange={(value) => setAgeBand(value as AgeBand)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ZERO_TO_TWO">0-2 years</SelectItem>
                <SelectItem value="THREE_TO_FOUR">3-4 years</SelectItem>
                <SelectItem value="FIVE_TO_SEVEN">5-7 years</SelectItem>
                <SelectItem value="EIGHT_TO_TEN">8-10 years</SelectItem>
                <SelectItem value="ELEVEN_TO_THIRTEEN">11-13 years</SelectItem>
                <SelectItem value="FOURTEEN_PLUS">14+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Price Range</label>
            <Select
              value={
                priceRange.min !== undefined
                  ? `${priceRange.min}-${priceRange.max}`
                  : ""
              }
              onValueChange={(value) => {
                if (!value) {
                  setPriceRange({});
                  return;
                }
                const band = PRICE_BANDS.find(
                  (b) => `${b.min}-${b.max}` === value
                );
                if (band) {
                  setPriceRange({
                    min: band.min,
                    max: band.max === Infinity ? undefined : band.max,
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any price</SelectItem>
                {PRICE_BANDS.map((band) => (
                  <SelectItem key={band.label} value={`${band.min}-${band.max}`}>
                    {band.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interests */}
          <div>
            <label className="text-sm font-medium mb-2 block">Interests</label>
            <div className="grid grid-cols-2 gap-2">
              {INTERESTS.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={`interest-${interest}`}
                    checked={selectedInterests.includes(interest)}
                    onCheckedChange={() => toggleInterest(interest)}
                  />
                  <label
                    htmlFor={`interest-${interest}`}
                    className="text-sm cursor-pointer"
                  >
                    {interest}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div>
            <label className="text-sm font-medium mb-2 block">Values</label>
            <div className="grid grid-cols-2 gap-2">
              {VALUES.map((value) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`value-${value}`}
                    checked={selectedValues.includes(value)}
                    onCheckedChange={() => toggleValue(value)}
                  />
                  <label
                    htmlFor={`value-${value}`}
                    className="text-sm cursor-pointer"
                  >
                    {value}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex-1">
              Search Gifts
            </Button>
            <Button onClick={resetFilters} variant="outline">
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div>
        {finderMutation.isPending && (
          <div className="text-center py-12">
            <p className="text-gray-600">Searching for perfect gifts...</p>
          </div>
        )}

        {finderMutation.isError && (
          <div className="text-center py-12">
            <p className="text-red-600">
              Error: {finderMutation.error?.message || "Failed to search"}
            </p>
          </div>
        )}

        {finderMutation.isSuccess && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {finderMutation.data.count} {finderMutation.data.count === 1 ? "Gift" : "Gifts"} Found
              </h2>
            </div>

            {finderMutation.data.products.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600 mb-2">No gifts found</p>
                <p className="text-gray-500 text-sm">
                  Try adjusting your filters to see more results
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {finderMutation.data.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToBag={onAddToBag}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!finderMutation.isPending &&
          !finderMutation.isError &&
          !finderMutation.isSuccess && (
            <Card className="p-12 text-center">
              <p className="text-gray-600 mb-2">Ready to find gifts!</p>
              <p className="text-gray-500 text-sm">
                Select your filters and click "Search Gifts" to get started
              </p>
            </Card>
          )}
      </div>
    </div>
  );
}
