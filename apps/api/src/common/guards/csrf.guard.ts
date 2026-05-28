import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return true;
    }

    const url = (request.originalUrl ?? request.url).split('?')[0];

    const publicPaths = new Set([
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/refresh',
    ]);

    if (publicPaths.has(url)) {
      return true;
    }

    const refreshToken = request.cookies?.refresh_token;
    const csrfToken = request.headers['x-csrf-token'];

    if (!refreshToken || typeof csrfToken !== 'string' || !csrfToken.trim()) {
      throw new UnauthorizedException('CSRF token requerido');
    }

    const isValid = await this.authService.validateCsrf({
      refreshToken,
      csrfToken,
    });

    if (!isValid) {
      throw new UnauthorizedException('CSRF token inválido');
    }

    return true;
  }
}
