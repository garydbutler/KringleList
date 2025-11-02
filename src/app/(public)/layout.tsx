import Link from "next/link";
import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              KringleList
            </Link>
            <nav className="flex items-center gap-6">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-bold mb-2">About</h3>
              <p className="text-sm text-gray-600">
                KringleList helps parents discover, organize, and share perfect gifts for their children.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Links</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  <Link href="/advertise" className="hover:text-blue-600">
                    Advertise
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">Legal</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  <Link href="/privacy" className="hover:text-blue-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-blue-600">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-gray-600 pt-6 border-t">
            <p>&copy; {new Date().getFullYear()} KringleList. All rights reserved.</p>
            <p className="mt-2 text-xs">
              We may earn affiliate commissions from purchases made through links on this site.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
