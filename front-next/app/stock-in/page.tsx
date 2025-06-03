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
import { CalendarIcon, Minus, PackagePlus, Plus, Search, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { toast } from "@/components/ui/use-toast"

import { fetchWithAuth } from "@/lib/auth"
import { type Supplier, SupplierOptions, getSupplierDisplayName } from "@/lib/types/supplier"
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

// Stock In Item interface
interface StockInItem {
  product: Product
  stockInQuantity: number
}

export default function StockInPage() {
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<StockInItem[]>([])
  const [reference, setReference] = useState(`IN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-001`)
  const [supplier, setSupplier] = useState<Supplier | "">("")
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

  // Filter products based on search term
  const filteredProducts = allProducts.filter(
    (product) =>
      product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Generate new reference number
  const generateNewReference = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    setReference(`IN-${today}-${randomNum}`)
  }

  const handleAddProduct = (product: Product) => {
    // Check if product already exists in selectedProducts
    if (selectedProducts.some((item) => item.product.id === product.id)) {
      toast({
        title: "Product Already Added",
        description: "This product is already in your stock in list",
        variant: "destructive",
      })
      return
    }

    // Add product to selectedProducts with quantity 1
    setSelectedProducts([...selectedProducts, { product, stockInQuantity: 1 }])
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((item) => item.product.id !== productId))
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return

    setSelectedProducts(
      selectedProducts.map((item) => (item.product.id === productId ? { ...item, stockInQuantity: quantity } : item)),
    )
  }

  const handleSaveStockIn = async () => {
    // Validation
    if (selectedProducts.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please add at least one product to stock in",
        variant: "destructive",
      })
      return
    }

    if (!supplier) {
      toast({
        title: "Supplier Required",
        description: "Please select a supplier",
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

    setIsSubmitting(true)

    try {
      const baseTimestamp = Date.now()

      // Process each product stock in
      const stockInPromises = selectedProducts.map(async (item, index) => {
        // สร้าง reference ที่ไม่ซ้ำกันด้วย timestamp + index
        const uniqueReference = `${reference.trim()}-${baseTimestamp + index}`

        const stockInData = {
          reference: uniqueReference,
          date: selectedDate.toISOString(),
          supplier: supplier,
          productId: item.product.id,
          quantity: item.stockInQuantity,
          unitPrice: item.product.price,
          notes: notes.trim() || undefined,
        }

        const response = await fetchWithAuth(`http://localhost:3001/api/stock-in`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockInData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Failed to add stock for ${item.product.name}`)
        }

        return response.json()
      })

      // Wait for all stock in operations to complete
      await Promise.all(stockInPromises)

      toast({
        title: "Stock In Saved Successfully",
        description: `${selectedProducts.length} products have been added to inventory from ${getSupplierDisplayName(supplier as Supplier)}`,
        variant: "success"
      })

      // Reset form
      setSelectedProducts([])
      generateNewReference()
      setSupplier("")
      setNotes("")
      setSelectedDate(new Date())

      // Refresh products data
      fetchProducts()
    } catch (error) {
      console.error("Error saving stock in:", error)

      // Check if error is related to authentication
      if (error instanceof Error && error.message.includes("Authentication")) {
        toast({
          title: "Failed to Save Stock In",
          description: "Please login before proceeding",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Failed to Save Stock In",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total value
  const totalValue = selectedProducts.reduce((total, item) => total + item.product.price * item.stockInQuantity, 0)

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Stock In" description="Record new items coming into inventory" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Stock In Details */}
          <Card className="border-primary/10 shadow-md">
            <CardHeader className="bg-muted/30 rounded-t-lg">
              <CardTitle>Stock In Details</CardTitle>
              <CardDescription>Enter document information and stock in details</CardDescription>
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
                <Label htmlFor="supplier">Supplier *</Label>
                <Select value={supplier} onValueChange={(value) => setSupplier(value as Supplier)}>
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {SupplierOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {supplier && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {getSupplierDisplayName(supplier as Supplier)}
                  </p>
                )}
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
              <CardDescription>Search for products to add to stock in</CardDescription>
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
                      <TableHead>Current Stock</TableHead>
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
                            {searchTerm ? "No products match your search" : "No products found"}
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
                            {product.quantity} {product.unit}s
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddProduct(product)}
                              disabled={selectedProducts.some((item) => item.product.id === product.id)}
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

        {/* Stock In Items */}
        <Card className="border-primary/10 shadow-md">
          <CardHeader className="bg-muted/30 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Stock In Items</CardTitle>
                <CardDescription>Items to be recorded as stock in</CardDescription>
              </div>
              {supplier && (
                <div className="text-right">
                  <p className="text-sm font-medium">Supplier</p>
                  <p className="text-xs text-muted-foreground">{getSupplierDisplayName(supplier as Supplier)}</p>
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
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
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
                        <div className="flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => handleQuantityChange(item.product.id, Math.max(1, item.stockInQuantity - 1))}
                          >
                            <Minus className="h-4 w-4" />
                            <span className="sr-only">Decrease</span>
                          </Button>
                          <Input
                            type="number"
                            value={item.stockInQuantity}
                            onChange={(e) =>
                              handleQuantityChange(item.product.id, Number.parseInt(e.target.value) || 1)
                            }
                            className="h-8 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-x-0"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => handleQuantityChange(item.product.id, item.stockInQuantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Increase</span>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${item.product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        ${(item.product.price * item.stockInQuantity).toFixed(2)}
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
                  setSupplier("")
                  setNotes("")
                  setSelectedDate(new Date())
                }}
              >
                Clear All
              </Button>
              <Button onClick={handleSaveStockIn} disabled={isSubmitting}>
                <PackagePlus className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Stock In"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  )
}
