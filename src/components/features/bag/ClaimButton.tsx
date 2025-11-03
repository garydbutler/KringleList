// src/components/features/bag/ClaimButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Gift } from "lucide-react";
import { useClaimBagItem, useUnclaimBagItem } from "@/lib/hooks/useBag";
import { toast } from "sonner";
import { z } from "zod";

interface ClaimButtonProps {
  itemId: string;
  claim: {
    id: string;
    claimerName: string;
    claimerEmail: string | null;
    claimedAt: string;
  } | null;
}

const claimSchema = z.object({
  claimerName: z.string().min(1, "Name is required").max(100),
  claimerEmail: z.string().email("Valid email required").optional().or(z.literal("")),
});

export function ClaimButton({ itemId, claim }: ClaimButtonProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    claimerName: "",
    claimerEmail: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const claimItem = useClaimBagItem();
  const unclaimItem = useUnclaimBagItem();

  const canUnclaim = claim
    ? (Date.now() - new Date(claim.claimedAt).getTime()) / (1000 * 60 * 60) < 24
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = claimSchema.parse(formData);
      setErrors({});

      await claimItem.mutateAsync({
        itemId,
        claimerName: validated.claimerName,
        claimerEmail: validated.claimerEmail || undefined,
      });

      toast.success("Item claimed successfully!");
      setOpen(false);
      setFormData({ claimerName: "", claimerEmail: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to claim item");
      }
    }
  };

  const handleUnclaim = async () => {
    if (!confirm("Are you sure you want to unclaim this item?")) {
      return;
    }

    try {
      await unclaimItem.mutateAsync(itemId);
      toast.success("Item unclaimed successfully!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to unclaim item");
      }
    }
  };

  // If already claimed, show claimed status
  if (claim) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Claimed by {claim.claimerName}</span>
        </div>
        {canUnclaim && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnclaim}
            disabled={unclaimItem.isPending}
            className="w-full"
          >
            Unclaim Item
          </Button>
        )}
      </div>
    );
  }

  // Show claim button
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full">
          <Gift className="h-4 w-4 mr-2" />
          Claim Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Claim this Item</DialogTitle>
          <DialogDescription>
            Let the gift giver know you'll purchase this item. You can unclaim
            it within 24 hours if needed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claimer-name">
              Your Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="claimer-name"
              value={formData.claimerName}
              onChange={(e) =>
                setFormData({ ...formData, claimerName: e.target.value })
              }
              placeholder="Enter your name"
              className={errors.claimerName ? "border-red-500" : ""}
            />
            {errors.claimerName && (
              <p className="text-sm text-red-600">{errors.claimerName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="claimer-email">
              Your Email <span className="text-gray-400">(optional)</span>
            </Label>
            <Input
              id="claimer-email"
              type="email"
              value={formData.claimerEmail}
              onChange={(e) =>
                setFormData({ ...formData, claimerEmail: e.target.value })
              }
              placeholder="your.email@example.com"
              className={errors.claimerEmail ? "border-red-500" : ""}
            />
            {errors.claimerEmail && (
              <p className="text-sm text-red-600">{errors.claimerEmail}</p>
            )}
            <p className="text-xs text-gray-500">
              Optionally provide your email for purchase reminders
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={claimItem.isPending}
              className="flex-1"
            >
              {claimItem.isPending ? "Claiming..." : "Claim Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
