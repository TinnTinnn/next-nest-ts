"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface LowStockProduct {
  id: string
  productId: string
  name: string
  quantity: number
  minStock: number
}

export function LowStockAlert() {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const response = await fetch("/api/dashboard/low-stock")
        if (response.ok) {
          const data = await response.json()
          setLowStockProducts(data.data || [])
        } else {
          console.error("Failed to fetch low stock products")
          setLowStockProducts([])
        }
      } catch (error) {
        console.error("Error fetching low stock products:", error)
        setLowStockProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLowStockProducts()
  }, [])

  const handleViewItems = () => {
    router.push("/inventory?status=low-stock")
  }

  if (isLoading) {
    return (
      <Alert variant="default" className="border-primary/20 bg-primary/5">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Loading...</AlertTitle>
        <AlertDescription>Checking inventory levels</AlertDescription>
      </Alert>
    )
  }

  if (lowStockProducts.length === 0) {
    return (
      <Alert variant="default" className="border-green-600/20 bg-green-600/10">
        <AlertCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Inventory Status</AlertTitle>
        <AlertDescription>All products are above minimum stock levels</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive" className="border-red-600/20 bg-red-600/10">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Low Stock Alert</AlertTitle>
      <AlertDescription>
        {lowStockProducts.length} {lowStockProducts.length === 1 ? "item is" : "items are"} below minimum stock level{" "}
        <Button variant="link" className="p-0 h-auto" onClick={handleViewItems}>
          View Items
        </Button>
      </AlertDescription>
    </Alert>
  )
}
