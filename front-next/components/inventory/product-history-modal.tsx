"use client"

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, PackagePlus, ShoppingCart, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ProductHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string | null
  productName: string
}

interface HistoryItem {
  id: string
  reference: string
  date: string
  quantity: number
  type: "stock-in" | "stock-out"
  supplier?: string
  department?: string
  requester?: string
  notes?: string
}

export function ProductHistoryModal({ open, onOpenChange, productId, productName }: ProductHistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  // Fetch product history
  const fetchHistory = async () => {
    if (!productId) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateRange.from) params.append("startDate", dateRange.from.toISOString())
      if (dateRange.to) params.append("endDate", dateRange.to.toISOString())

      const response = await fetch(`/api/inventory/${productId}/history?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch product history")
      }

      const data = await response.json()
      setHistory(data.success ? data.data : [])
    } catch (error) {
      console.error("Error fetching history:", error)
      toast({
        title: "Error",
        description: "Failed to fetch product history",
        variant: "destructive",
      })
      // Set mock data for demo
      setHistory([
        {
          id: "1",
          reference: "IN-20250604-001",
          date: "2025-06-04T10:00:00.000Z",
          quantity: 50,
          type: "stock-in",
          supplier: "Carpigiani Group S.p.A.",
          notes: "Monthly restock",
        },
        {
          id: "2",
          reference: "OUT-20250603-001",
          date: "2025-06-03T14:30:00.000Z",
          quantity: 10,
          type: "stock-out",
          department: "Production",
          requester: "John Smith",
          notes: "Production line requirement",
        },
        {
          id: "3",
          reference: "IN-20250601-001",
          date: "2025-06-01T09:15:00.000Z",
          quantity: 25,
          type: "stock-in",
          supplier: "Taylor Company",
          notes: "Emergency restock",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch history when modal opens or date range changes
  useEffect(() => {
    if (open && productId) {
      fetchHistory()
    }
  }, [open, productId, dateRange])

  // Export history to CSV
  const exportHistory = () => {
    if (history.length === 0) {
      toast({
        title: "No Data",
        description: "No history data to export",
        variant: "destructive",
      })
      return
    }

    const csvContent = [
      ["Date", "Type", "Reference", "Quantity", "Source/Destination", "Notes"].join(","),
      ...history.map((item) =>
        [
          format(new Date(item.date), "yyyy-MM-dd HH:mm"),
          item.type === "stock-in" ? "Stock In" : "Stock Out",
          item.reference,
          item.quantity,
          item.type === "stock-in" ? item.supplier || "" : `${item.department} (${item.requester})`,
          item.notes || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${productName}_history_${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "History data has been exported to CSV",
    })
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Movement History</DialogTitle>
          <DialogDescription>Movement history for {productName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date Range Filter */}
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={() => setDateRange({})} disabled={!dateRange.from && !dateRange.to}>
              Clear
            </Button>
            <Button variant="outline" onClick={exportHistory} disabled={history.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* History Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Source/Destination</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading history...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">No movement history found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            item.type === "stock-in"
                              ? "bg-green-500/10 text-green-600 border-green-200"
                              : "bg-red-500/10 text-red-600 border-red-200"
                          }
                        >
                          {item.type === "stock-in" ? (
                            <PackagePlus className="mr-1 h-3 w-3" />
                          ) : (
                            <ShoppingCart className="mr-1 h-3 w-3" />
                          )}
                          {item.type === "stock-in" ? "Stock In" : "Stock Out"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.reference}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.type === "stock-in" ? "text-green-600" : "text-red-600"}>
                          {item.type === "stock-in" ? "+" : "-"}
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.type === "stock-in" ? (
                          <span className="text-sm">{item.supplier}</span>
                        ) : (
                          <div className="text-sm">
                            <div className="font-medium">{item.department}</div>
                            <div className="text-muted-foreground">{item.requester}</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{item.notes}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          {history.length > 0 && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Movements</p>
                  <p className="text-2xl font-bold">{history.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Stock In</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{history.filter((h) => h.type === "stock-in").reduce((sum, h) => sum + h.quantity, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Stock Out</p>
                  <p className="text-2xl font-bold text-red-600">
                    -{history.filter((h) => h.type === "stock-out").reduce((sum, h) => sum + h.quantity, 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
