// src/components/features/bag/ShareBagButton.tsx
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
import { Share2, Copy, CheckCircle2, RefreshCw } from "lucide-react";
import { useGenerateShareLink } from "@/lib/hooks/useBag";
import { toast } from "sonner";

interface ShareBagButtonProps {
  bagId: string;
  currentShareToken?: string;
}

export function ShareBagButton({ bagId, currentShareToken }: ShareBagButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const generateShareLink = useGenerateShareLink();

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = currentShareToken
    ? `${baseUrl}/shared/bag/${currentShareToken}`
    : "";

  const handleGenerateLink = async () => {
    try {
      await generateShareLink.mutateAsync(bagId);
      toast.success("Share link generated!");
    } catch (error) {
      toast.error("Failed to generate share link");
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Share2 className="h-4 w-4 mr-2" />
          Share Bag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this Gift Bag</DialogTitle>
          <DialogDescription>
            Share this link with family and friends so they can claim items to
            purchase. Items marked as "surprise" will be hidden from the shared
            view.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {shareUrl ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="share-link">Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-link"
                    value={shareUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600">
                  Need a new link for security?
                </Label>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerateLink}
                  disabled={generateShareLink.isPending}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate Link
                </Button>
                <p className="text-xs text-gray-500">
                  This will create a new link and invalidate the old one.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-4">
                No share link generated yet
              </p>
              <Button
                onClick={handleGenerateLink}
                disabled={generateShareLink.isPending}
              >
                Generate Share Link
              </Button>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Anyone with this link can view and claim items.
            Keep it private and only share with people you trust.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
