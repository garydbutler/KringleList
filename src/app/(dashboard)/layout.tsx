import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                KringleList
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/children"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Children
                </Link>
                <Link
                  href="/finder"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Gift Finder
                </Link>
                <Link
                  href="/trends"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Trends
                </Link>
                <Link
                  href="/alerts"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Alerts
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} KringleList. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
