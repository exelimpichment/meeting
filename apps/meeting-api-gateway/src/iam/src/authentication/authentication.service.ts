import { UsersRepository } from '@apps/meeting-api-gateway/src/iam/src/users/repositories';
import { handlePrismaError } from '@apps/meeting-api-gateway/src/iam/src/common/utils';
import { SignInDto } from '@apps/meeting-api-gateway/src/iam/src/authentication/dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HashingService } from '@libs/hashing/src';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashingService: HashingService,
  ) {}

  async signUp(signInDto: SignInDto) {
    const email = signInDto.email;
    const password = signInDto.password;

    const hashedPassword = await this.hashingService.hash(password);

    try {
      return await this.usersRepository.create({
        email,
        hashedPassword,
      });
    } catch (error: unknown) {
      handlePrismaError(error);
    }
  }

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
}
