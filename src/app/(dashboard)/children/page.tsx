"use client";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useChildren, useDeleteChild } from "@/lib/hooks/useChildren";
import { ChildProfileList } from "@/components/features/child-profile/ChildProfileList";
import { toast } from "sonner";

export default function ChildrenPage() {
  const { data, isLoading, error } = useChildren();
  const deleteChild = useDeleteChild();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this child profile?")) {
      return;
    }

    try {
      await deleteChild.mutateAsync(id);
      toast.success("Child profile deleted successfully");
    } catch (error) {
      toast.error("Failed to delete child profile");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading children...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-red-600">Error loading children</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Children</h1>
            <p className="text-gray-600">
              Manage profiles for your children
            </p>
          </div>
          <Button asChild>
            <Link href="/children/new">Add Child</Link>
          </Button>
        </div>

        <ChildProfileList
          children={data?.children || []}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
