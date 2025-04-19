import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export class SignInDto extends createZodDto(SignInSchema) {}
