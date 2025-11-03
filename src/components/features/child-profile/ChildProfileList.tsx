"use client";

import { Child } from "@prisma/client";
import { ChildProfileCard } from "./ChildProfileCard";

type ChildWithBag = Child & {
  bag?: {
    id: string;
    shareToken: string;
    items: Array<{
      id: string;
      quantity: number;
      productOffer: {
        priceCents: number;
      };
    }>;
  } | null;
};

type ChildProfileListProps = {
  children: ChildWithBag[];
  onDelete?: (id: string) => void;
};

export function ChildProfileList({ children, onDelete }: ChildProfileListProps) {
  if (children.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-2">No children profiles yet</p>
        <p className="text-gray-500 text-sm">
          Create your first child profile to get started with gift recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children.map((child) => (
        <ChildProfileCard key={child.id} child={child} onDelete={onDelete} />
      ))}
    </div>
  );
}
