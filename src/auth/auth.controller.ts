import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common/';
import { UsePipes } from '@nestjs/common/decorators';
import { ValidationPipe } from '@nestjs/common/pipes';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @Post('login/access-token')
  async getNewTokens(@Body() { refreshToken }: RefreshTokenDto) {
    return this.authService.getNewTokens(refreshToken);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }
}
