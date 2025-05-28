import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, SignUpDto } from './dto';
import { User } from '@prisma/client';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignUpDto) {
    const hashPwd = await argon.hash(dto.password);

    try {
      const newsUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role,
          password: hashPwd,
        },
      });

      const data = await this.signTokens(newsUser);
      await this.updateRefreshToken(newsUser.id, data.refreshToken);
      return data;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new ForbiddenException('Invalid credentials');

    const isPwdMatch = await argon.verify(user.password, dto.password);
    if (!isPwdMatch) throw new ForbiddenException('Invalid credentials');

    const data = await this.signTokens(user);
    await this.updateRefreshToken(user.id, data.refreshToken);
    return data;
  }

  async logout(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ForbiddenException('Invalid credentials');

    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: null },
    });
    return {
      message: 'Logout successfully',
    };
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    console.log('refreshTokens rt', rt);
    console.log('refreshTokens user', user);
    if (!user || !user.hashedRt)
      throw new ForbiddenException('User not found! Access denied');

    const isRtMatch = await argon.verify(user.hashedRt, rt);
    console.log('refreshTokens isRtMatch', isRtMatch);
    if (!isRtMatch)
      throw new ForbiddenException('Refresh Token not matched! Access denied');

    const data = await this.signTokens(user);
    await this.updateRefreshToken(user.id, data.refreshToken);
    return data;
  }

  async signTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: Partial<User>;
  }> {
    const data = {
      sub: user.id,
      email: user.email,
    };
    const secretAccessToken = this.config.get('JWT_AT_SECRET');
    const accessTokenTtl = this.config.get('JWT_AT_TTL');
    const accessToken = await this.jwt.signAsync(data, {
      expiresIn: accessTokenTtl,
      secret: secretAccessToken,
    });

    const secretRefreshToken = this.config.get('JWT_RT_SECRET');
    const refreshTokenTtl = this.config.get('JWT_RT_TTL');
    const refreshToken = await this.jwt.signAsync(data, {
      expiresIn: refreshTokenTtl,
      secret: secretRefreshToken,
    });

    const expiresIn = new Date().getTime() + 1000 * 5; // 5s
    // const expiresIn = new Date().getTime() + 1000 * 60 * 60; // 1h

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await argon.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: hash },
    });
  }
}
