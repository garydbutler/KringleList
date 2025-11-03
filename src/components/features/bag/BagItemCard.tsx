// src/components/features/bag/BagItemCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { BagItem } from "@/lib/hooks/useBag";
import { useUpdateBagItem, useRemoveBagItem } from "@/lib/hooks/useBag";
import { toast } from "sonner";

interface BagItemCardProps {
  item: BagItem;
  isParentView: boolean; // true if viewing as parent, false if viewing as relative
  onRemove?: (itemId: string) => void;
}

export function BagItemCard({ item, isParentView }: BagItemCardProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const updateBagItem = useUpdateBagItem();
  const removeBagItem = useRemoveBagItem();

  const priceCents = item.productOffer.priceCents;
  const totalPrice = (priceCents * quantity) / 100;

  const handleQuantityChange = async (newQuantity: string) => {
    const qty = parseInt(newQuantity);
    setQuantity(qty);

    try {
      await updateBagItem.mutateAsync({
        itemId: item.id,
        quantity: qty,
      });
      toast.success("Quantity updated");
    } catch (error) {
      toast.error("Failed to update quantity");
      setQuantity(item.quantity); // Revert on error
    }
  };

  const handleSurpriseToggle = async (checked: boolean) => {
    try {
      await updateBagItem.mutateAsync({
        itemId: item.id,
        isSurprise: checked,
      });
      toast.success(checked ? "Marked as surprise" : "Unmarked as surprise");
    } catch (error) {
      toast.error("Failed to update surprise status");
    }
  };

  const handleAlertToggle = async (checked: boolean) => {
    try {
      await updateBagItem.mutateAsync({
        itemId: item.id,
        alertEnabled: checked,
      });
      toast.success(checked ? "Alerts enabled" : "Alerts disabled");
    } catch (error) {
      toast.error("Failed to update alert settings");
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove this item from the bag?")) {
      return;
    }

    try {
      await removeBagItem.mutateAsync(item.id);
      toast.success("Item removed from bag");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  return (
    <Card className={item.claim ? "border-green-200 bg-green-50" : ""}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
            {item.productOffer.product.primaryImageUrl ? (
              <Image
                src={item.productOffer.product.primaryImageUrl}
                alt={item.productOffer.product.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No image
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm line-clamp-2">
                {item.productOffer.product.title}
              </h3>
              {isParentView && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  disabled={removeBagItem.isPending}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>

            {/* Price and Quantity */}
            <div className="flex items-center gap-4 mb-3">
              <div className="text-lg font-bold text-primary">
                ${totalPrice.toFixed(2)}
              </div>
              {isParentView && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-600">Qty:</Label>
                  <Select
                    value={quantity.toString()}
                    onValueChange={handleQuantityChange}
                    disabled={updateBagItem.isPending}
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {!isParentView && quantity > 1 && (
                <div className="text-xs text-gray-600">Quantity: {quantity}</div>
              )}
            </div>

            {/* Claim Status */}
            {item.claim && (
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Claimed by {item.claim.claimerName}
                </span>
              </div>
            )}

            {/* Parent Controls */}
            {isParentView && (
              <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`surprise-${item.id}`}
                    checked={item.isSurprise}
                    onCheckedChange={handleSurpriseToggle}
                    disabled={updateBagItem.isPending}
                  />
                  <Label
                    htmlFor={`surprise-${item.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    Mark as surprise
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`alert-${item.id}`}
                    checked={item.alertEnabled}
                    onCheckedChange={handleAlertToggle}
                    disabled={updateBagItem.isPending}
                  />
                  <Label
                    htmlFor={`alert-${item.id}`}
                    className="text-sm font-normal cursor-pointer flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    Price alerts
                  </Label>
                </div>
              </div>
            )}

            {/* Badges */}
            {item.isSurprise && !isParentView && (
              <Badge variant="secondary" className="mt-2">
                Surprise Gift
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
