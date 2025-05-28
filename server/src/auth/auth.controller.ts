import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto } from './dto';
import { JwtGuard, JwtRtGuard, RolesGuard } from './guard';
import { GetUser } from './decorator';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignUpDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  logout(@GetUser() user: User) {
    return this.authService.logout(user.id);
  }

  @Post('logout-by-id')
  logoutById(@Body('') body: { userId: string }) {
    return this.authService.logout(body.userId);
  }

  @UseGuards(JwtRtGuard)
  @Post('refresh')
  refreshTokens(@GetUser() user: User & { refreshToken: string }) {
    return this.authService.refreshTokens(user.id, user.refreshToken);
  }
}
