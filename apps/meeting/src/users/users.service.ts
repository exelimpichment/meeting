import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getUser(id: string) {
    // Mocked user data - in a real app this would come from a database
    return {
      id,
      name: `User ${id}`,
      email: `user${id}@example.com`,
      createdAt: new Date().toISOString(),
    };
  }
}
