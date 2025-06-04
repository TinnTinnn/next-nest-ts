import { NextResponse } from "next/server"
import { fetchWithAuth } from "@/lib/auth"

// POST /api/stock-out - Create new stock out record
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, message: "Items are required" }, { status: 400 })
    }

    if (!body.department) {
      return NextResponse.json({ success: false, message: "Department is required" }, { status: 400 })
    }

    if (!body.requester) {
      return NextResponse.json({ success: false, message: "Requester is required" }, { status: 400 })
    }

    if (!body.reference) {
      return NextResponse.json({ success: false, message: "Reference number is required" }, { status: 400 })
    }

    // Process each item in the stock out
    const results = []

    for (const item of body.items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json({ success: false, message: "Invalid item data" }, { status: 400 })
      }

      // Call backend API for each product
      const stockOutData = {
        quantity: item.quantity,
        reference: body.reference,
        department: body.department,
        requester: body.requester,
        date: body.date || new Date().toISOString(),
        notes: body.notes || undefined,
        unitPrice: item.unitPrice,
      }

      const response = await fetchWithAuth(`http://localhost:3001/api/stock-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...stockOutData,
          productId: item.productId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return NextResponse.json(
          { success: false, message: errorData.message || `Failed to remove stock for product ${item.productId}` },
          { status: response.status },
        )
      }

      const result = await response.json()
      results.push(result)
    }

    return NextResponse.json(
      {
        success: true,
        message: "Stock out saved successfully",
        results: results,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error saving stock out:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to save stock out",
      },
      { status: 500 },
    )
  }
}

// GET /api/stock-out - Get stock out history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "10"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const department = searchParams.get("department")

    // Build query parameters
    const params = new URLSearchParams({
      page,
      limit,
    })

    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)
    if (department) params.append("department", department)

    // Call backend API
    const response = await fetchWithAuth(`http://localhost:3001/api/stock-out?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, message: errorData.message || "Failed to fetch stock out history" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(
      {
        success: true,
        message: "Stock out history retrieved successfully",
        data: data,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching stock out history:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch stock out history",
      },
      { status: 500 },
    )
  }
}
