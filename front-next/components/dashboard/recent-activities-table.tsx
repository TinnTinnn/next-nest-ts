"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PackagePlus, ShoppingCart } from "lucide-react"
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

interface RecentActivitiesTableProps {
  initialLimit?: number
}

export function RecentActivitiesTable({ initialLimit = 5 }: RecentActivitiesTableProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/dashboard/activities?limit=${initialLimit}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setActivities(result.data.activities || result.data)
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

    fetchActivities()
  }, [initialLimit])

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent activities found</p>
      </div>
    )
  }

  return (
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
                  className={`${activity.type === "stock-in" ? "bg-green-500/20" : "bg-red-500/20"} p-1.5 rounded-full`}
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
  )
}
