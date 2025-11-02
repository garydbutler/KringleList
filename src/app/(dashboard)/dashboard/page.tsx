import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to KringleList!</h1>
          <p className="text-lg text-gray-600">
            Your gift finding and organization dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Children Card */}
          <Card>
            <CardHeader>
              <CardTitle>Children</CardTitle>
              <CardDescription>
                Manage child profiles and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Create profiles for your children with their age, interests, and gift preferences.
              </p>
              <Button asChild className="w-full">
                <Link href="/children">Manage Children</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Gift Finder Card */}
          <Card>
            <CardHeader>
              <CardTitle>Gift Finder</CardTitle>
              <CardDescription>
                Discover personalized gift recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Search for the perfect gifts based on age, interests, and values.
              </p>
              <Button asChild className="w-full">
                <Link href="/finder">Find Gifts</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Trends Card */}
          <Card>
            <CardHeader>
              <CardTitle>Trend Radar</CardTitle>
              <CardDescription>
                See what's trending for each age group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Browse trending gifts and discover popular items by age band.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/trends">View Trends</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Alerts Card */}
          <Card>
            <CardHeader>
              <CardTitle>Price Alerts</CardTitle>
              <CardDescription>
                Get notified of price drops and restocks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Set up alerts for your saved items and never miss a deal.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/alerts">Manage Alerts</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Getting Started Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Quick guide to using KringleList
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Create profiles for your children with their age and interests</li>
                <li>Use the Gift Finder to discover personalized recommendations</li>
                <li>Add gifts to your child's bag and set a budget</li>
                <li>Share your bag with family members so they can claim items</li>
                <li>Enable price alerts to get notified when items go on sale</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
