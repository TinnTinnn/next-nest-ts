import { NextResponse } from "next/server"

// GET /api/dashboard/low-stock - Get low stock products
export async function GET(request: Request) {
  try {
    // Call backend API for low stock products
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/low-stock`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, message: errorData.message || "Failed to fetch low stock products" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(
      {
        success: true,
        message: "Low stock products retrieved successfully",
        data: data,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching low stock products:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch low stock products",
      },
      { status: 500 },
    )
  }
}
