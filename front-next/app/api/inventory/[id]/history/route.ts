import { NextResponse } from "next/server"

// GET /api/inventory/[id]/history - Get product movement history
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "10"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build query parameters
    const queryParams = new URLSearchParams({
      page,
      limit,
    })

    if (startDate) queryParams.append("startDate", startDate)
    if (endDate) queryParams.append("endDate", endDate)

    // Call backend API for stock in history
    const stockInResponse = await fetch(
      `http://localhost:3001/api/stock-in/product/${params.id}?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    // Call backend API for stock out history
    const stockOutResponse = await fetch(
      `http://localhost:3001/api/stock-out/product/${params.id}?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    // Handle responses
    const stockInData = stockInResponse.ok ? await stockInResponse.json() : []
    const stockOutData = stockOutResponse.ok ? await stockOutResponse.json() : []

    // Combine and sort by date
    const combinedHistory = [
      ...stockInData.map((item: any) => ({ ...item, type: "stock-in" })),
      ...stockOutData.map((item: any) => ({ ...item, type: "stock-out" })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(
      {
        success: true,
        message: "Product history retrieved successfully",
        data: combinedHistory,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching product history:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch product history",
      },
      { status: 500 },
    )
  }
}
