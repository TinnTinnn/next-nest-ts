"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { toast } from "@/components/ui/use-toast"
import { fetchWithAuth } from "@/lib/auth"
import { type Department, DepartmentOptions } from "@/lib/types/department"
import { Toaster } from '@/components/ui/toaster';

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
}

// Stock Out Item interface
interface StockOutItem {
  product: Product
  stockOutQuantity: number
}

export default function StockOutPage() {
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<StockOutItem[]>([])
  const [reference, setReference] = useState(`OUT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-001`)
  const [department, setDepartment] = useState<Department | "">("")
  const [requester, setRequester] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Product search states
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // Fetch products from API
  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const response = await fetch("/api/products")
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      const productsData = data.success ? data.products : data
      setAllProducts(productsData)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // Load products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Filter products based on search term and available stock
  const filteredProducts = allProducts.filter(
    (product) =>
      product.quantity > 0 && // Only show products with available stock
      (product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Generate new reference number
  const generateNewReference = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    setReference(`OUT-${today}-${randomNum}`)
  }

  const handleAddProduct = (product: Product) => {
    // Check if product already exists in selectedProducts
    if (selectedProducts.some((item) => item.product.id === product.id)) {
      toast({
        title: "Product Already Added",
        description: "This product is already in your stock out list",
        variant: "destructive",
      })
      return
    }

    // Check if product has available stock
    if (product.quantity <= 0) {
      toast({
        title: "No Stock Available",
        description: "This product is out of stock",
        variant: "destructive",
      })
      return
    }

    // Add product to selectedProducts with quantity 1
    setSelectedProducts([...selectedProducts, { product, stockOutQuantity: 1 }])
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((item) => item.product.id !== productId))
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return

    // Find the product to check available stock
    const product = allProducts.find((p) => p.id === productId)
    if (product && quantity > product.quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.quantity} units available`,
        variant: "destructive",
      })
      return
    }

    setSelectedProducts(
      selectedProducts.map((item) => (item.product.id === productId ? { ...item, stockOutQuantity: quantity } : item)),
    )
  }

  const handleSaveStockOut = async () => {
    // Validation
    if (selectedProducts.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please add at least one product to stock out",
        variant: "destructive",
      })
      return
    }

    if (!department) {
      toast({
        title: "Department Required",
        description: "Please select a department",
        variant: "destructive",
      })
      return
    }

    if (!requester.trim()) {
      toast({
        title: "Requester Required",
        description: "Please enter requester name",
        variant: "destructive",
      })
      return
    }

    if (!reference.trim()) {
      toast({
        title: "Reference Required",
        description: "Please enter a reference number",
        variant: "destructive",
      })
      return
    }

    // Check stock availability for all products
    for (const item of selectedProducts) {
      const currentProduct = allProducts.find((p) => p.id === item.product.id)
      if (!currentProduct || item.stockOutQuantity > currentProduct.quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Not enough stock for ${item.product.name}. Available: ${currentProduct?.quantity || 0}`,
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)

    try {
      // --- PATCH: ส่งแต่ละ product ทีละ request เหมือน stock-in ---
      const baseTimestamp = Date.now()
      const stockOutPromises = selectedProducts.map(async (item, index) => {
        const uniqueReference = `${reference.trim()}-${baseTimestamp + index}`
        const stockOutData = {
          reference: uniqueReference,
          date: selectedDate.toISOString(),
          department: department,
          requester: requester.trim(),
          notes: notes.trim() || undefined,
          productId: item.product.id,
          quantity: item.stockOutQuantity,
          unitPrice: item.product.price,
        }
        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/stock-out`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockOutData),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Failed to remove stock for ${item.product.name}`)
        }
        return response.json()
      })
      await Promise.all(stockOutPromises)
      toast({
        title: "Stock Out Saved Successfully",
        description: `${selectedProducts.length} products have been removed from inventory for ${department}`,
        variant: "success",
      })
      // Reset form
      setSelectedProducts([])
      generateNewReference()
      setDepartment("")
      setRequester("")
      setNotes("")
      setSelectedDate(new Date())
      // Refresh products data
      fetchProducts()
      // --- END PATCH ---
    } catch (error) {
      console.error("Error saving stock out:", error)
      if (error instanceof Error && error.message.includes("Authentication")) {
        toast({
          title: "Failed to Save Stock Out",
          description: "Please login before proceeding",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Failed to Save Stock Out",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total value
  const totalValue = selectedProducts.reduce((total, item) => total + item.product.price * item.stockOutQuantity, 0)

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Stock Out" description="Record items being taken out of inventory" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Stock Out Details */}
          <Card className="border-primary/10 shadow-md">
            <CardHeader className="bg-muted/30 rounded-t-lg">
              <CardTitle>Stock Out Details</CardTitle>
              <CardDescription>Enter document information and stock out details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="reference"
                      placeholder="Reference number"
                      value={reference}
                      className="border-primary/20"
                      onChange={(e) => setReference(e.target.value)}
                    />
                    <Button variant="outline" size="sm" onClick={generateNewReference}>
                      Generate
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-primary/20"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "MMMM dd, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={department} onValueChange={(value) => setDepartment(value as Department)}>
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DepartmentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requester">Requester *</Label>
                <Input
                  id="requester"
                  placeholder="Enter requester name"
                  value={requester}
                  className="border-primary/20"
                  onChange={(e) => setRequester(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional details (if any)"
                  className="border-primary/20"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Search Products */}
          <Card className="border-primary/10 shadow-md">
            <CardHeader className="bg-muted/30 rounded-t-lg">
              <CardTitle>Search Products</CardTitle>
              <CardDescription>
                Search for products to add to stock out (only products with available stock)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by product ID, name, or category..."
                    className="pl-8 border-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={fetchProducts} disabled={isLoadingProducts}>
                  {isLoadingProducts ? "Loading..." : "Refresh"}
                </Button>
              </div>
              <div className="border rounded-md border-primary/10 shadow-sm max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Product ID</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Available Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingProducts ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="ml-2">Loading products...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          <p className="text-muted-foreground">
                            {searchTerm ? "No products match your search" : "No products with available stock"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{product.productId}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell className="capitalize">{product.category}</TableCell>
                          <TableCell>
                            <span className={product.quantity < product.minStock ? "text-yellow-600" : ""}>
                              {product.quantity} {product.unit}s
                            </span>
                            {product.quantity < product.minStock && (
                              <span className="text-xs text-yellow-600 block">Low Stock</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddProduct(product)}
                              disabled={
                                selectedProducts.some((item) => item.product.id === product.id) || product.quantity <= 0
                              }
                            >
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Add</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Out Items */}
        <Card className="border-primary/10 shadow-md">
          <CardHeader className="bg-muted/30 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Stock Out Items</CardTitle>
                <CardDescription>Items to be recorded as stock out</CardDescription>
              </div>
              {department && requester && (
                <div className="text-right">
                  <p className="text-sm font-medium">{department}</p>
                  <p className="text-xs text-muted-foreground">Requested by: {requester}</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[100px]">Product ID</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <p className="text-muted-foreground">No products added yet</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedProducts.map((item) => (
                    <TableRow key={item.product.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{item.product.productId}</TableCell>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell className="capitalize">{item.product.unit}</TableCell>
                      <TableCell>
                        <span className={item.product.quantity <= item.product.minStock ? "text-yellow-600" : ""}>
                          {item.product.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() =>
                              handleQuantityChange(item.product.id, Math.max(1, item.stockOutQuantity - 1))
                            }
                          >
                            <Minus className="h-4 w-4" />
                            <span className="sr-only">Decrease</span>
                          </Button>
                          <Input
                            type="number"
                            value={item.stockOutQuantity}
                            onChange={(e) =>
                              handleQuantityChange(item.product.id, Number.parseInt(e.target.value) || 1)
                            }
                            className="h-8 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-x-0"
                            min="1"
                            max={item.product.quantity}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => handleQuantityChange(item.product.id, item.stockOutQuantity + 1)}
                            disabled={item.stockOutQuantity >= item.product.quantity}
                          >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Increase</span>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${item.product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        ${(item.product.price * item.stockOutQuantity).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveProduct(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="flex justify-between mt-6">
              <div>
                <p className="text-sm text-muted-foreground">Total items: {selectedProducts.length}</p>
                {reference && <p className="text-xs text-muted-foreground">Reference: {reference}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedProducts([])
                  generateNewReference()
                  setDepartment("")
                  setRequester("")
                  setNotes("")
                  setSelectedDate(new Date())
                }}
              >
                Clear All
              </Button>
              <Button onClick={handleSaveStockOut} disabled={isSubmitting}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Stock Out"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  )
}
