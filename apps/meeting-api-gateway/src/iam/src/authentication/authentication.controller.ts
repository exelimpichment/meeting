import { AuthenticationService } from './authentication.service';
import { jwtConfig } from '@/libs/shared-authentication/src/configs/jwt-config';
import { ConfigType } from '@nestjs/config';
import type { Response } from 'express';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Inject,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Auth } from '@/libs/shared-authentication/src/decorators/auth.decorator';
import { AuthType } from '@/libs/shared-authentication/src/types';

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  @Post('sign-up') // route: /auth/sign-up
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in') // route: /auth/sign-in
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() signInDto: SignInDto,
  ) {
    const token = await this.authService.signIn(signInDto);

    const accessTokenTtl = this.jwtConfiguration.JWT_ACCESS_TOKEN_TTL;
    const maxAge = accessTokenTtl ? Number(accessTokenTtl) * 1000 : 3600 * 1000;

    const environment = process.env.NODE_ENV || 'development';

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: environment !== 'development',
      sameSite: 'strict',
      maxAge,
    });

    return { success: true };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout') // route: /auth/logout
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { success: true };
  }
}
