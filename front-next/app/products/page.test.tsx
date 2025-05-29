import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductsPage from './page'; // Adjust path as necessary

// Mock child components that are not relevant to pagination testing
jest.mock('@/components/page-header', () => ({
  PageHeader: (props: any) => <div data-testid="page-header">{props.title}</div>,
}));
jest.mock('@/components/products/add-product-modal', () => ({
  AddProductModal: () => <div data-testid="add-product-modal"></div>,
}));
jest.mock('@/components/products/edit-product-modal', () => ({
  EditProductModal: () => <div data-testid="edit-product-modal"></div>,
}));
jest.mock('@/components/products/add-stock-modal', () => ({
  AddStockModal: () => <div data-testid="add-stock-modal"></div>,
}));
jest.mock('@/components/products/product-detail-modal', () => ({
  ProductDetailModal: () => <div data-testid="product-detail-modal"></div>,
}));
jest.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster"></div>,
}));
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));
jest.mock('@/lib/auth', () => ({
    fetchWithAuth: jest.fn(),
}));


// Mock global fetch
global.fetch = jest.fn();

// Mock window.scrollTo
global.scrollTo = jest.fn();

// Define Product type matching the one in page.tsx
interface Product {
    id: string;
    productId: string;
    name: string;
    category: string;
    unit: string;
    quantity: number;
    price: number;
    minStock: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

const mockProducts: Product[] = Array.from({ length: 25 }, (_, i) => ({
  id: `id-${i + 1}`,
  productId: `P00${i + 1}`,
  name: `Product ${i + 1}`,
  category: i % 2 === 0 ? 'Category A' : 'Category B',
  unit: 'pcs',
  quantity: 10 + i,
  price: 5.99 + i,
  minStock: 5,
  description: `Description for product ${i + 1}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

describe('ProductsPage - Pagination Logic', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    (global.scrollTo as jest.Mock).mockClear();
  });

  const itemsPerPage = 10; // As defined in ProductsPage

  async function setupPage(totalItems: number, productsForCurrentPage: Product[] = []) {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: productsForCurrentPage.length > 0 ? productsForCurrentPage : mockProducts.slice(0, Math.min(itemsPerPage, totalItems)),
        total: totalItems,
      }),
    });
    
    // Use act to ensure all state updates from fetch are processed
    await act(async () => {
        render(<ProductsPage />);
    });
    
    // Wait for loading to finish and data to be displayed
    await waitFor(() => expect(screen.queryByText(/Loading data.../i)).not.toBeInTheDocument());
  }


  describe('Showing X to Y of Z items text', () => {
    test('displays correctly on the first page with multiple pages', async () => {
      const totalItems = 25;
      await setupPage(totalItems);
      expect(screen.getByText(`Showing 1 to ${itemsPerPage} of ${totalItems} items`)).toBeInTheDocument();
    });

    test('displays correctly when on a middle page (e.g., page 2)', async () => {
      const totalItems = 25;
      const currentPage = 2;
      // Mock fetch for initial load (page 1)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: mockProducts.slice(0, itemsPerPage), total: totalItems }),
      });
      
      await act(async () => {
        render(<ProductsPage />);
      });
      await waitFor(() => {}); // wait for initial load


      // Mock fetch for page 2
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: mockProducts.slice(itemsPerPage, itemsPerPage * 2), total: totalItems }),
      });

      const page2Button = screen.getByRole('button', { name: '2' });
      await act(async () => {
        fireEvent.click(page2Button);
      });
      await waitFor(() => {}); // wait for page 2 load
      
      const expectedStart = (currentPage - 1) * itemsPerPage + 1;
      const expectedEnd = Math.min(currentPage * itemsPerPage, totalItems);
      expect(screen.getByText(`Showing ${expectedStart} to ${expectedEnd} of ${totalItems} items`)).toBeInTheDocument();
    });
    
    test('displays correctly on the last page', async () => {
      const totalItems = 23; // e.g. 3 pages, last page has 3 items
      const currentPage = 3;
       // Mock fetch for initial load (page 1)
       (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: mockProducts.slice(0, itemsPerPage), total: totalItems }),
      });
      await act(async () => {render(<ProductsPage />);});
      await waitFor(() => {});

      // Mock fetch for page 3
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: mockProducts.slice(itemsPerPage * 2, totalItems), total: totalItems }),
      });
      const page3Button = screen.getByRole('button', { name: '3' });
      await act(async () => {fireEvent.click(page3Button);});
      await waitFor(() => {});
      
      const expectedStart = (currentPage - 1) * itemsPerPage + 1;
      const expectedEnd = totalItems; // On last page, end is totalItems
      expect(screen.getByText(`Showing ${expectedStart} to ${expectedEnd} of ${totalItems} items`)).toBeInTheDocument();
    });

    test('displays correctly for a single page (less than itemsPerPage)', async () => {
      const totalItems = 5;
      await setupPage(totalItems, mockProducts.slice(0, totalItems));
      expect(screen.getByText(`Showing 1 to ${totalItems} of ${totalItems} items`)).toBeInTheDocument();
    });

    test('displays correctly when there are no items', async () => {
      const totalItems = 0;
      await setupPage(totalItems, []);
      // The text "Showing 1 to 0 of 0 items" might be how it's implemented, or "No products found"
      // Based on current implementation, it shows "No products found" in the table,
      // and the pagination text might show "Showing 1 to 0 of 0 items" or similar.
      // Let's check for the "No products found" text as a primary indicator.
      expect(screen.getByText(/No products found/i)).toBeInTheDocument();
      // And the pagination text:
      expect(screen.getByText(`Showing 1 to 0 of 0 items`)).toBeInTheDocument();
    });
  });

  describe('Page Buttons Rendering and State', () => {
    test('renders correct number of page buttons (max 5) and active state', async () => {
      const totalItems = 60; // 6 pages
      await setupPage(totalItems);
      const pageButtons = screen.getAllByRole('button', { name: /^[0-9]+$/ }); // Buttons with only numbers
      expect(pageButtons.length).toBe(Math.min(5, Math.ceil(totalItems / itemsPerPage)));
      expect(screen.getByRole('button', { name: '1' })).toHaveClass('bg-primary'); // Or whatever the active class is (using 'default' variant)
    });

    test('Previous/Next button states on first page', async () => {
      await setupPage(25); // More than one page
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
    });

    test('Previous/Next button states on last page', async () => {
        const totalItems = 25; // 3 pages
        await setupPage(totalItems); // Initially on page 1
  
        // Go to last page (page 3)
        (global.fetch as jest.Mock).mockResolvedValueOnce({ // For page 2
          ok: true, json: async () => ({ products: mockProducts.slice(10, 20), total: totalItems }),
        });
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: '2' })); });
        await waitFor(() => {});
  
        (global.fetch as jest.Mock).mockResolvedValueOnce({ // For page 3
            ok: true, json: async () => ({ products: mockProducts.slice(20, 25), total: totalItems }),
        });
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: '3' })); });
        await waitFor(() => {});
  
        expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled();
        expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
      });

    test('Previous/Next button states for a single page', async () => {
      await setupPage(5); // Less than itemsPerPage
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });
  });

  describe('Page Navigation', () => {
    test('clicking a page number button calls fetch for that page and scrolls', async () => {
      const totalItems = 30;
      await setupPage(totalItems);

      (global.fetch as jest.Mock).mockClear(); // Clear initial fetch call count
      (global.fetch as jest.Mock).mockResolvedValueOnce({ // For page 2
        ok: true,
        json: async () => ({ products: mockProducts.slice(10, 20), total: totalItems }),
      });

      const page2Button = screen.getByRole('button', { name: '2' });
      await act(async () => {
        fireEvent.click(page2Button);
      });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1); // Called for page 2
      });
      // Check if fetch was called with page=2
      const fetchCallArgs = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCallArgs).toContain('page=2');
      expect(global.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    test('clicking Next button calls fetch for the next page', async () => {
        const totalItems = 30;
        await setupPage(totalItems); // Initial load page 1
  
        (global.fetch as jest.Mock).mockClear();
        (global.fetch as jest.Mock).mockResolvedValueOnce({ // For page 2
          ok: true,
          json: async () => ({ products: mockProducts.slice(10, 20), total: totalItems }),
        });
  
        const nextButton = screen.getByRole('button', { name: /next/i });
        await act(async () => {
            fireEvent.click(nextButton);
        });
  
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledTimes(1);
        });
        const fetchCallArgs = (global.fetch as jest.Mock).mock.calls[0][0];
        expect(fetchCallArgs).toContain('page=2');
      });

      test('clicking Previous button calls fetch for the previous page', async () => {
        const totalItems = 30;
        // Initial load (page 1)
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true, json: async () => ({ products: mockProducts.slice(0, 10), total: totalItems }),
        });
        await act(async () => { render(<ProductsPage />); });
        await waitFor(() => {});
    
        // Go to page 2
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true, json: async () => ({ products: mockProducts.slice(10, 20), total: totalItems }),
        });
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: '2' })); });
        await waitFor(() => {});
    
        // Now on page 2, click Previous
        (global.fetch as jest.Mock).mockClear();
        (global.fetch as jest.Mock).mockResolvedValueOnce({ // For page 1
          ok: true, json: async () => ({ products: mockProducts.slice(0, 10), total: totalItems }),
        });
    
        const prevButton = screen.getByRole('button', { name: /previous/i });
        await act(async () => { fireEvent.click(prevButton); });
    
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledTimes(1);
        });
        const fetchCallArgs = (global.fetch as jest.Mock).mock.calls[0][0];
        expect(fetchCallArgs).toContain('page=1');
      });
  });
});
