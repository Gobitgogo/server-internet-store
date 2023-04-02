import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsString()
  password?: string;

  @IsOptional()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avatarPath: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
