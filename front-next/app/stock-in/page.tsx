"use client"

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
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from '@/components/ui/toaster';


export default function StockInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<any[]>([])
  const [reference, setReference] = useState(`IN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-001`)
  const [supplier, setSupplier] = useState("supplier1")
  const [notes, setNotes] = useState("")

  const handleAddProduct = (product: any) => {
    // Check if product already exists in selectedProducts
    if (selectedProducts.some((p) => p.id === product.id)) {
      toast({
        title: "Product Already Added",
        description: "This product is already in your stock in list",
        variant: "destructive",
      })
      return
    }

    // Add product to selectedProducts with quantity 1
    setSelectedProducts([...selectedProducts, { ...product, stockInQuantity: 1 }])
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId))
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    setSelectedProducts(selectedProducts.map((p) => (p.id === productId ? { ...p, stockInQuantity: quantity } : p)))
  }

  const handleSaveStockIn = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please add at least one product to stock in",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real system, you would call your API here
      // For now, we'll just simulate a successful stock in

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Stock In Saved",
        description: `${selectedProducts.length} products have been added to inventory`,
      })

      // Reset form
      setSelectedProducts([])
      setReference(
        `IN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
      )
      setNotes("")
    } catch (error) {
      console.error("Error saving stock in:", error)
      toast({
        title: "Error",
        description: "Failed to save stock in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Stock In" description="Record new items coming into inventory" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-primary/10 shadow-md">
            <CardHeader className="bg-muted/30 rounded-t-lg">
              <CardTitle>Stock In Details</CardTitle>
              <CardDescription>Enter document information and stock in details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    placeholder="Reference number"
                    value={reference}
                    className="border-primary/20"
                    onChange={(e) => setReference(e.target.value)}
                  />
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
                        {format(new Date(), "MMMM dd, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Select value={supplier} onValueChange={setSupplier}>
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier1">ABC Company Ltd.</SelectItem>
                    <SelectItem value="supplier2">Office Supplies Inc.</SelectItem>
                    <SelectItem value="supplier3">Stationery Wholesale Co.</SelectItem>
                  </SelectContent>
                </Select>
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
                    placeholder="Search by product ID or name..."
                    className="pl-8 border-primary/20"
                  />
                </div>
                <Button
                  onClick={() => {
                    // Simulate search functionality
                    toast({
                      title: "Search Feature",
                      description: "This is a demo. In a real system, this would search for products.",
                    })
                  }}
                >
                  Search
                </Button>
              </div>
              <div className="border rounded-md border-primary/10 shadow-sm">
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
                    <TableRow className="hover:bg-muted/50">
                      <TableCell className="font-medium">P001</TableCell>
                      <TableCell>A4 Paper Double A</TableCell>
                      <TableCell>Stationery</TableCell>
                      <TableCell>120 reams</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleAddProduct({
                              id: `P001`,
                              productId: `P001`,
                              name: "A4 Paper Double A",
                              category: "Stationery",
                              unit: "Ream",
                              quantity: 120,
                              price: 12.0,
                            })
                          }
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Add</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell className="font-medium">P002</TableCell>
                      <TableCell>HP 678 Black Ink Cartridge</TableCell>
                      <TableCell>IT Equipment</TableCell>
                      <TableCell>8 cartridges</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleAddProduct({
                              id: `P002`,
                              productId: `P002`,
                              name: "HP 678 Black Ink Cartridge",
                              category: "IT Equipment",
                              unit: "Cartridge",
                              quantity: 8,
                              price: 45.0,
                            })
                          }
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Add</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell className="font-medium">P005</TableCell>
                      <TableCell>Yellow Post-it Notes</TableCell>
                      <TableCell>Stationery</TableCell>
                      <TableCell>0 packs</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleAddProduct({
                              id: `P005`,
                              productId: `P005`,
                              name: "Yellow Post-it Notes",
                              category: "Stationery",
                              unit: "Pack",
                              quantity: 0,
                              price: 2.5,
                            })
                          }
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Add</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/10 shadow-md">
          <CardHeader className="bg-muted/30 rounded-t-lg">
            <CardTitle>Stock In Items</CardTitle>
            <CardDescription>Items to be recorded as stock in</CardDescription>
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
                  selectedProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{product.productId}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => handleQuantityChange(product.id, Math.max(1, product.stockInQuantity - 1))}
                          >
                            <Minus className="h-4 w-4" />
                            <span className="sr-only">Decrease</span>
                          </Button>
                          <Input
                            type="number"
                            value={product.stockInQuantity}
                            onChange={(e) => handleQuantityChange(product.id, Number.parseInt(e.target.value) || 1)}
                            className="h-8 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-x-0"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => handleQuantityChange(product.id, product.stockInQuantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Increase</span>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        ${(product.price * product.stockInQuantity).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveProduct(product.id)}
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
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  $
                  {selectedProducts
                    .reduce((total, product) => total + product.price * product.stockInQuantity, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <Button variant="outline">Cancel</Button>
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
