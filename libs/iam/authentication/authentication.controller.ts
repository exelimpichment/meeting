import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';

@Controller('authentication')
export class AuthenticationController {
  @Post('sign-in')
  @HttpCode(HttpStatus.OK) // Typically sign-in returns 200 OK
  signIn(@Body() signInDto: SignInDto) {
    // Here you would call your authentication service
    // e.g., return this.authService.signIn(signInDto);
    console.log('Received sign-in data:', signInDto);
    // For now, just return the validated DTO
    return signInDto;
  }
}
