import {
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '../../../generated/iam-client/runtime/library';

export function handlePrismaError(error: unknown): never {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new ConflictException('Unique constraint violation');
      case 'P2025':
        throw new NotFoundException('Record not found');
      case 'P2003':
        throw new BadRequestException('Foreign key constraint failed');
      case 'P2014':
        throw new BadRequestException(
          'The change you are trying to make would violate the required relation',
        );
      case 'P2016':
        throw new BadRequestException('Query interpretation error');
      case 'P2001':
        throw new NotFoundException('Record does not exist');
      default:
        throw new BadRequestException(`Database error: ${error.code}`);
    }
  }
  throw error;
}
