import { WsException } from '@nestjs/websockets';
import { z } from 'zod';

export function validateDto<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorMessage = result.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new WsException(`Validation failed: ${errorMessage}`);
  }
  return result.data;
}
