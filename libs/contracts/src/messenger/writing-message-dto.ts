import { writingMessageSchema } from './messenger.schema';
import { createZodDto } from 'nestjs-zod';

export class WritingMessageDto extends createZodDto(writingMessageSchema) {}
