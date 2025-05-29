import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductDetailModal from './product-detail-modal';

// Define a basic Product interface consistent with the component
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
}

const mockProduct: Product = {
  id: 'prod123',
  productId: 'P001',
  name: 'Test Product Name',
  description: 'This is a detailed description of the test product.',
  category: 'Test Category',
  supplier: 'Test Supplier',
  quantity: 50,
  minStock: 10,
  price: 99.99,
  createdAt: new Date('2023-01-15T10:00:00Z'),
  updatedAt: new Date('2023-01-16T12:30:00Z'),
};

describe('ProductDetailModal', () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    mockOnOpenChange.mockClear();
  });

  test('renders correctly and shows product details when open and product is provided', () => {
    render(
      <ProductDetailModal
        open={true}
        onOpenChange={mockOnOpenChange}
        product={mockProduct}
      />
    );

    // Check title
    expect(screen.getByText(`Product Details: ${mockProduct.name}`)).toBeInTheDocument();
    expect(screen.getByText(`Viewing details for product ID: ${mockProduct.productId}`)).toBeInTheDocument();

    // Check various product fields
    expect(screen.getByLabelText('Product ID')).toHaveTextContent(mockProduct.productId);
    expect(screen.getByLabelText('Name')).toHaveTextContent(mockProduct.name);
    expect(screen.getByLabelText('Description')).toHaveTextContent(mockProduct.description!);
    expect(screen.getByLabelText('Category')).toHaveTextContent(mockProduct.category!);
    expect(screen.getByLabelText('Supplier')).toHaveTextContent(mockProduct.supplier!);
    expect(screen.getByLabelText('Quantity')).toHaveTextContent(String(mockProduct.quantity));
    expect(screen.getByLabelText('Minimum Stock')).toHaveTextContent(String(mockProduct.minStock));
    expect(screen.getByLabelText('Price')).toHaveTextContent(`$${mockProduct.price!.toFixed(2)}`);
    
    // Check formatted dates (simplified check for presence, exact format depends on toLocaleDateString)
    expect(screen.getByLabelText('Created At')).toHaveTextContent('January 15, 2023'); // Check part of the date
    expect(screen.getByLabelText('Last Updated')).toHaveTextContent('January 16, 2023'); // Check part of the date
  });

  test('calls onOpenChange with false when Close button is clicked', () => {
    render(
      <ProductDetailModal
        open={true}
        onOpenChange={mockOnOpenChange}
        product={mockProduct}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledTimes(1);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  test('does not render content (returns null) if product is null', () => {
    const { container } = render(
      <ProductDetailModal
        open={true}
        onOpenChange={mockOnOpenChange}
        product={null}
      />
    );
    // The component returns null, so the dialog itself shouldn't be in the DOM.
    // Check if the container is empty or doesn't contain typical modal content.
    expect(container.firstChild).toBeNull(); 
    // Or check that a specific element from the modal is not present
    expect(screen.queryByText(`Product Details:`)).not.toBeInTheDocument();
  });

  test('does not render dialog content if open is false', () => {
    render(
      <ProductDetailModal
        open={false}
        onOpenChange={mockOnOpenChange}
        product={mockProduct}
      />
    );
    // When open is false, Dialog's onOpenChange might be called immediately by Radix UI if it handles visibility.
    // Or, the content itself is not rendered.
    // We expect the main dialog content (identified by its title, for example) not to be visible.
    // queryBy* is good for elements that might not be there.
    expect(screen.queryByText(`Product Details: ${mockProduct.name}`)).not.toBeInTheDocument();
  });

  test('displays N/A for optional fields if they are null or undefined', () => {
    const productWithMissingDetails: Product = {
      ...mockProduct,
      description: null,
      category: undefined,
      supplier: null,
      price: undefined,
    };
    render(
      <ProductDetailModal
        open={true}
        onOpenChange={mockOnOpenChange}
        product={productWithMissingDetails}
      />
    );
    expect(screen.getByLabelText('Description')).toHaveTextContent('N/A');
    expect(screen.getByLabelText('Category')).toHaveTextContent('N/A');
    expect(screen.getByLabelText('Supplier')).toHaveTextContent('N/A');
    expect(screen.getByLabelText('Price')).toHaveTextContent('N/A');
  });
});
