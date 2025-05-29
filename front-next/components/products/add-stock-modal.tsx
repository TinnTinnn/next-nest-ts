"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { fetchWithAuth } from "@/lib/auth"

// Define the form schema with Zod
const addStockFormSchema = z.object({
  quantity: z.coerce.number().int().positive("Quantity must be a positive number"),
  notes: z.string().optional(),
})

type AddStockFormValues = z.infer<typeof addStockFormSchema>

interface AddStockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStockAdded?: () => void
  productId: string | null
  productName: string
}

export function AddStockModal({ open, onOpenChange, onStockAdded, productId, productName }: AddStockModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AddStockFormValues>({
    resolver: zodResolver(addStockFormSchema),
    defaultValues: {
      quantity: 1,
      notes: "",
    },
  })

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        quantity: 1,
        notes: "",
      })
    }
  }, [open, form])

  async function onSubmit(data: AddStockFormValues) {
    if (!productId) return

    setIsSubmitting(true)

    try {
      // Call the NestJS backend directly
      const response = await fetchWithAuth(`http://localhost:3001/api/products/${productId}/stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add stock")
      }

      toast({
        title: "Stock Added Successfully",
        description: `Added ${data.quantity} units to ${productName}`,
        variant: "success"
      })

      onOpenChange(false)

      // Refresh product list if callback provided
      if (onStockAdded) {
        onStockAdded()
      }
    } catch (error) {
      console.error("Error adding stock:", error)

      // Check if error is related to authentication
      if (error instanceof Error && error.message.includes("Authentication")) {
        toast({
          title: "Failed to Add Stock",
          description: "Please login before proceeding",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Failed to Add Stock",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Stock</DialogTitle>
          <DialogDescription>Add stock to {productName}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormDescription>Number of units to add to inventory</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter notes about this stock addition" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Stock"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
