"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, FileSpreadsheet, Package, PackagePlus, ShoppingCart } from "lucide-react"

interface SummaryData {
  totalProducts: number
  stockIn: {
    totalItems: number
    percentChange: number
  }
  stockOut: {
    totalItems: number
    percentChange: number
  }
  inventoryValue: number
  inventoryValueChange: number
}

export function SummaryCards() {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalProducts: 0,
    stockIn: {
      totalItems: 0,
      percentChange: 0,
    },
    stockOut: {
      totalItems: 0,
      percentChange: 0,
    },
    inventoryValue: 0,
    inventoryValueChange: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const response = await fetch("/api/dashboard/summary")
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setSummaryData(result.data)
          } else {
            console.error("Failed to fetch summary data:", result.message)
          }
        } else {
          console.error("Failed to fetch summary data")
        }
      } catch (error) {
        console.error("Error fetching summary data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSummaryData()
  }, [])

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">{formatNumber(summaryData.totalProducts)} items</div>
              <p className="text-xs text-muted-foreground">
                {summaryData.inventoryValueChange > 0 ? "+" : ""}
                {summaryData.inventoryValueChange} items from last month
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock In</CardTitle>
          <PackagePlus className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-32 bg-muted animate-pulse rounded mt-1"></div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{formatNumber(summaryData.stockIn.totalItems)} items</div>
              <div
                className={`flex items-center text-xs ${
                  summaryData.stockIn.percentChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summaryData.stockIn.percentChange >= 0 ? (
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                )}
                <span>
                  {summaryData.stockIn.percentChange >= 0 ? "+" : ""}
                  {summaryData.stockIn.percentChange}% from last month
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock Out</CardTitle>
          <ShoppingCart className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-32 bg-muted animate-pulse rounded mt-1"></div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{formatNumber(summaryData.stockOut.totalItems)} items</div>
              <div
                className={`flex items-center text-xs ${
                  summaryData.stockOut.percentChange <= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summaryData.stockOut.percentChange > 0 ? (
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                )}
                <span>
                  {summaryData.stockOut.percentChange > 0 ? "+" : ""}
                  {summaryData.stockOut.percentChange}% from last month
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          <FileSpreadsheet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-32 bg-muted animate-pulse rounded mt-1"></div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{formatCurrency(summaryData.inventoryValue)}</div>
              <div
                className={`flex items-center text-xs ${
                  summaryData.inventoryValueChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summaryData.inventoryValueChange >= 0 ? (
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                )}
                <span>
                  {summaryData.inventoryValueChange >= 0 ? "+" : ""}
                  {summaryData.inventoryValueChange}% from last month
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
