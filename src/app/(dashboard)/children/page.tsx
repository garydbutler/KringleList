import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ChildrenPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Children</h1>
        <Card>
          <CardHeader>
            <CardTitle>Manage Child Profiles</CardTitle>
            <CardDescription>
              Create and manage profiles for your children
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This feature is coming soon. You'll be able to create child profiles with age, interests, and preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
