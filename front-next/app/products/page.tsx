"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCategory, ProductCategoryLabels } from "@/lib/types/product"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  PackagePlus,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { AddProductModal } from "@/components/products/add-product-modal"
import { EditProductModal } from "@/components/products/edit-product-modal"
import { AddStockModal } from "@/components/products/add-stock-modal"
import { ProductDetailModal } from "@/components/products/product-detail-modal"
import { toast } from "@/components/ui/use-toast"

import { fetchWithAuth } from "@/lib/auth"
import { Toaster } from '@/components/ui/toaster';

// Product data type
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

export default function ProductsPage() {
  // State for products data
  const [allProducts, setAllProducts] = useState<Product[]>([])
  // State for loading
  const [loading, setLoading] = useState(true)
  // State for add product modal
  const [showAddModal, setShowAddModal] = useState(false)
  // State for edit product modal
  const [showEditModal, setShowEditModal] = useState(false)
  // State for add stock modal
  const [showAddStockModal, setShowAddStockModal] = useState(false)
  // State for product detail modal
  const [showDetailModal, setShowDetailModal] = useState(false)
  // State for selected product
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  // State for search term
  const [searchTerm, setSearchTerm] = useState("")
  // State for category filter
  const [categoryFilter, setCategoryFilter] = useState<string | ProductCategory>("all")
  // State for status filter
  const [statusFilter, setStatusFilter] = useState("all")
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Function to fetch all products
  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Call API
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
        description: "Failed to fetch products. Please try again.",
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

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => 
        product.category.toLowerCase() === String(categoryFilter).toLowerCase()
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((product) => getProductStatus(product).value === statusFilter)
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

  // Function to delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete product")
      }

      toast({
        title: "Product Deleted",
        description: "The product has been removed from the system",
        variant: "success",
      })

      // Refresh product list
      fetchProducts()
    } catch (error) {
      console.error("Error deleting product:", error)

      // Check if error is related to authentication
      if (error instanceof Error && error.message.includes("Authentication")) {
        toast({
          title: "Failed to Delete Product",
          description: "Please login before proceeding",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Failed to Delete Product",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        })
      }
    }
  }

  // Function to open edit modal
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }

  // Function to open add stock modal
  const handleAddStock = (product: Product) => {
    setSelectedProduct(product)
    setShowAddStockModal(true)
  }

  // Function to open detail modal
  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product)
    setShowDetailModal(true)
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always show first page
      pageNumbers.push(1)

      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if we're at the start or end
      if (currentPage <= 2) {
        endPage = 3
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2
      }

      // Add ellipsis if needed
      if (startPage > 2) {
        pageNumbers.push("...")
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("...")
      }

      // Always show last page
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Products"
        description="Manage all products in the system"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <PackagePlus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        }
      />

      <main className="flex-1 p-6">
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
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px] border-primary/20">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(ProductCategory).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {ProductCategoryLabels[value as ProductCategory] || key}
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
                <TableHead className="text-right">Price per Unit</TableHead>
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
                      <p className="mt-2 text-sm text-muted-foreground">Loading data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <p className="text-muted-foreground">
                      {filteredProducts.length === 0 && allProducts.length > 0
                        ? "No products match your search criteria"
                        : "No products found"}
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
                      <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={status.className}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetail(product)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddStock(product)}>
                              <PackagePlus className="mr-2 h-4 w-4" />
                              Add Stock
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Add Product Modal */}
      <AddProductModal open={showAddModal} onOpenChange={setShowAddModal} onProductAdded={fetchProducts} />

      {/* Edit Product Modal */}
      <EditProductModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onProductUpdated={fetchProducts}
        productId={selectedProduct?.id || null}
      />

      {/* Add Stock Modal */}
      <AddStockModal
        open={showAddStockModal}
        onOpenChange={setShowAddStockModal}
        onStockAdded={fetchProducts}
        productId={selectedProduct?.id || null}
        productName={selectedProduct?.name || ""}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        productId={selectedProduct?.id || null}
      />

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  )
}
