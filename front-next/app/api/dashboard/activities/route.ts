import { NextResponse } from "next/server"

// GET /api/dashboard/activities - Get recent activities with pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "5"
    const offset = searchParams.get("offset") || "0"
    const page = searchParams.get("page") || "1"

    // Call backend API for recent stock in
    const stockInResponse = await fetch(`http://localhost:3001/api/stock-in/recent?limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Call backend API for recent stock out
    const stockOutResponse = await fetch(`http://localhost:3001/api/stock-out/recent?limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Handle responses
    const stockInData = stockInResponse.ok ? await stockInResponse.json() : []
    const stockOutData = stockOutResponse.ok ? await stockOutResponse.json() : []

    // Combine and format activities
    const activities = [
      ...stockInData.map((item: any) => ({
        id: item.id,
        type: "stock-in",
        reference: item.reference,
        date: item.date,
        productId: item.productId,
        productName: item.productName || "Unknown Product",
        quantity: item.quantity,
        user: item.createdBy || "System",
        source: item.supplier || "Unknown Supplier",
      })),
      ...stockOutData.map((item: any) => ({
        id: item.id,
        type: "stock-out",
        reference: item.reference,
        date: item.date,
        productId: item.productId,
        productName: item.productName || "Unknown Product",
        quantity: item.quantity,
        user: item.requester || "Unknown User",
        destination: item.department || "Unknown Department",
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // For pagination, we need to slice the combined results
    const limitNum = Number.parseInt(limit)
    const offsetNum = Number.parseInt(offset)
    const pageNum = Number.parseInt(page)

    const totalItems = activities.length
    const totalPages = Math.ceil(totalItems / limitNum)

    // Slice activities for current page
    const paginatedActivities = activities.slice(offsetNum, offsetNum + limitNum)

    // Return with pagination info if requested
    const response = {
      activities: paginatedActivities,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    }

    return NextResponse.json(
      {
        success: true,
        message: "Recent activities retrieved successfully",
        data: response,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching recent activities:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch recent activities",
      },
      { status: 500 },
    )
  }
}
