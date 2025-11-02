import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FinderPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Gift Finder</h1>
        <Card>
          <CardHeader>
            <CardTitle>Discover Perfect Gifts</CardTitle>
            <CardDescription>
              Search for personalized gift recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This feature is coming soon. You'll be able to search for gifts based on age, interests, and values.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
