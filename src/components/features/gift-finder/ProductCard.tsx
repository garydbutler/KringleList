"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductWithOffer } from "@/lib/hooks/useFinder";

type ProductCardProps = {
  product: ProductWithOffer;
  onAddToBag?: (productOfferId: string) => void;
};

export function ProductCard({ product, onAddToBag }: ProductCardProps) {
  const { bestOffer } = product;

  if (!bestOffer) {
    return null; // Don't show products without available offers
  }

  const price = (bestOffer.priceCents / 100).toFixed(2);
  const listPrice = bestOffer.listPriceCents
    ? (bestOffer.listPriceCents / 100).toFixed(2)
    : null;
  const savings = listPrice
    ? ((parseFloat(listPrice) - parseFloat(price)) / parseFloat(listPrice) * 100).toFixed(0)
    : null;

  // Generate "why it fits" bullets based on product attributes
  const whyItFits = [];
  if (product.ageBands.length > 0) {
    whyItFits.push(`Perfect for ages ${product.ageBands[0]}`);
  }
  if (product.interests.length > 0) {
    whyItFits.push(`Matches interest: ${product.interests[0]}`);
  }
  if (product.values.length > 0) {
    whyItFits.push(`${product.values[0]} focused`);
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="relative aspect-square">
          <Image
            src={product.imageUrl || "/placeholder-product.jpg"}
            alt={product.title}
            fill
            className="object-cover rounded-t-lg"
          />
          {savings && parseInt(savings) > 10 && (
            <Badge className="absolute top-2 right-2 bg-red-600">
              Save {savings}%
            </Badge>
          )}
          {!bestOffer.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold line-clamp-2 text-sm">{product.title}</h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">${price}</span>
          {listPrice && (
            <span className="text-sm text-gray-500 line-through">${listPrice}</span>
          )}
        </div>

        {/* Merchant */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">from</span>
          <span className="text-sm font-medium">{bestOffer.merchant.name}</span>
        </div>

        {/* Why It Fits bullets */}
        {whyItFits.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-700">Why it fits:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {whyItFits.slice(0, 3).map((reason, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Values badges */}
        {product.values.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.values.slice(0, 3).map((value) => (
              <Badge key={value} variant="outline" className="text-xs">
                {value}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <a
            href={bestOffer.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Deal
          </a>
        </Button>
        {onAddToBag && bestOffer.inStock && (
          <Button
            size="sm"
            onClick={() => onAddToBag(bestOffer.id)}
            className="flex-1"
          >
            Add to Bag
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
