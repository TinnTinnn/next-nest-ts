"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Package, DollarSign, AlertTriangle, FileText, Tag, Ruler } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Product {
  id: string
  productId: string
  name: string
  category: string
  unit: string
  quantity: number
  price: number
  minStock: number
  description?: string
  createdAt: string
  updatedAt: string
}

interface ProductDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string | null
}

export function ProductDetailModal({ open, onOpenChange, productId }: ProductDetailModalProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch product data when modal opens and productId changes
  useEffect(() => {
    if (open && productId) {
      const fetchProductData = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/products/${productId}`)
          if (!response.ok) {
            throw new Error("Failed to fetch product data")
          }

          const data = await response.json()
          const productData = data.product || data
          setProduct(productData)
        } catch (error) {
          console.error("Error fetching product:", error)
          toast({
            title: "Error",
            description: "Failed to fetch product details",
            variant: "destructive",
          })
          onOpenChange(false)
        } finally {
          setIsLoading(false)
        }
      }

      fetchProductData()
    }
  }, [open, productId, onOpenChange])

  // Function to determine product status
  const getProductStatus = (product: Product) => {
    if (product.quantity <= 0) {
      return { label: "Out of Stock", className: "bg-red-500/10 text-red-600 border-red-200", icon: AlertTriangle }
    } else if (product.quantity <= product.minStock) {
      return {
        label: "Low Stock",
        className: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
        icon: AlertTriangle,
      }
    } else {
      return { label: "In Stock", className: "bg-green-500/10 text-green-600 border-green-200", icon: Package }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>Complete information about this product</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : product ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <Badge className={getProductStatus(product).className}>
                  {React.createElement(getProductStatus(product).icon, { className: "w-3 h-3 mr-1" })}
                  {getProductStatus(product).label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Tag className="w-4 h-4 mr-2" />
                    Product ID
                  </div>
                  <p className="font-medium">{product.productId}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="w-4 h-4 mr-2" />
                    Category
                  </div>
                  <p className="font-medium capitalize">{product.category}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Ruler className="w-4 h-4 mr-2" />
                    Unit
                  </div>
                  <p className="font-medium capitalize">{product.unit}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Price per Unit
                  </div>
                  <p className="font-medium">${product.price.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Stock Information */}
            <div className="space-y-4">
              <h4 className="font-semibold">Stock Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Package className="w-4 h-4 mr-2" />
                    Current Stock
                  </div>
                  <p className="text-2xl font-bold">{product.quantity}</p>
                  <p className="text-sm text-muted-foreground">{product.unit}s</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Minimum Stock Level
                  </div>
                  <p className="text-2xl font-bold">{product.minStock}</p>
                  <p className="text-sm text-muted-foreground">{product.unit}s</p>
                </div>
              </div>

              {/* Stock Status Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Stock Level</span>
                  <span>{Math.round((product.quantity / (product.minStock * 3)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      product.quantity <= 0
                        ? "bg-red-500"
                        : product.quantity <= product.minStock
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(Math.max((product.quantity / (product.minStock * 3)) * 100, 5), 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h4 className="font-semibold">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="space-y-4">
              <h4 className="font-semibold">Record Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created At
                  </div>
                  <p className="text-sm">{formatDate(product.createdAt)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last Updated
                  </div>
                  <p className="text-sm">{formatDate(product.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Value Calculation */}
            <Separator />
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Inventory Value</span>
                <span className="text-xl font-bold text-primary">${(product.quantity * product.price).toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {product.quantity} {product.unit}s × ${product.price.toFixed(2)} per {product.unit}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Product not found</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
