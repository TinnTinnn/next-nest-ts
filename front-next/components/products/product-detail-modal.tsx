import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Define a basic Product interface if not available globally
// In a real application, this would likely be imported from a shared types file.
interface Product {
  id: string;
  productId: string;
  name: string;
  description?: string | null;
  category?: string | null;
  supplier?: string | null;
  quantity: number;
  minStock: number;
  price?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Add any other fields that might be present
}

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  open,
  onOpenChange,
  product,
}) => {
  if (!product) {
    return null; // Don't render the modal if no product is selected
  }

  // Helper to format date strings or Date objects
  const formatDate = (dateValue: Date | string | undefined | null) => {
    if (!dateValue) return 'N/A';
    return new Date(dateValue).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Helper to display value or 'N/A'
  const displayValue = (value: string | number | null | undefined) => value ?? 'N/A';


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800 shadow-xl rounded-lg">
        <DialogHeader className="pt-6 px-6">
          <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
            Product Details: {product.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Viewing details for product ID: {product.productId}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product ID</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {product.productId}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {product.name}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-700 rounded min-h-[40px]">
                {displayValue(product.description)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {displayValue(product.category)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {displayValue(product.supplier)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {product.quantity}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Stock</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {product.minStock}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {product.price !== null && product.price !== undefined ? `$${product.price.toFixed(2)}` : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Created At</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {formatDate(product.createdAt)}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {formatDate(product.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
