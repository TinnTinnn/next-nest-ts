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
  const [outOfStockProducts, setOutOfStockProducts] = useState<LowStockProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Fetch all products to check stock levels
        const response = await fetch("/api/products")
        if (response.ok) {
          const data = await response.json()
          const products = data.success ? data.products : data

          // Separate low stock and out of stock products
          const lowStock: LowStockProduct[] = []
          const outOfStock: LowStockProduct[] = []

          products.forEach((product: any) => {
            if (product.quantity <= 0) {
              outOfStock.push(product)
            } else if (product.quantity < product.minStock) {
              lowStock.push(product)
            }
          })

          setLowStockProducts(lowStock)
          setOutOfStockProducts(outOfStock)
        } else {
          console.error("Failed to fetch products")
          setLowStockProducts([])
          setOutOfStockProducts([])
        }
      } catch (error) {
        console.error("Error fetching stock data:", error)
        setLowStockProducts([])
        setOutOfStockProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchStockData()
  }, [])

  const handleViewItems = () => {
    // Navigate to inventory page with multiple status filters
    // We'll use URL parameters to filter both low-stock and out-of-stock items
    router.push("/inventory?status=critical")
  }

  const totalCriticalItems = lowStockProducts.length + outOfStockProducts.length

  if (isLoading) {
    return (
      <Alert variant="default" className="border-primary/20 bg-primary/5">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Loading...</AlertTitle>
        <AlertDescription>Checking inventory levels</AlertDescription>
      </Alert>
    )
  }

  if (totalCriticalItems === 0) {
    return (
      <Alert variant="default" className="border-green-600/20 bg-green-600/10">
        <AlertCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Inventory Status</AlertTitle>
        <AlertDescription>All products are above minimum stock levels</AlertDescription>
      </Alert>
    )
  }

  // Determine alert variant based on severity
  const hasOutOfStock = outOfStockProducts.length > 0
  const alertVariant = hasOutOfStock ? "destructive" : "default"
  const alertClass = hasOutOfStock ? "border-red-600/20 bg-red-600/10" : "border-yellow-600/20 bg-yellow-600/10"

  return (
    <Alert variant={alertVariant} className={alertClass}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{hasOutOfStock ? "Critical Stock Alert" : "Low Stock Alert"}</AlertTitle>
      <AlertDescription>
        <div className="space-y-1">
          {outOfStockProducts.length > 0 && (
            <div>
              <span className="font-medium text-red-600">
                {outOfStockProducts.length} {outOfStockProducts.length === 1 ? "item is" : "items are"} out of stock
              </span>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div>
              <span className={hasOutOfStock ? "text-muted-foreground" : "font-medium text-yellow-600"}>
                {lowStockProducts.length} {lowStockProducts.length === 1 ? "item is" : "items are"} below minimum stock
                level
              </span>
            </div>
          )}
          <div className="mt-2">
            <Button variant="link" className="p-0 h-auto" onClick={handleViewItems}>
              View Critical Items
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
