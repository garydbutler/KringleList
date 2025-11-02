"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateChild } from "@/lib/hooks/useChildren";
import { ChildProfileForm } from "@/components/features/child-profile/ChildProfileForm";
import { toast } from "sonner";

export default function NewChildPage() {
  const router = useRouter();
  const createChild = useCreateChild();

  const handleSubmit = async (data: any) => {
    try {
      await createChild.mutateAsync(data);
      toast.success("Child profile created successfully");
      router.push("/children");
    } catch (error: any) {
      toast.error(error.message || "Failed to create child profile");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/children">← Back to Children</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Child Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ChildProfileForm
              onSubmit={handleSubmit}
              isLoading={createChild.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
