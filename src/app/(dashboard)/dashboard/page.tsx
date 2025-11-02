import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-lg text-gray-600">
            Welcome to KringleList! Your dashboard is under construction.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            User ID: {userId}
          </p>
        </div>
      </div>
    </div>
  );
}
