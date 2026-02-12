import {
    createProductSchema,
    updateProductSchema,
    productIdSchema,
    listProductsQuerySchema,
  } from '../../../src/validation/productSchema';
  import {
    validCreateProductInput,
    validUpdateProductInput,
    invalidProductInputs,
  } from '../../mocks/testData';
  
  describe('Product Validation Schemas', () => {

    // CREATE PRODUCT SCHEMA

    describe('createProductSchema', () => {
      it('should validate correct input', () => {
        const result = createProductSchema.safeParse(validCreateProductInput);
        expect(result.success).toBe(true);
      });
  
      it('should reject missing name', () => {
        const result = createProductSchema.safeParse(invalidProductInputs.missingName);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('name');
        }
      });
  
      it('should reject invalid category', () => {
        const result = createProductSchema.safeParse(invalidProductInputs.invalidCategory);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('category');
        }
      });
  
      it('should reject negative price', () => {
        const result = createProductSchema.safeParse(invalidProductInputs.negativePrice);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('price');
        }
      });
  
      it('should reject invalid SKU format', () => {
        const result = createProductSchema.safeParse(invalidProductInputs.invalidSku);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('sku');
        }
      });
  
      it('should accept optional imageUrl', () => {
        const inputWithoutImage = { ...validCreateProductInput };
        delete (inputWithoutImage as Record<string, unknown>).imageUrl;
        
        const result = createProductSchema.safeParse(inputWithoutImage);
        expect(result.success).toBe(true);
      });
  
      it('should validate all categories', () => {
        const categories = ['electronics', 'clothing', 'home', 'sports', 'books', 'toys', 'food', 'other'];
        
        categories.forEach((category) => {
          const result = createProductSchema.safeParse({
            ...validCreateProductInput,
            category,
          });
          expect(result.success).toBe(true);
        });
      });
    });
  

    // UPDATE PRODUCT SCHEMA

    describe('updateProductSchema', () => {
      it('should validate partial update', () => {
        const result = updateProductSchema.safeParse(validUpdateProductInput);
        expect(result.success).toBe(true);
      });
  
      it('should reject empty update', () => {
        const result = updateProductSchema.safeParse({});
        expect(result.success).toBe(false);
      });
  
      it('should allow updating single field', () => {
        const result = updateProductSchema.safeParse({ name: 'New Name' });
        expect(result.success).toBe(true);
      });
  
      it('should reject invalid price in update', () => {
        const result = updateProductSchema.safeParse({ price: -50 });
        expect(result.success).toBe(false);
      });
    });
  

    // PRODUCT ID SCHEMA

    describe('productIdSchema', () => {
      it('should validate valid UUID', () => {
        const result = productIdSchema.safeParse({
          id: '550e8400-e29b-41d4-a716-446655440000',
        });
        expect(result.success).toBe(true);
      });
  
      it('should reject invalid UUID', () => {
        const result = productIdSchema.safeParse({ id: 'not-a-uuid' });
        expect(result.success).toBe(false);
      });
  
      it('should reject empty string', () => {
        const result = productIdSchema.safeParse({ id: '' });
        expect(result.success).toBe(false);
      });
    });
  

    // LIST PRODUCTS QUERY SCHEMA

    describe('listProductsQuerySchema', () => {
      it('should validate empty query', () => {
        const result = listProductsQuerySchema.safeParse({});
        expect(result.success).toBe(true);
      });
  
      it('should validate category filter', () => {
        const result = listProductsQuerySchema.safeParse({ category: 'electronics' });
        expect(result.success).toBe(true);
      });
  
      it('should validate search filter', () => {
        const result = listProductsQuerySchema.safeParse({ search: 'keyboard' });
        expect(result.success).toBe(true);
      });
  
      it('should transform limit string to number', () => {
        const result = listProductsQuerySchema.safeParse({ limit: '20' });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(20);
        }
      });
  
      it('should reject limit over 100', () => {
        const result = listProductsQuerySchema.safeParse({ limit: '200' });
        expect(result.success).toBe(false);
      });
    });
  });