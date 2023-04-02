import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import {
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  public async login(dto: AuthDto) {
    const user = await this.validateUser(dto);
    const tokens = await this.issueTokens(user.id);
    const userData = this.returnUserFields(user);

    return {
      user: userData,
      ...tokens,
    };
  }

  public async getNewTokens(refreshToken: string) {
    try {
      const result = await this.jwt.verify(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: {
          id: result.id,
        },
      });
      const tokens = await this.issueTokens(result.id);
      const userData = this.returnUserFields(user);

      return { user: userData, ...tokens };
    } catch (error) {
      throw new HttpException('Invalid Token', 401);
    }
  }

  public async register(dto: AuthDto) {
    const oldUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (oldUser) {
      throw new BadRequestException('User already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(dto.password, salt);
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        name: dto.name || faker.name.firstName('female'),
        avatarPath: faker.image.avatar(),
        phone: faker.phone.number('+380 (98)###-##-##'),
      },
    });
    const tokens = await this.issueTokens(newUser.id);
    const userData = this.returnUserFields(newUser);

    return { user: userData, ...tokens };
  }

  private async issueTokens(userId: string) {
    const data = { id: userId };
    const accessToken = this.jwt.sign(data, {
      expiresIn: '1h',
    });
    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  private returnUserFields(user: User) {
    return {
      id: user.id,
      email: user.email,
    };
  }

  private async validateUser(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    const validPassword = await bcrypt.compare(dto.password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid password');
    }
    return user;
  }
}
