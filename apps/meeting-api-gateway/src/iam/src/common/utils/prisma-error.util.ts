import { ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export function handlePrismaError(error: unknown): never {
  console.log(error instanceof PrismaClientKnownRequestError);

  if (error instanceof PrismaClientKnownRequestError) {
    // console.log(error.code);

    if (error.code === 'P2002') {
      console.log('hello');
    }
    switch (error.code) {
      case 'P2002': {
        // Unique constraint violation

        const target = error.meta?.target as string[] | undefined;
        const field = target?.[0] ?? 'record';
        console.log('inside');

        throw new ConflictException(
          `A ${field} with this value already exists.`,
        );
      }

      default:
        // Re-throw unknown Prisma errors
        throw error;
    }
  }
  // Re-throw non-Prisma errors
  throw error;
}
