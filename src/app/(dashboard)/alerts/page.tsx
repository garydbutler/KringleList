import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AlertsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Price Alerts</h1>
        <Card>
          <CardHeader>
            <CardTitle>Manage Alerts</CardTitle>
            <CardDescription>
              Get notified of price drops and restocks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This feature is coming soon. You'll be able to set up alerts for saved items.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
