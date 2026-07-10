import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(
    response: any,
    payload: {
      accessToken: string;
      refreshToken: string;
      csrfToken: string;
      rememberMe: boolean;
    },
  ) {
    const refreshMaxAge = payload.rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : undefined;

    const isProd = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

    const cookieOptions = (maxAge?: number) => ({
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      path: '/',
      ...(cookieDomain ? { domain: cookieDomain } : {}),
      ...(maxAge ? { maxAge } : {}),
    });

    response.cookie('access_token', payload.accessToken, {
      ...cookieOptions(
        payload.rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined,
      ),
    });

    response.cookie('refresh_token', payload.refreshToken, {
      ...cookieOptions(refreshMaxAge),
    });

    response.cookie('csrf_token', payload.csrfToken, {
      ...cookieOptions(refreshMaxAge),
      httpOnly: false,
    });
  }

  private clearAuthCookies(response: any) {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

    const baseOpts = {
      path: '/',
      secure: isProd,
      sameSite: (isProd ? 'strict' : 'lax') as 'strict' | 'lax',
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    };

    response.clearCookie('access_token', baseOpts);
    response.clearCookie('refresh_token', baseOpts);
    response.clearCookie('csrf_token', { ...baseOpts, httpOnly: false });
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Req() request: any) {
    return this.authService.register(registerDto, {
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: any,
    @Res({ passthrough: true }) response: any,
  ) {
    const result = await this.authService.login(loginDto, {
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    this.setAuthCookies(response, result);

    return {
      user: result.user,
    };
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Req() request: any,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto, {
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() request: any,
  ) {
    return this.authService.resetPassword(resetPasswordDto, {
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });
  }

  @Post('refresh')
  async refresh(
    @Req() request: any,
    @Res({ passthrough: true }) response: any,
  ) {
    const result = await this.authService.refresh({
      refreshToken: request.cookies?.refresh_token,
      csrfToken: request.headers['x-csrf-token'],
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    this.setAuthCookies(response, result);

    return {
      user: result.user,
    };
  }

  @Post('logout')
  async logout(@Req() request: any, @Res({ passthrough: true }) response: any) {
    await this.authService.logout(request.cookies?.refresh_token);
    this.clearAuthCookies(response);

    return {
      message: 'Sesión cerrada correctamente',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: any) {
    return this.authService.me(user.sub);
  }
}
