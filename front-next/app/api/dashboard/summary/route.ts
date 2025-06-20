import { NextResponse } from "next/server"

// GET /api/dashboard/summary - Get dashboard summary data
export async function GET(request: Request) {
  try {
    // Call backend API for products summary
    const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Call backend API for stock in summary
    const stockInResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stock-in/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Call backend API for stock out summary
    const stockOutResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stock-out/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Handle responses
    const productsData = productsResponse.ok ? await productsResponse.json() : { totalProducts: 0, totalValue: 0 }
    const stockInData = stockInResponse.ok ? await stockInResponse.json() : { totalItems: 0, percentChange: 0 }
    const stockOutData = stockOutResponse.ok ? await stockOutResponse.json() : { totalItems: 0, percentChange: 0 }

    // Calculate total inventory value
    const inventoryValue = productsData.totalValue || 0

    // If any of the APIs fail, use fallback data
    const summary = {
      totalProducts: productsData.totalProducts || 0,
      stockIn: {
        totalItems: stockInData.totalItems || 0,
        percentChange: stockInData.percentChange || 0,
      },
      stockOut: {
        totalItems: stockOutData.totalItems || 0,
        percentChange: stockOutData.percentChange || 0,
      },
      inventoryValue: inventoryValue,
      inventoryValueChange: productsData.valueChange || 0,
    }

    return NextResponse.json(
      {
        success: true,
        message: "Dashboard summary retrieved successfully",
        data: summary,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching dashboard summary:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch dashboard summary",
      },
      { status: 500 },
    )
  }
}
