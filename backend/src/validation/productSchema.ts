import { z } from 'zod';
import { ProductCategories } from '../models/product';


export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less')
    .trim(),

  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be 2000 characters or less')
    .trim(),

  category: z.enum(ProductCategories, {
    errorMap: () => ({
      message: `Category must be one of: ${ProductCategories.join(', ')}`,
    }),
  }),

  price: z
    .number()
    .int('Price must be a whole number (in cents)')
    .positive('Price must be positive')
    .max(100000000, 'Price exceeds maximum allowed'),

  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .max(1000000, 'Quantity exceeds maximum allowed'),

  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be 50 characters or less')
    .regex(
      /^[A-Za-z0-9-_]+$/,
      'SKU can only contain letters, numbers, hyphens, and underscores'
    )
    .trim(),

  imageUrl: z
    .string()
    .url('Image URL must be a valid URL')
    .max(500, 'Image URL must be 500 characters or less')
    .optional()
    .or(z.literal('')),
});


export const updateProductSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(200, 'Name must be 200 characters or less')
      .trim()
      .optional(),

    description: z
      .string()
      .min(1, 'Description cannot be empty')
      .max(2000, 'Description must be 2000 characters or less')
      .trim()
      .optional(),

    category: z
      .enum(ProductCategories, {
        errorMap: () => ({
          message: `Category must be one of: ${ProductCategories.join(', ')}`,
        }),
      })
      .optional(),

    price: z
      .number()
      .int('Price must be a whole number (in cents)')
      .positive('Price must be positive')
      .max(100000000, 'Price exceeds maximum allowed')
      .optional(),

    quantity: z
      .number()
      .int('Quantity must be a whole number')
      .min(0, 'Quantity cannot be negative')
      .max(1000000, 'Quantity exceeds maximum allowed')
      .optional(),

    sku: z
      .string()
      .min(1, 'SKU cannot be empty')
      .max(50, 'SKU must be 50 characters or less')
      .regex(
        /^[A-Za-z0-9-_]+$/,
        'SKU can only contain letters, numbers, hyphens, and underscores'
      )
      .trim()
      .optional(),

    imageUrl: z
      .string()
      .url('Image URL must be a valid URL')
      .max(500, 'Image URL must be 500 characters or less')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const productIdSchema = z.object({
  id: z.string().uuid('Invalid product ID format'),
});


export const listProductsQuerySchema = z.object({
  category: z.enum(ProductCategories).optional(),

  search: z
    .string()
    .max(100, 'Search term must be 100 characters or less')
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
        .max(100, 'Limit cannot exceed 100')
        .optional()
    ),

  nextToken: z
    .string()
    .max(1000, 'Invalid pagination token')
    .optional(),
});


export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;