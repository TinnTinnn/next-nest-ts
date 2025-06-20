import { NextResponse } from "next/server"
import { ProductCategory, ProductCategoryLabels } from "@/lib/types/product"

// GET /api/dashboard/categories - Get product distribution by category
export async function GET(request: Request) {
  try {
    // Call backend API for products
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, message: errorData.message || "Failed to fetch products" },
        { status: response.status },
      )
    }

    const products = await response.json()

    // Initialize categories with all possible categories from enum
    const categoryCounts: Record<string, { count: number; items: number }> = {}

    // Initialize with all categories from enum
    Object.values(ProductCategory).forEach((category) => {
      categoryCounts[category] = { count: 0, items: 0 }
    })

    // Count products by category
    products.forEach((product: any) => {
      if (categoryCounts[product.category]) {
        categoryCounts[product.category].count += 1
        categoryCounts[product.category].items += product.quantity || 0
      } else {
        // Handle case where product has category not in enum
        categoryCounts[product.category] = {
          count: 1,
          items: product.quantity || 0,
        }
      }
    })

    // Calculate percentages and prepare response
    const totalProducts = products.length
    const categoryData = Object.entries(categoryCounts)
      .filter(([_, data]) => data.count > 0) // Only include categories with products
      .map(([category, data]) => ({
        category,
        label: ProductCategoryLabels[category as ProductCategory] || category,
        count: data.count,
        items: data.items,
        percentage: totalProducts > 0 ? Math.round((data.count / totalProducts) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count) // Sort by count descending

    return NextResponse.json(
      {
        success: true,
        message: "Category distribution retrieved successfully",
        data: categoryData,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching category distribution:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch category distribution",
      },
      { status: 500 },
    )
  }
}
