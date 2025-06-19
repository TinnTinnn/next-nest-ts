"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface CategoryData {
  category: string
  label: string
  count: number
  items: number
  percentage: number
}

export function CategoryDistribution() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/dashboard/categories")
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setCategories(result.data)
          } else {
            console.error("Failed to fetch categories:", result.message)
            setCategories([])
          }
        } else {
          console.error("Failed to fetch categories")
          setCategories([])
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Generate random colors for categories that don't have predefined colors
  const getCategoryColor = (index: number) => {
    const predefinedColors = [
      "bg-primary",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
    ]

    return index < predefinedColors.length ? predefinedColors[index] : `bg-gray-500`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <p className="text-muted-foreground">No category data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {categories.slice(0, 6).map((category, index) => (
        <div key={category.category} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${getCategoryColor(index)}`}></div>
            <span className="text-sm">{category.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{category.percentage}%</span>
            <Badge variant="outline">{category.count} items</Badge>
          </div>
        </div>
      ))}

      {categories.length > 6 && (
        <div className="text-center text-sm text-muted-foreground pt-2">+{categories.length - 6} more categories</div>
      )}
    </div>
  )
}
