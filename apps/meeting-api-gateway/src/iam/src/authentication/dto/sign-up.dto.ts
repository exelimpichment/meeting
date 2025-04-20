import { createZodDto } from 'nestjs-zod';
import { AuthSchema } from './auth.schema';

export class SignUpDto extends createZodDto(AuthSchema) {}
