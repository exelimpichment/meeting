import { editMessageSchema } from './messenger.schema';
import { createZodDto } from 'nestjs-zod';

export class EditMessageDto extends createZodDto(editMessageSchema) {}
