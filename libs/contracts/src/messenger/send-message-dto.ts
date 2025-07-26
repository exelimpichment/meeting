import { sendMessageSchema } from './messenger.schema';
import { createZodDto } from 'nestjs-zod';

export class SendMessageDto extends createZodDto(sendMessageSchema) {}
