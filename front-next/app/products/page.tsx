"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  MoreHorizontal,
  PackagePlus,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { AddProductModal } from "@/components/products/add-product-modal"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchWithAuth } from '@/lib/auth';


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
  const [products, setProducts] = useState<Product[]>([])
  // State for loading
  const [loading, setLoading] = useState(true)
  // State for add product modal
  const [showAddModal, setShowAddModal] = useState(false)
  // State for search term
  const [searchTerm, setSearchTerm] = useState("")
  // State for category filter
  const [categoryFilter, setCategoryFilter] = useState("all")
  // State for status filter
  const [statusFilter, setStatusFilter] = useState("all")

  // Function to fetch all products
  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Create URL with query parameters
      let url = "/api/products"
      const params = new URLSearchParams()

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      if (categoryFilter !== "all") {
        params.append("category", categoryFilter)
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      // Call API
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data.success ? data.products : data)
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

  // Fetch products when component loads or filters change
  useEffect(() => {
    fetchProducts()
  }, [searchTerm, categoryFilter, statusFilter])

  // Function to delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const response = await fetchWithAuth(`http://localhost:3001/api/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete product")
      }

      toast({
        title: "Product Deleted",
        description: "The product has been removed from the system",
        variant: "success"
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

  // Function to determine product status
  const getProductStatus = (product: Product) => {
    if (product.quantity <= 0) {
      return { label: "Out of Stock", className: "bg-red-500/10 text-red-600 border-red-200" }
    } else if (product.quantity <= product.minStock) {
      return { label: "Low Stock", className: "bg-yellow-500/10 text-yellow-600 border-yellow-200" }
    } else {
      return { label: "In Stock", className: "bg-green-500/10 text-green-600 border-green-200" }
    }
  }

  return (
    // <ProtectedRoute>
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
                <Select defaultValue="all" value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px] border-primary/20">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="stationery">Stationery</SelectItem>
                    <SelectItem value="it">IT Equipment</SelectItem>
                    <SelectItem value="office">Office Supplies</SelectItem>
                    <SelectItem value="electrical">Electronics</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <p className="text-muted-foreground">No products found</p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const status = getProductStatus(product)
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{product.productId}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.unit}</TableCell>
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
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
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
              Showing 1 to {products.length} of {products.length} items
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <Button variant="outline" size="sm" className="w-8">
                1
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Add Product Modal */}
      <AddProductModal open={showAddModal} onOpenChange={setShowAddModal} onProductAdded={fetchProducts} />

      {/* Toaster for notifications */}
      <Toaster />
    </div>
    // </ProtectedRoute>
  )
}
