import { AuthenticationService } from './authentication.service';
import { Auth } from './decorators/auth.decorator';
import { MeetingApiGatewayEnv } from '../../../../meeting-api-gateway.schema';
import { AuthType } from './enums';
import { jwtConfig } from '../../jwt.config';
import { ConfigService } from '@libs/config/src/config.service';
import { ConfigType } from '@nestjs/config';
import { Response } from 'express';
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

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly configService: ConfigService<MeetingApiGatewayEnv>,
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

    const accessTokenTtl = this.jwtConfiguration.accessTokenTtl;
    const maxAge = accessTokenTtl ? Number(accessTokenTtl) * 1000 : 3600 * 1000;

    const nodeEnv = this.configService.get('NODE_ENV');

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: nodeEnv !== 'development',
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
