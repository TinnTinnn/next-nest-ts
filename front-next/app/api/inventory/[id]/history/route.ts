import { NextResponse } from "next/server"

// GET /api/inventory/[id]/history - Get product movement history
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "100"
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

    let stockInData = []
    let stockOutData = []

    // ✅ Handle responses properly with nested data structure
    if (stockInResponse.ok) {
      const stockInResult = await stockInResponse.json()
      console.log('Stock In Response:', stockInResult)

      // Handle nested data structure: { success: true, data: { data: [...], pagination: {...} } }
      if (stockInResult.success && stockInResult.data && stockInResult.data.data) {
        stockInData = Array.isArray(stockInResult.data.data) ? stockInResult.data.data : []
      } else if (stockInResult.data && Array.isArray(stockInResult.data)) {
        stockInData = stockInResult.data
      } else if (Array.isArray(stockInResult)) {
        stockInData = stockInResult
      }
    } else {
      console.error('Stock In Response Error:', stockInResponse.status, stockInResponse.statusText)
    }

    if (stockOutResponse.ok) {
      const stockOutResult = await stockOutResponse.json()
      console.log('Stock Out Response:', stockOutResult)

      // Handle nested data structure: { success: true, data: { data: [...], pagination: {...} } }
      if (stockOutResult.success && stockOutResult.data && stockOutResult.data.data) {
        stockOutData = Array.isArray(stockOutResult.data.data) ? stockOutResult.data.data : []
      } else if (stockOutResult.data && Array.isArray(stockOutResult.data)) {
        stockOutData = stockOutResult.data
      } else if (Array.isArray(stockOutResult)) {
        stockOutData = stockOutResult
      }
    } else {
      console.error('Stock Out Response Error:', stockOutResponse.status, stockOutResponse.statusText)
    }

    // ✅ Transform data to match frontend interface
    const transformedStockIn = stockInData.map((item: any) => ({
      id: item.id,
      reference: item.reference || item.referenceNumber || 'N/A',
      date: item.date || item.createdAt || item.stockInDate,
      quantity: item.quantity,
      type: "stock-in",
      supplier: item.supplier || item.supplierName || 'Unknown Supplier',
      notes: item.notes || item.description || '',
    }))

    const transformedStockOut = stockOutData.map((item: any) => ({
      id: item.id,
      reference: item.reference || item.referenceNumber || 'N/A',
      date: item.date || item.createdAt || item.stockOutDate,
      quantity: item.quantity,
      type: "stock-out",
      department: item.department || item.departmentName || 'Unknown Department',
      requester: item.requester || item.requesterName || 'Unknown Requester',
      notes: item.notes || item.description || '',
    }))

    // Combine and sort by date (newest first)
    const combinedHistory = [...transformedStockIn, ...transformedStockOut]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    console.log('Combined History:', combinedHistory)

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
        data: [],
      },
      { status: 500 },
    )
  }
}