import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { UsersRepository } from '../users/repositories/users.repository';
import { HashingService } from '@libs/hashing/src';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashingService: HashingService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<boolean> {
    const user = await this.usersRepository.findOneByEmail(signInDto.email);

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    const isMatch = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Password does not match');
    }

    return true;
  }

  async signUp(signInDto: SignInDto) {
    const email = signInDto.email;
    const password = signInDto.password;

    const hashedPassword = await this.hashingService.hash(password);

    return this.usersRepository.create({
      email,
      hashedPassword,
    });
  }
}
