"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChild, useUpdateChild } from "@/lib/hooks/useChildren";
import { ChildProfileForm } from "@/components/features/child-profile/ChildProfileForm";
import { toast } from "sonner";

export default function EditChildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, error } = useChild(id);
  const updateChild = useUpdateChild();

  const handleSubmit = async (formData: any) => {
    try {
      await updateChild.mutateAsync({ id, data: formData });
      toast.success("Child profile updated successfully");
      router.push("/children");
    } catch (error: any) {
      toast.error(error.message || "Failed to update child profile");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.child) {
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/children">← Back to Children</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit {data.child.nickname}'s Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ChildProfileForm
              defaultValues={data.child}
              onSubmit={handleSubmit}
              isLoading={updateChild.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
