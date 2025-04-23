import { UsersRepository } from '@apps/meeting-api-gateway/src/iam/src/users/repositories';
import { handlePrismaError } from '@apps/meeting-api-gateway/src/iam/src/common/utils';
import { SignInDto } from '@apps/meeting-api-gateway/src/iam/src/authentication/dto';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { HashingService } from '@libs/hashing/src';
import { JwtService } from '@nestjs/jwt';
import { jwtConfig } from '@apps/meeting-api-gateway/src/iam/jwt.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
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

  async signIn(signInDto: SignInDto): Promise<string> {
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

    // Generate JWT token using config values
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn: `${this.jwtConfiguration.accessTokenTtl}s`,
      },
    );

    return accessToken;
  }
}
