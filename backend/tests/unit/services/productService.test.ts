// tests/unit/services/productService.test.ts
// Unit tests for Product Service

import * as productService from '../../../src/services/productService';
import { productRepository } from '../../../src/repositories';
import { ValidationError } from '../../../src/utils/errors';
import {
  mockProduct,
  mockProductLowStock,
  validCreateProductInput,
  validUpdateProductInput,
  invalidProductInputs,
} from '../../mocks/testData';

// Mock the repository
jest.mock('../../../src/repositories', () => ({
  productRepository: {
    createProduct: jest.fn(),
    getProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    listProducts: jest.fn(),
  },
}));

const mockedRepo = productRepository as jest.Mocked<typeof productRepository>;

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // CREATE PRODUCT
  // ===========================================================================
  describe('createProduct', () => {
    it('should create product with valid input', async () => {
      mockedRepo.createProduct.mockResolvedValue(mockProduct);

      const result = await productService.createProduct(validCreateProductInput);

      expect(mockedRepo.createProduct).toHaveBeenCalledWith(validCreateProductInput);
      expect(result).toEqual(mockProduct);
    });

    it('should throw ValidationError for missing name', async () => {
      await expect(
        productService.createProduct(invalidProductInputs.missingName)
      ).rejects.toThrow(ValidationError);

      expect(mockedRepo.createProduct).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid category', async () => {
      await expect(
        productService.createProduct(invalidProductInputs.invalidCategory)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for negative price', async () => {
      await expect(
        productService.createProduct(invalidProductInputs.negativePrice)
      ).rejects.toThrow(ValidationError);
    });
  });

  // ===========================================================================
  // GET PRODUCT
  // ===========================================================================
  describe('getProduct', () => {
    it('should return product with lowStock flag (false)', async () => {
      mockedRepo.getProduct.mockResolvedValue(mockProduct);

      const result = await productService.getProduct(mockProduct.id);

      expect(mockedRepo.getProduct).toHaveBeenCalledWith(mockProduct.id);
      expect(result).toEqual({ ...mockProduct, lowStock: false });
    });

    it('should return product with lowStock flag (true)', async () => {
      mockedRepo.getProduct.mockResolvedValue(mockProductLowStock);

      const result = await productService.getProduct(mockProductLowStock.id);

      expect(result.lowStock).toBe(true);
    });
  });

  // ===========================================================================
  // UPDATE PRODUCT
  // ===========================================================================
  describe('updateProduct', () => {
    it('should update product with valid input', async () => {
      const updatedProduct = { ...mockProduct, ...validUpdateProductInput };
      mockedRepo.updateProduct.mockResolvedValue(updatedProduct);

      const result = await productService.updateProduct(
        mockProduct.id,
        validUpdateProductInput
      );

      expect(mockedRepo.updateProduct).toHaveBeenCalledWith(
        mockProduct.id,
        validUpdateProductInput
      );
      expect(result.name).toBe(validUpdateProductInput.name);
      expect(result.price).toBe(validUpdateProductInput.price);
    });

    it('should throw ValidationError for empty update', async () => {
      await expect(
        productService.updateProduct(mockProduct.id, {})
      ).rejects.toThrow(ValidationError);

      expect(mockedRepo.updateProduct).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid price', async () => {
      await expect(
        productService.updateProduct(mockProduct.id, { price: -100 })
      ).rejects.toThrow(ValidationError);
    });
  });

  // ===========================================================================
  // DELETE PRODUCT
  // ===========================================================================
  describe('deleteProduct', () => {
    it('should delete product by ID', async () => {
      mockedRepo.deleteProduct.mockResolvedValue(undefined);

      await productService.deleteProduct(mockProduct.id);

      expect(mockedRepo.deleteProduct).toHaveBeenCalledWith(mockProduct.id);
    });
  });

  // ===========================================================================
  // LIST PRODUCTS
  // ===========================================================================
  describe('listProducts', () => {
    it('should list products without filters', async () => {
      mockedRepo.listProducts.mockResolvedValue({
        items: [mockProduct],
        count: 1,
      });

      const result = await productService.listProducts({});

      expect(mockedRepo.listProducts).toHaveBeenCalledWith({});
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toHaveProperty('lowStock');
    });

    it('should list products with category filter', async () => {
      mockedRepo.listProducts.mockResolvedValue({
        items: [mockProduct],
        count: 1,
      });

      const result = await productService.listProducts({ category: 'electronics' });

      expect(mockedRepo.listProducts).toHaveBeenCalledWith({
        category: 'electronics',
      });
    });

    it('should add lowStock flag to items', async () => {
      mockedRepo.listProducts.mockResolvedValue({
        items: [mockProduct, mockProductLowStock],
        count: 2,
      });

      const result = await productService.listProducts({});

      expect(result.items[0].lowStock).toBe(false);
      expect(result.items[1].lowStock).toBe(true);
    });
  });

  // CHECK STOCK

  describe('checkStock', () => {
    it('should return low stock warning', () => {
      const result = productService.checkStock(mockProductLowStock);

      expect(result.isLow).toBe(true);
      expect(result.quantity).toBe(5);
      expect(result.threshold).toBe(10);
    });

    it('should not return warning for normal stock', () => {
      const result = productService.checkStock(mockProduct);

      expect(result.isLow).toBe(false);
      expect(result.quantity).toBe(100);
    });
  });
});