import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">KringleList</h1>
      <p className="mt-4 text-xl text-gray-600">
        Gift Finder MVP - Coming Soon
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/sign-in"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
