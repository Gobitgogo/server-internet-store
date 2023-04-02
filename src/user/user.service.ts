import { PrismaService } from './../prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common/exceptions';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(id: string, selectObject: Prisma.UserSelect = {}) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarPath: true,
        password: false,
        phone: true,
        favorites: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            slug: true,
          },
        },
        ...selectObject,
      },
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UserDto) {
    const isSameUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (isSameUser && userId !== isSameUser.id) {
      throw new Error('Email already exists');
    }

    const user = await this.findUserById(userId);

    const salt = await bcrypt.genSalt(10);

    const userUpdates: Prisma.UserUpdateInput = {
      email: dto.email,
      name: dto.name,
      avatarPath: dto.avatarPath,
      phone: dto.phone,
      password: dto.password
        ? await bcrypt.hash(dto.password, salt)
        : user.password,
    };

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: userUpdates,
    });

    return updatedUser;
  }

  async toggleFavorite(userId: string, productId: string) {
    const user = await this.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isProductInFavorites = user.favorites.some(
      (product) => product.id === productId,
    );
    const favorites = {
      [isProductInFavorites ? 'disconnect' : 'connect']: {
        id: productId,
      },
    };
    await this.prisma.user.update({
      where: { id: user.id },
      data: { favorites },
    });

    return 'Successfully';
  }
}
