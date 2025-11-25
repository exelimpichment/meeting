import { AuthSchema } from '@/apps/meeting-api-gateway/src/iam/src/authentication/dto/auth.schema';
import { createZodDto } from 'nestjs-zod';

export class SignUpDto extends createZodDto(AuthSchema) {}
