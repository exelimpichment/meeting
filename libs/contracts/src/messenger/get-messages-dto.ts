import { getMessagesSchema } from './messenger.schema';
import { createZodDto } from 'nestjs-zod';

export class GetMessagesDto extends createZodDto(getMessagesSchema) {}
