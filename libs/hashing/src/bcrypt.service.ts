import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcryptjs';
import { HashingService } from './hashing.service';

@Injectable()
export class BcryptService implements HashingService {
  async hash(data: string | Buffer): Promise<string> {
    const salt = await genSalt();
    const dataString: string = Buffer.isBuffer(data) ? data.toString() : data;
    return hash(dataString, salt);
  }

  compare(data: string | Buffer, encrypted: string): Promise<boolean> {
    const dataString: string = Buffer.isBuffer(data) ? data.toString() : data;
    return compare(dataString, encrypted);
  }
}
