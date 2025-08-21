import { AuthSchema } from './auth.schema';
import { createZodDto } from 'nestjs-zod';

export class SignInDto extends createZodDto(AuthSchema) {}
