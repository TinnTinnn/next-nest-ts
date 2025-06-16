"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PackagePlus, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"

interface Activity {
  id: string
  type: "stock-in" | "stock-out"
  reference: string
  date: string
  productId: string
  productName: string
  quantity: number
  user: string
  source?: string
  destination?: string
}

interface AllActivitiesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AllActivitiesModal({ open, onOpenChange }: AllActivitiesModalProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const itemsPerPage = 10

  const fetchActivities = async (page = 1) => {
    setIsLoading(true)
    try {
      const offset = (page - 1) * itemsPerPage

      const response = await fetch(`/api/dashboard/activities?limit=${itemsPerPage}&offset=${offset}&page=${page}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setActivities(result.data.activities || result.data)

          if (result.data.pagination) {
            setTotalPages(result.data.pagination.totalPages || 1)
            setTotalItems(result.data.pagination.totalItems || 0)
          }
        } else {
          console.error("Failed to fetch activities:", result.message)
          setActivities([])
        }
      } else {
        console.error("Failed to fetch activities")
        setActivities([])
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchActivities(currentPage)
    }
  }, [open, currentPage])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy, HH:mm")
    } catch (error) {
      return "Invalid date"
    }
  }

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
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
        endPage = Math.min(3, totalPages - 1)
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(totalPages - 2, 2)
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

      if (totalPages > 1) {
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>All Activities</DialogTitle>
          <DialogDescription>Complete history of inventory movements</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activities found</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`${
                                activity.type === "stock-in" ? "bg-green-500/20" : "bg-red-500/20"
                              } p-1.5 rounded-full`}
                            >
                              {activity.type === "stock-in" ? (
                                <PackagePlus className="h-4 w-4 text-green-600" />
                              ) : (
                                <ShoppingCart className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                activity.type === "stock-in"
                                  ? "bg-green-500/10 text-green-600 border-green-200"
                                  : "bg-red-500/10 text-red-600 border-red-200"
                              }
                            >
                              {activity.type === "stock-in" ? "Stock In" : "Stock Out"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{activity.productName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="/placeholder-user.jpg" alt={`@${activity.user}`} />
                              <AvatarFallback>{getInitials(activity.user)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{activity.user}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(activity.date)}</TableCell>
                        <TableCell className="text-right">
                          {activity.quantity} {activity.quantity > 1 ? "units" : "unit"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)}{" "}
                    of {totalItems} activities
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
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
                          disabled={isLoading}
                        >
                          {page}
                        </Button>
                      ),
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
