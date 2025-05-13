import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Download, History, QrCode, Search } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function InventoryPage() {
  return (
    <ProtectedRoute>
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Inventory Check"
        description="Check current inventory levels"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR/Barcode
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Excel
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
                <Input type="search" placeholder="Search products..." className="w-full pl-8 border-primary/20" />
              </div>
              <div className="flex items-center space-x-2">
                <Select defaultValue="all">
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
                <Select defaultValue="all">
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
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-muted/50">
                <TableCell className="font-medium">P001</TableCell>
                <TableCell>A4 Paper Double A</TableCell>
                <TableCell>Stationery</TableCell>
                <TableCell>Ream</TableCell>
                <TableCell className="text-right">120</TableCell>
                <TableCell className="text-right">$1,440.00</TableCell>
                <TableCell>
                  <Badge className="bg-green-500/10 text-green-600 border-green-200">In Stock</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <History className="h-4 w-4" />
                    <span className="sr-only">History</span>
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/50">
                <TableCell className="font-medium">P002</TableCell>
                <TableCell>HP 678 Black Ink Cartridge</TableCell>
                <TableCell>IT Equipment</TableCell>
                <TableCell>Cartridge</TableCell>
                <TableCell className="text-right">8</TableCell>
                <TableCell className="text-right">$360.00</TableCell>
                <TableCell>
                  <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Low Stock</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <History className="h-4 w-4" />
                    <span className="sr-only">History</span>
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/50">
                <TableCell className="font-medium">P003</TableCell>
                <TableCell>A4 Blue File Folders</TableCell>
                <TableCell>Office Supplies</TableCell>
                <TableCell>Folder</TableCell>
                <TableCell className="text-right">45</TableCell>
                <TableCell className="text-right">$292.50</TableCell>
                <TableCell>
                  <Badge className="bg-green-500/10 text-green-600 border-green-200">In Stock</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <History className="h-4 w-4" />
                    <span className="sr-only">History</span>
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/50">
                <TableCell className="font-medium">P004</TableCell>
                <TableCell>Stapler No.10</TableCell>
                <TableCell>Stationery</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell className="text-right">12</TableCell>
                <TableCell className="text-right">$102.00</TableCell>
                <TableCell>
                  <Badge className="bg-green-500/10 text-green-600 border-green-200">In Stock</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <History className="h-4 w-4" />
                    <span className="sr-only">History</span>
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/50">
                <TableCell className="font-medium">P005</TableCell>
                <TableCell>Yellow Post-it Notes</TableCell>
                <TableCell>Stationery</TableCell>
                <TableCell>Pack</TableCell>
                <TableCell className="text-right">0</TableCell>
                <TableCell className="text-right">$0.00</TableCell>
                <TableCell>
                  <Badge className="bg-red-500/10 text-red-600 border-red-200">Out of Stock</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <History className="h-4 w-4" />
                    <span className="sr-only">History</span>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">Showing 1 to 5 of 42 items</div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <Button variant="outline" size="sm" className="w-8">
                1
              </Button>
              <Button variant="outline" size="sm" className="w-8">
                2
              </Button>
              <Button variant="outline" size="sm" className="w-8">
                3
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}
