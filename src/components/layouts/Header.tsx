"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={isSignedIn ? "/dashboard" : "/"} className="text-2xl font-bold text-blue-600">
              KringleList
            </Link>

            {isSignedIn && (
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className={`transition-colors ${
                    isActive("/dashboard")
                      ? "text-blue-600 font-medium"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/children"
                  className={`transition-colors ${
                    isActive("/children")
                      ? "text-blue-600 font-medium"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Children
                </Link>
                <Link
                  href="/finder"
                  className={`transition-colors ${
                    isActive("/finder")
                      ? "text-blue-600 font-medium"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Gift Finder
                </Link>
                <Link
                  href="/trends"
                  className={`transition-colors ${
                    isActive("/trends")
                      ? "text-blue-600 font-medium"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Trends
                </Link>
                <Link
                  href="/alerts"
                  className={`transition-colors ${
                    isActive("/alerts")
                      ? "text-blue-600 font-medium"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Alerts
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <nav className="flex items-center gap-4">
                <Link
                  href="/advertise"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Advertise
                </Link>
                <Link
                  href="/sign-in"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
