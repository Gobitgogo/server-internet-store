import { CurrentUser } from './../auth/decorators/user.decorator';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @Auth()
  async getProfile(@CurrentUser('id') id: string) {
    return this.userService.findUserById(id);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @Auth()
  @Put('profile')
  async updateProfile(@CurrentUser('id') id: string, @Body() dto: UserDto) {
    return this.userService.updateProfile(id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Auth()
  @Patch('profile/favorites/:productId')
  async toggleFavorite(
    @CurrentUser('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.userService.toggleFavorite(id, productId);
  }
}
