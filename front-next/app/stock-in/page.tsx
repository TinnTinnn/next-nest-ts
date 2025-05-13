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
import ProtectedRoute from '@/components/ProtectedRoute';

export default function StockInPage() {
  return (
    <ProtectedRoute>
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
                    defaultValue="IN-20240515-001"
                    className="border-primary/20"
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
                <Select defaultValue="supplier1">
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
                <Textarea id="notes" placeholder="Additional details (if any)" className="border-primary/20" />
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
                <Button>Search</Button>
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
                        <Button variant="ghost" size="sm">
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
                        <Button variant="ghost" size="sm">
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
                        <Button variant="ghost" size="sm">
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
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-medium">P001</TableCell>
                  <TableCell>A4 Paper Double A</TableCell>
                  <TableCell>Ream</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-r-none">
                        <Minus className="h-4 w-4" />
                        <span className="sr-only">Decrease</span>
                      </Button>
                      <Input
                        type="number"
                        defaultValue="50"
                        className="h-8 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-x-0"
                      />
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-l-none">
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Increase</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">$12.00</TableCell>
                  <TableCell className="text-right">$600.00</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-medium">P002</TableCell>
                  <TableCell>HP 678 Black Ink Cartridge</TableCell>
                  <TableCell>Cartridge</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-r-none">
                        <Minus className="h-4 w-4" />
                        <span className="sr-only">Decrease</span>
                      </Button>
                      <Input
                        type="number"
                        defaultValue="10"
                        className="h-8 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-x-0"
                      />
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-l-none">
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Increase</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">$45.00</TableCell>
                  <TableCell className="text-right">$450.00</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="flex justify-between mt-6">
              <div>
                <p className="text-sm text-muted-foreground">Total items: 2</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">$1,050.00</p>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button>
                <PackagePlus className="mr-2 h-4 w-4" />
                Save Stock In
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
      </ProtectedRoute>
  )
}
