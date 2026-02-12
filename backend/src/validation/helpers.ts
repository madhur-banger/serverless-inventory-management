import { ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

// Formatting ZOD
export const formatZodErrors = (
  error: ZodError
): Array<{ field: string; message: string }> => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};


export const validateInput = <T>(
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: ZodError } },
  input: unknown
): T => {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      'Validation failed',
      formatZodErrors(result.error!)
    );
  }

  return result.data as T;
};