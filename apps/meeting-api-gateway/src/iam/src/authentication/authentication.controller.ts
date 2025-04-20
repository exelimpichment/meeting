import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { AuthenticationService } from './authentication.service';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK) // Typically sign-in returns 200 OK
  signIn(@Body() signInDto: SignInDto) {
    // Call the injected service
    return this.authenticationService.signIn(signInDto);
  }
}
