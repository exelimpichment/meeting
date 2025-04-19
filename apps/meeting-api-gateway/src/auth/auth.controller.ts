import { AuthenticationService } from 'libs/iam/authentication/authentication.service';
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SignInDto } from 'libs/iam/authentication/dto/sign-in.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('sign-in') // api/sign-in
  @HttpCode(HttpStatus.OK)
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }
}
