import {
    Product,
    PaginatedProducts,
    isLowStock,
    LOW_STOCK_THRESHOLD,
} from '../models/product';
import { productRepository } from '../repositories';
import {
    createProductSchema,
    updateProductSchema,
    listProductsQuerySchema,
    CreateProductInput,
    UpdateProductInput,
  } from '../validation/productSchema';
import { validateInput } from '../validation/helpers';
import { logger } from '../utils/logger';
  

export interface ProductWithStockInfo extends Product {
    lowStock: boolean;
}
  

export const createProduct = async (input: unknown): Promise<Product> => {
    // Validate input
    const validatedInput = validateInput<CreateProductInput>(
      createProductSchema,
      input
    );
  
    logger.info('Creating new product', {
      name: validatedInput.name,
      category: validatedInput.category,
    });
  
    const product = await productRepository.createProduct(validatedInput);
  
    // Log if product starts with low stock
    if (isLowStock(product)) {
      logger.warn('New product has low stock', {
        productId: product.id,
        quantity: product.quantity,
        threshold: LOW_STOCK_THRESHOLD,
      });
    }
  
    return product;
};
  

export const getProduct = async (id: string): Promise<ProductWithStockInfo> => {
    logger.info('Getting product', { id });
  
    const product = await productRepository.getProduct(id);
  
    return {
      ...product,
      lowStock: isLowStock(product),
    };
};
  

export const updateProduct = async (
    id: string,
    input: unknown
  ): Promise<ProductWithStockInfo> => {
    // Validate input
    const validatedInput = validateInput<UpdateProductInput>(
      updateProductSchema,
      input
    );
  
    logger.info('Updating product', {
      id,
      fields: Object.keys(validatedInput),
    });
  
    const product = await productRepository.updateProduct(id, validatedInput);
  
    // Log stock level changes
    if (validatedInput.quantity !== undefined && isLowStock(product)) {
      logger.warn('Product stock is low after update', {
        productId: product.id,
        quantity: product.quantity,
        threshold: LOW_STOCK_THRESHOLD,
      });
    }
  
    return {
      ...product,
      lowStock: isLowStock(product),
    };
};
  

export const deleteProduct = async (id: string): Promise<void> => {
    logger.info('Deleting product', { id });
    await productRepository.deleteProduct(id);
};
  

export const listProducts = async (
    params: unknown
  ): Promise<PaginatedProducts & { items: ProductWithStockInfo[] }> => {
    // Validate query parameters
    const validatedParams = validateInput(listProductsQuerySchema, params || {});
  
    logger.info('Listing products', { params: validatedParams });
  
    const result = await productRepository.listProducts(validatedParams);
  
    // Add low stock flag to each item
    const itemsWithStockInfo: ProductWithStockInfo[] = result.items.map(
      (item) => ({
        ...item,
        lowStock: isLowStock(item),
      })
    );
  
    return {
      ...result,
      items: itemsWithStockInfo,
    };
};
  

export const checkStock = (
    product: Product
  ): {
    isLow: boolean;
    quantity: number;
    threshold: number;
  } => {
    return {
      isLow: isLowStock(product),
      quantity: product.quantity,
      threshold: LOW_STOCK_THRESHOLD,
    };
};
  

export const getLowStockProducts = async (): Promise<ProductWithStockInfo[]> => {
    logger.info('Getting low stock products');
  
    // Get all products (in production, you might want a GSI for this)
    const result = await productRepository.listProducts({ limit: 100 });
  
    const lowStockProducts = result.items
      .filter((product) => isLowStock(product))
      .map((product) => ({
        ...product,
        lowStock: true,
      }));
  
    logger.info('Low stock products found', { count: lowStockProducts.length });
  
    return lowStockProducts;
};