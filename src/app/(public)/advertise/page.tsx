import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdvertisePage() {
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Advertise on KringleList
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Reach parents actively searching for gifts for their children
          </p>
          <Button size="lg" asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Targeted Audience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Connect with parents actively searching for gifts based on specific age ranges, interests, and values.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance-Based</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Pay only for results with CPC, CPM, or CPA pricing models. Track impressions, clicks, and conversions in real-time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Safety</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your products appear in a family-friendly environment with clear FTC-compliant disclosure and moderation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Simple steps to start advertising</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  1
                </span>
                <div>
                  <h3 className="font-semibold mb-1">Create Your Campaign</h3>
                  <p className="text-gray-600">
                    Set your budget, targeting criteria (age band, interests, values), and pricing model.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  2
                </span>
                <div>
                  <h3 className="font-semibold mb-1">Upload Your Creative</h3>
                  <p className="text-gray-600">
                    Provide product images, titles, descriptions, and destination URLs. Our system auto-moderates for quality.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  3
                </span>
                <div>
                  <h3 className="font-semibold mb-1">Go Live & Track Performance</h3>
                  <p className="text-gray-600">
                    Your ads appear in search results and product recommendations. Monitor clicks, CTR, and conversions in your dashboard.
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Pricing Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Flexible Pricing</CardTitle>
            <CardDescription>Choose the model that works for your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">CPC (Cost Per Click)</h3>
                <p className="text-gray-600 text-sm">
                  Pay only when users click on your product. Ideal for driving traffic to your site.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">CPM (Cost Per Thousand Impressions)</h3>
                <p className="text-gray-600 text-sm">
                  Pay for brand visibility. Great for awareness campaigns.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">CPA (Cost Per Acquisition)</h3>
                <p className="text-gray-600 text-sm">
                  Pay only when users complete a purchase. Performance-based pricing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Join brands that are already reaching engaged parents on KringleList
          </p>
          <Button size="lg" asChild>
            <Link href="/sign-up">Create Your Campaign</Link>
          </Button>
        </div>

        {/* Disclosure */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            All sponsored content is clearly labeled in accordance with FTC guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
