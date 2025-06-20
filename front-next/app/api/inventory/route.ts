import { NextResponse } from "next/server"

// GET /api/inventory - Get inventory data with search and filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || "all"
    const status = searchParams.get("status") || "all"
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "10"

    // Build query parameters for backend
    const params = new URLSearchParams({
      page,
      limit,
    })

    if (search) params.append("search", search)
    if (category !== "all") params.append("category", category)
    if (status !== "all") params.append("status", status)

    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, message: errorData.message || "Failed to fetch inventory" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(
      {
        success: true,
        message: "Inventory retrieved successfully",
        data: data,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch inventory",
      },
      { status: 500 },
    )
  }
}
