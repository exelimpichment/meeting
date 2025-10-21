import { AuthenticationService } from '@/apps/meeting-api-gateway/src/iam/src/authentication/authentication.service';
import { SignUpDto } from '@/apps/meeting-api-gateway/src/iam/src/authentication/dto/sign-up.dto';
import { SignInDto } from '@/apps/meeting-api-gateway/src/iam/src/authentication/dto/sign-in.dto';
import { Auth } from '@/libs/shared-authentication/src/decorators/auth.decorator';
import { jwtConfig } from '@/libs/shared-authentication/src/configs/jwt-config';
import { AuthType } from '@/libs/shared-authentication/src/types';
import { ConfigType } from '@nestjs/config';
import type { Response } from 'express';
import { Request } from 'express';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Inject,
  Req,
} from '@nestjs/common';

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() signInDto: SignInDto,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.signIn(signInDto);

    const accessTokenTtl = this.jwtConfiguration.JWT_ACCESS_TOKEN_TTL;
    const accessMaxAge = accessTokenTtl
      ? Number(accessTokenTtl) * 1000
      : 3600 * 1000;

    const refreshTtl = this.jwtConfiguration.JWT_REFRESH_TOKEN_TTL;
    const refreshMaxAge = refreshTtl ? Number(refreshTtl) * 1000 : 86400 * 1000;

    const environment = process.env.NODE_ENV || 'development';

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: environment !== 'development',
      sameSite: 'strict',
      maxAge: accessMaxAge,
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: environment !== 'development',
      sameSite: 'strict',
      maxAge: refreshMaxAge,
      path: '/',
    });

    return { success: true };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response, @Req() req: Request) {
    const refreshToken = req.cookies?.['refresh_token'] as string | undefined;

    response.clearCookie('access_token');
    response.clearCookie('refresh_token');

    void this.authService.logout(refreshToken);
    return { success: true };
  }
}
