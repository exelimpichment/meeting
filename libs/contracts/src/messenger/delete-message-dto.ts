import { deleteMessageSchema } from './messenger.schema';
import { createZodDto } from 'nestjs-zod';

export class DeleteMessageDto extends createZodDto(deleteMessageSchema) {}
