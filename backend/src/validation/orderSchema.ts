import { z } from 'zod';


export const createOrderSchema = z.object({
  productId: z
    .string()
    .uuid('Invalid product ID format'),

  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Cannot order more than 100 items at once'),
});


export const orderIdSchema = z.object({
  id: z.string().uuid('Invalid order ID format'),
});


export const listOrdersQuerySchema = z.object({
  status: z
    .enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    .optional(),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(
      z
        .number()
        .int()
        .min(1, 'Limit must be at least 1')
        .max(50, 'Limit cannot exceed 50')
        .optional()
    ),

  nextToken: z
    .string()
    .max(1000, 'Invalid pagination token')
    .optional(),
});


export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;