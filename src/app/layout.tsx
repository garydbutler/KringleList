import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "KringleList - Gift Finder for Parents",
  description: "Discover, organize, and share Christmas and birthday gifts for your children",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <QueryProvider>
            {children}
          </QueryProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
