import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => request?.cookies?.access_token ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('AUTH_ACCESS_SECRET')!,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
    sessionId: string;
  }) {
    // Si está en modo prueba de estrés, saltar la verificación para máximo rendimiento
    if (process.env.STRESS_TEST === 'true') {
      return payload;
    }

    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
      select: {
        status: true,
        user: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!session || session.status !== 'ACTIVE' || session.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('La sesión o cuenta no está activa');
    }

    return payload;
  }
}

