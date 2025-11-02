import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { searchProducts } from "@/lib/db/products";
import { AgeBand } from "@prisma/client";

/**
 * POST /api/finder/search
 * Search for gift recommendations based on criteria
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      ageBand,
      interests,
      values,
      minPrice,
      maxPrice,
      merchantIds,
      limit = 20,
      offset = 0,
    } = body;

    // Validate ageBand if provided
    if (ageBand && !Object.values(AgeBand).includes(ageBand)) {
      return NextResponse.json(
        { error: "Invalid age band" },
        { status: 400 }
      );
    }

    // Validate interests if provided
    if (interests && !Array.isArray(interests)) {
      return NextResponse.json(
        { error: "Interests must be an array" },
        { status: 400 }
      );
    }

    // Validate values if provided
    if (values && !Array.isArray(values)) {
      return NextResponse.json(
        { error: "Values must be an array" },
        { status: 400 }
      );
    }

    // Search products
    const products = await searchProducts({
      ageBand,
      interests,
      values,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      merchantIds,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return NextResponse.json({
      products,
      count: products.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/finder/search
 * Search with query parameters (alternative to POST)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const ageBand = searchParams.get("ageBand") as AgeBand | null;
    const interests = searchParams.get("interests")?.split(",").filter(Boolean);
    const values = searchParams.get("values")?.split(",").filter(Boolean);
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const merchantIds = searchParams.get("merchantIds")?.split(",").filter(Boolean);
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";

    // Validate ageBand if provided
    if (ageBand && !Object.values(AgeBand).includes(ageBand)) {
      return NextResponse.json(
        { error: "Invalid age band" },
        { status: 400 }
      );
    }

    // Search products
    const products = await searchProducts({
      ageBand: ageBand || undefined,
      interests: interests || [],
      values: values || [],
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      merchantIds: merchantIds || undefined,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return NextResponse.json({
      products,
      count: products.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
