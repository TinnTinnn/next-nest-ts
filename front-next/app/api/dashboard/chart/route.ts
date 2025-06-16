import { NextResponse } from "next/server"
import { format, subDays } from "date-fns"

// GET /api/dashboard/chart - Get inventory movement chart data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    // Calculate date range
    const endDate = new Date()
    const startDate = subDays(endDate, days)

    // Format dates for API
    const startDateStr = startDate.toISOString()
    const endDateStr = endDate.toISOString()

    // Call backend API for stock in data
    const stockInResponse = await fetch(
      `http://localhost:3001/api/stock-in/chart?startDate=${startDateStr}&endDate=${endDateStr}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    // Call backend API for stock out data
    const stockOutResponse = await fetch(
      `http://localhost:3001/api/stock-out/chart?startDate=${startDateStr}&endDate=${endDateStr}`,
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

    // Generate dates for the chart (last N days)
    const labels = []
    const stockInValues = []
    const stockOutValues = []

    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, days - 1 - i)
      const dateStr = format(date, "MMM dd")
      labels.push(dateStr)

      // Find matching data or use 0
      const dateFormatted = format(date, "yyyy-MM-dd")
      const stockInDay = stockInData.find((d: any) => d.date.startsWith(dateFormatted)) || { total: 0 }
      const stockOutDay = stockOutData.find((d: any) => d.date.startsWith(dateFormatted)) || { total: 0 }

      stockInValues.push(stockInDay.total)
      stockOutValues.push(stockOutDay.total)
    }

    const chartData = {
      labels,
      datasets: [
        {
          label: "Stock In",
          data: stockInValues,
        },
        {
          label: "Stock Out",
          data: stockOutValues,
        },
      ],
    }

    return NextResponse.json(
      {
        success: true,
        message: "Chart data retrieved successfully",
        data: chartData,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching chart data:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch chart data",
      },
      { status: 500 },
    )
  }
}
