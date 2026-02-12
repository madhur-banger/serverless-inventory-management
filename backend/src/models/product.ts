

export interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number; // Stored in cents (e.g., 4999 = $49.99)
    quantity: number;
    sku: string;
    imageUrl?: string;
    createdAt: string; 
    updatedAt: string;
  }

export interface ProductDynamoItem extends Product {
    PK: string; 
    SK: string;
    GSI1PK: string; 
    GSI1SK: string; 
}
  

export interface CreateProductInput {
    name: string;
    description: string;
    category: string;
    price: number;
    quantity: number;
    sku: string;
    imageUrl?: string;
}
  

export interface UpdateProductInput {
    name?: string;
    description?: string;
    category?: string;
    price?: number;
    quantity?: number;
    sku?: string;
    imageUrl?: string;
}
  

export interface ListProductsParams {
    category?: string;
    search?: string;
    limit?: number;
    nextToken?: string;
}

export interface PaginatedProducts {
    items: Product[];
    count: number;
    nextToken?: string;
}
  

export const ProductCategories = [
    'electronics',
    'clothing',
    'home',
    'sports',
    'books',
    'toys',
    'food',
    'other',
  ] as const;
  
export type ProductCategory = (typeof ProductCategories)[number];
  

export const LOW_STOCK_THRESHOLD = 10;
  

export const isLowStock = (product: Product): boolean => {
    return product.quantity <= LOW_STOCK_THRESHOLD;
};
  

export const buildProductKeys = (
    id: string,
    category: string,
    createdAt: string
) => ({
    PK: `PRODUCT#${id}`,
    SK: 'METADATA',
    GSI1PK: `CATEGORY#${category}`,
    GSI1SK: createdAt,
});