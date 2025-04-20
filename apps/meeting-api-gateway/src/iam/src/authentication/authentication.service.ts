import { Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { UsersRepository } from '../users/repositories/users.repository';
import { HashingService } from '@libs/hashing/src';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashingService: HashingService,
  ) {}

  signIn(signInDto: SignInDto) {
    return { msg: signInDto };
  }

  async signUp(signInDto: SignInDto) {
    const email = signInDto.email;
    const password = signInDto.password;

    const passwordHash = await this.hashingService.hash(password);

    return this.usersRepository.create({
      email,
      passwordHash,
    });
  }
}
