import {
    createOrderSchema,
    orderIdSchema,
    listOrdersQuerySchema,
  } from '../../../src/validation/orderSchema';
  import {
    validCreateOrderInput,
    invalidOrderInputs,
  } from '../../mocks/testData';
  
  describe('Order Validation Schemas', () => {

    // CREATE ORDER SCHEMA

    describe('createOrderSchema', () => {
      it('should validate correct input', () => {
        const result = createOrderSchema.safeParse(validCreateOrderInput);
        expect(result.success).toBe(true);
      });
  
      it('should reject missing productId', () => {
        const result = createOrderSchema.safeParse(invalidOrderInputs.missingProductId);
        expect(result.success).toBe(false);
      });
  
      it('should reject invalid productId', () => {
        const result = createOrderSchema.safeParse(invalidOrderInputs.invalidProductId);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('productId');
        }
      });
  
      it('should reject zero quantity', () => {
        const result = createOrderSchema.safeParse(invalidOrderInputs.zeroQuantity);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('quantity');
        }
      });
  
      it('should reject quantity over 100', () => {
        const result = createOrderSchema.safeParse(invalidOrderInputs.tooManyQuantity);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('100');
        }
      });
  
      it('should accept quantity of 1', () => {
        const result = createOrderSchema.safeParse({
          productId: validCreateOrderInput.productId,
          quantity: 1,
        });
        expect(result.success).toBe(true);
      });
  
      it('should accept quantity of 100', () => {
        const result = createOrderSchema.safeParse({
          productId: validCreateOrderInput.productId,
          quantity: 100,
        });
        expect(result.success).toBe(true);
      });
    });
  

    // ORDER ID SCHEMA

    describe('orderIdSchema', () => {
      it('should validate valid UUID', () => {
        const result = orderIdSchema.safeParse({
          id: '660e8400-e29b-41d4-a716-446655440000',
        });
        expect(result.success).toBe(true);
      });
  
      it('should reject invalid UUID', () => {
        const result = orderIdSchema.safeParse({ id: 'invalid' });
        expect(result.success).toBe(false);
      });
    });

    // LIST ORDERS QUERY SCHEMA

    describe('listOrdersQuerySchema', () => {
      it('should validate empty query', () => {
        const result = listOrdersQuerySchema.safeParse({});
        expect(result.success).toBe(true);
      });
  
      it('should validate status filter', () => {
        const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        
        statuses.forEach((status) => {
          const result = listOrdersQuerySchema.safeParse({ status });
          expect(result.success).toBe(true);
        });
      });
  
      it('should reject invalid status', () => {
        const result = listOrdersQuerySchema.safeParse({ status: 'INVALID' });
        expect(result.success).toBe(false);
      });
  
      it('should transform limit string to number', () => {
        const result = listOrdersQuerySchema.safeParse({ limit: '10' });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(10);
        }
      });
    });
  });