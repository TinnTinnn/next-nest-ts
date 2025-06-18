"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Download, History, QrCode, Search, FileSpreadsheet, RefreshCw } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { QRScannerModal } from "@/components/inventory/qr-scanner-modal"
import { ProductHistoryModal } from "@/components/inventory/product-history-modal"
import { toast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"

// Import ProductCategory และ ProductCategoryOptions จาก lib/types/product.ts
import { type ProductCategory, ProductCategoryOptions } from "@/lib/types/product"
import { Toaster } from "@/components/ui/toaster"

// Product interface
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

export default function InventoryPage() {
  const searchParams = useSearchParams()

  // State for products data
  const [allProducts, setAllProducts] = useState<Product[]>([])
  // State for loading
  const [loading, setLoading] = useState(true)
  // State for search term
  const [searchTerm, setSearchTerm] = useState("")
  // แก้ไข categoryFilter state ให้รองรับ ProductCategory
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all")
  // State for status filter - เพิ่ม "critical" option
  const [statusFilter, setStatusFilter] = useState("all")
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  // State for modals
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Set initial filter based on URL parameters
  useEffect(() => {
    const status = searchParams.get("status")
    if (status === "critical") {
      setStatusFilter("critical")
    } else if (status === "low-stock") {
      setStatusFilter("low-stock")
    } else if (status === "out-of-stock") {
      setStatusFilter("out-of-stock")
    } else if (status === "in-stock") {
      setStatusFilter("in-stock")
    }
  }, [searchParams])

  // Function to fetch all products
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/products")

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      const productsData = data.success ? data.products : data

      // Add mock timestamps if not present
      const productsWithTimestamps = productsData.map((product: any) => ({
        ...product,
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: product.updatedAt || new Date().toISOString(),
      }))

      setAllProducts(productsWithTimestamps)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to fetch inventory data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch products when component loads
  useEffect(() => {
    fetchProducts()
  }, [])

  // Function to determine product status
  const getProductStatus = (product: Product) => {
    if (product.quantity <= 0) {
      return { label: "Out of Stock", className: "bg-red-500/10 text-red-600 border-red-200", value: "out-of-stock" }
    } else if (product.quantity < product.minStock) {
      return { label: "Low Stock", className: "bg-yellow-500/10 text-yellow-600 border-yellow-200", value: "low-stock" }
    } else {
      return { label: "In Stock", className: "bg-green-500/10 text-green-600 border-green-200", value: "in-stock" }
    }
  }

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = allProducts

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.productId.toLowerCase().includes(searchLower) ||
          product.name.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower),
      )
    }

    // แก้ไขส่วนของการ filter products ตาม category
    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category === categoryFilter)
    }

    // Apply status filter - เพิ่มการจัดการ "critical" status
    if (statusFilter !== "all") {
      if (statusFilter === "critical") {
        // Critical includes both out-of-stock and low-stock
        filtered = filtered.filter((product) => {
          const status = getProductStatus(product).value
          return status === "out-of-stock" || status === "low-stock"
        })
      } else {
        filtered = filtered.filter((product) => getProductStatus(product).value === statusFilter)
      }
    }

    return filtered
  }, [allProducts, searchTerm, categoryFilter, statusFilter])

  // Calculate pagination
  const totalItems = filteredProducts.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Get products for current page
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, statusFilter])

  // Function to handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // Handle QR scan result
  const handleQRScanResult = (result: string) => {
    setSearchTerm(result)
    toast({
      title: "QR Code Scanned",
      description: `Searching for: ${result}`,
    })
  }

  // Handle view history
  const handleViewHistory = (product: Product) => {
    setSelectedProduct(product)
    setShowHistory(true)
  }

  // Export inventory to CSV
  const exportInventory = () => {
    if (filteredProducts.length === 0) {
      toast({
        title: "No Data",
        description: "No inventory data to export",
        variant: "destructive",
      })
      return
    }

    const csvContent = [
      ["Product ID", "Product Name", "Category", "Unit", "Quantity", "Price", "Min Stock", "Status", "Value"].join(","),
      ...filteredProducts.map((product) => {
        const status = getProductStatus(product)
        return [
          product.productId,
          `"${product.name}"`,
          product.category,
          product.unit,
          product.quantity,
          product.price.toFixed(2),
          product.minStock,
          status.label,
          (product.quantity * product.price).toFixed(2),
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Inventory data has been exported to CSV",
    })
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      pageNumbers.push(1)

      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 2) {
        endPage = 3
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2
      }

      if (startPage > 2) {
        pageNumbers.push("...")
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...")
      }

      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  // Calculate inventory summary
  const inventorySummary = useMemo(() => {
    const totalValue = filteredProducts.reduce((sum, product) => sum + product.quantity * product.price, 0)
    const lowStockCount = filteredProducts.filter(
      (product) => product.quantity < product.minStock && product.quantity > 0,
    ).length
    const outOfStockCount = filteredProducts.filter((product) => product.quantity <= 0).length

    return {
      totalProducts: filteredProducts.length,
      totalValue,
      lowStockCount,
      outOfStockCount,
    }
  }, [filteredProducts])

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Inventory Check"
        description="Check current inventory levels and product status"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowQRScanner(true)}>
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR/Barcode
            </Button>
            <Button variant="outline" size="sm" onClick={exportInventory}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        }
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Inventory Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{inventorySummary.totalProducts}</p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${inventorySummary.totalValue.toFixed(2)}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="text-green-600 font-bold">$</span>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-600">{inventorySummary.lowStockCount}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <span className="text-yellow-600 font-bold">!</span>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{inventorySummary.outOfStockCount}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="text-red-600 font-bold">×</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="rounded-md border shadow-sm border-primary/10">
          <div className="flex items-center justify-between p-4 bg-muted/50">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full pl-8 border-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                {/* แก้ไข Select component สำหรับ category filter */}
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value as ProductCategory | "all")}
                >
                  <SelectTrigger className="w-[180px] border-primary/20">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {ProductCategoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] border-primary/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="critical">Critical Items</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[100px]">Product ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading inventory data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <p className="text-muted-foreground">
                      {filteredProducts.length === 0 && allProducts.length > 0
                        ? "No products match your search criteria"
                        : "No inventory data found"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                currentProducts.map((product) => {
                  const status = getProductStatus(product)
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{product.productId}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell className="capitalize">{product.unit}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right">${(product.quantity * product.price).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={status.className}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewHistory(product)}>
                          <History className="h-4 w-4" />
                          <span className="sr-only">View History</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              {totalItems > 0 ? (
                <>
                  Showing {startItem} to {endItem} of {totalItems} items
                  {(searchTerm || categoryFilter !== "all" || statusFilter !== "all") && (
                    <span className="ml-1">(filtered from {allProducts.length} total)</span>
                  )}
                </>
              ) : (
                "No items to display"
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span key={`ellipsis-${index}`} className="px-2">
                    ...
                  </span>
                ) : (
                  <Button
                    key={`page-${page}`}
                    variant="outline"
                    size="sm"
                    className={`w-8 ${currentPage === page ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => handlePageChange(page as number)}
                    disabled={loading}
                  >
                    {page}
                  </Button>
                ),
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0 || loading}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* QR Scanner Modal */}
      <QRScannerModal open={showQRScanner} onOpenChange={setShowQRScanner} onScanResult={handleQRScanResult} />

      {/* Product History Modal */}
      <ProductHistoryModal
        open={showHistory}
        onOpenChange={setShowHistory}
        productId={selectedProduct?.id || null}
        productName={selectedProduct?.name || ""}
      />

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  )
}
