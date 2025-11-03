// src/components/features/bag/ChildSelectorDialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useChildren } from "@/lib/hooks/useChildren";
import { useAddToBag } from "@/lib/hooks/useBag";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface ChildSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productOfferId: string;
}

export function ChildSelectorDialog({
  open,
  onOpenChange,
  productOfferId,
}: ChildSelectorDialogProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const { data: childrenData, isLoading } = useChildren();
  const addToBag = useAddToBag();

  const children = childrenData?.children || [];

  const handleAddToBag = async () => {
    if (!selectedChildId) {
      toast.error("Please select a child");
      return;
    }

    try {
      await addToBag.mutateAsync({
        productOfferId,
        childId: selectedChildId,
        quantity: 1,
        isSurprise: false,
      });

      toast.success("Item added to bag!");
      onOpenChange(false);
      setSelectedChildId("");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add item to bag");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to which child's bag?</DialogTitle>
          <DialogDescription>
            Select a child to add this gift to their bag
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4 text-gray-600">
              Loading children...
            </div>
          ) : children.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-2">No children yet</p>
              <p className="text-sm text-gray-500">
                Create a child profile first to start adding gifts
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`w-full flex items-center justify-between border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedChildId === child.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedChildId === child.id
                          ? "border-primary bg-primary"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedChildId === child.id && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium">{child.nickname}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {child.ageBand.replace(/_/g, "-")}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToBag}
              disabled={!selectedChildId || addToBag.isPending}
              className="flex-1"
            >
              {addToBag.isPending ? "Adding..." : "Add to Bag"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
