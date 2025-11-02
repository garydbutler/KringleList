"use client";

import { Child } from "@prisma/client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ChildProfileCardProps = {
  child: Child;
  onDelete?: (id: string) => void;
};

export function ChildProfileCard({ child, onDelete }: ChildProfileCardProps) {
  const budgetDisplay = child.budgetCents
    ? `$${(child.budgetCents / 100).toFixed(2)}`
    : "No budget set";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{child.nickname}</CardTitle>
            <CardDescription>Age: {child.ageBand}</CardDescription>
          </div>
          {child.budgetCents && (
            <Badge variant="outline">{budgetDisplay}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Interests */}
        <div>
          <h4 className="text-sm font-medium mb-2">Interests</h4>
          <div className="flex flex-wrap gap-2">
            {child.interests.slice(0, 4).map((interest) => (
              <Badge key={interest} variant="secondary">
                {interest}
              </Badge>
            ))}
            {child.interests.length > 4 && (
              <Badge variant="secondary">+{child.interests.length - 4} more</Badge>
            )}
          </div>
        </div>

        {/* Values */}
        {child.values && child.values.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Values</h4>
            <div className="flex flex-wrap gap-2">
              {child.values.map((value) => (
                <Badge key={value} variant="outline">
                  {value}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button asChild variant="default" size="sm" className="flex-1">
            <Link href={`/finder?childId=${child.id}`}>Find Gifts</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/children/${child.id}/edit`}>Edit</Link>
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(child.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
