import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import * as nodemailer from 'nodemailer';
import {
  SessionStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterAccountType, RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private normalizeOptional(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private maskDocumentNumber(value?: string | null) {
    if (!value) return null;
    const cleaned = value.trim();
    if (cleaned.length <= 4) return '*'.repeat(cleaned.length);
    return `${'*'.repeat(cleaned.length - 4)}${cleaned.slice(-4)}`;
  }

  private getRefreshExpiryDate(rememberMe: boolean) {
    const days = Number(
      this.configService.get<string>('AUTH_REFRESH_TTL_DAYS') ?? '30',
    );
    const expiresAt = new Date();

    if (rememberMe) {
      expiresAt.setDate(expiresAt.getDate() + days);
      return expiresAt;
    }

    expiresAt.setDate(expiresAt.getDate() + 1);
    return expiresAt;
  }

  private getPasswordResetExpiryDate() {
    const minutes = Number(
      this.configService.get<string>('PASSWORD_RESET_TTL_MINUTES') ?? '30',
    );
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + minutes);
    return expiresAt;
  }

  private getWebUrl() {
    return (
      this.configService.get<string>('APP_WEB_URL') ?? 'http://localhost:3000'
    );
  }

  private async sendPasswordResetEmail(params: {
    to: string;
    fullName: string;
    resetLink: string;
  }) {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST') ?? 'localhost',
      port: Number(this.configService.get<string>('MAIL_PORT') ?? '1025'),
      secure: false,
    });

    const from =
      this.configService.get<string>('MAIL_FROM') ?? 'no-reply@servilocal.pe';

    await transporter.sendMail({
      from,
      to: params.to,
      subject: 'Recupera tu contraseña - ServiLocal',
      text: `Hola ${params.fullName}, usa este enlace para restablecer tu contraseña: ${params.resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
          <h2 style="margin-bottom: 8px;">Recupera tu contraseña</h2>
          <p>Hola <strong>${params.fullName}</strong>, recibimos una solicitud para restablecer tu contraseña en ServiLocal.</p>
          <p>Haz clic en el siguiente botón:</p>
          <p style="margin: 24px 0;">
            <a href="${params.resetLink}" style="background:#1EA8E7;color:#ffffff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;">
              Restablecer contraseña
            </a>
          </p>
          <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p>${params.resetLink}</p>
          <p>Este enlace vencerá pronto por seguridad.</p>
        </div>
      `,
    });
  }

  async register(
    registerDto: RegisterDto,
    context: { ip?: string; userAgent?: string },
  ) {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    if (registerDto.accountType === RegisterAccountType.CLIENT && registerDto.documentNumber) {
      const existingUserWithDoc = await this.prisma.user.findFirst({
        where: {
          documentNumber: registerDto.documentNumber,
        },
      });

      if (existingUserWithDoc) {
        throw new ConflictException('El número de documento ya está registrado');
      }
    }

    if (registerDto.accountType === RegisterAccountType.PROVIDER) {
      const existingProviderWithRuc =
        await this.prisma.providerProfile.findUnique({
          where: {
            ruc: registerDto.ruc!,
          },
        });

      if (existingProviderWithRuc) {
        throw new ConflictException('El RUC ya está registrado');
      }

      if (
        registerDto.category === 'otro-servicio' &&
        !registerDto.customServiceName?.trim()
      ) {
        throw new BadRequestException(
          'Debes indicar el nombre del servicio cuando eliges "Otro servicio"',
        );
      }
    }

    const passwordHash = await argon2.hash(registerDto.password);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        fullName: registerDto.fullName.trim(),
        phone: this.normalizeOptional(registerDto.phone),
        documentNumber:
          registerDto.accountType === RegisterAccountType.CLIENT
            ? this.normalizeOptional(registerDto.documentNumber)
            : null,
        passwordHash,
        role:
          registerDto.accountType === RegisterAccountType.PROVIDER
            ? UserRole.PROVIDER
            : UserRole.CLIENT,
        status: UserStatus.ACTIVE,
        providerProfile:
          registerDto.accountType === RegisterAccountType.PROVIDER
            ? {
                create: {
                  ruc: registerDto.ruc!,
                  businessName: registerDto.businessName!,
                  categoryId: registerDto.category!,
                  customServiceName: this.normalizeOptional(registerDto.customServiceName),
                  specialty: this.normalizeOptional(registerDto.specialty),
                  serviceZone: registerDto.serviceZone!,
                  description: registerDto.description!,
                },
              }
            : undefined,
      },
      include: {
        providerProfile: {
          include: {
            category: true,
          },
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'REGISTER_SUCCESS',
        ipAddress: context.ip,
        userAgent: context.userAgent,
        metadata: {
          accountType: registerDto.accountType,
          email: user.email,
          categoryId: user.providerProfile?.categoryId ?? null,
          customServiceName: user.providerProfile?.customServiceName ?? null,
        },
      },
    });

    return {
      message: 'Cuenta creada correctamente',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        documentNumber: this.maskDocumentNumber(user.documentNumber),
        role: user.role,
        status: user.status,
        providerProfile: user.providerProfile
          ? {
              ruc: user.providerProfile.ruc,
              businessName: user.providerProfile.businessName,
              categoryId: user.providerProfile.categoryId,
              categoryName: user.providerProfile.category?.name ?? null,
              customServiceName: user.providerProfile.customServiceName,
              specialty: user.providerProfile.specialty,
              serviceZone: user.providerProfile.serviceZone,
              description: user.providerProfile.description,
              isVerified: user.providerProfile.isVerified,
            }
          : null,
      },
    };
  }

  async login(
    loginDto: LoginDto,
    context: { ip?: string; userAgent?: string },
  ) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      await this.prisma.auditLog.create({
        data: {
          action: 'LOGIN_FAILED',
          ipAddress: context.ip,
          userAgent: context.userAgent,
          metadata: {
            email: loginDto.email,
            reason: 'user_not_found',
          },
        },
      });

      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Tu cuenta no está activa');
    }

    // ─── Brute-force protection ─────────────────────────
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );

      throw new ForbiddenException(
        `Tu cuenta está bloqueada temporalmente. Intenta de nuevo en ${minutesLeft} minuto(s).`,
      );
    }

    const passwordMatches = await argon2.verify(
      user.passwordHash,
      loginDto.password,
    );

    if (!passwordMatches) {
      const newAttempts = (user.failedLoginAttempts ?? 0) + 1;
      const lockData: Record<string, any> = {
        failedLoginAttempts: newAttempts,
      };

      // Lock after 5 failed attempts for 15 minutes
      if (newAttempts >= 5) {
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        lockData.lockedUntil = lockedUntil;
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: lockData,
      });

      await this.prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: newAttempts >= 5 ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED',
          ipAddress: context.ip,
          userAgent: context.userAgent,
          metadata: {
            reason: 'invalid_password',
            failedAttempts: newAttempts,
          },
        },
      });

      if (newAttempts >= 5) {
        throw new ForbiddenException(
          'Tu cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intenta de nuevo en 15 minutos.',
        );
      }
      const remainingAttempts = 5 - newAttempts;
      throw new UnauthorizedException(
        `Credenciales inválidas. Te quedan ${remainingAttempts} intento(s) antes de bloquear la cuenta.`,
      );
    }

    // Reset failed attempts on successful login
    if ((user.failedLoginAttempts ?? 0) > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    const refreshToken = randomBytes(48).toString('hex');
    const csrfToken = randomBytes(32).toString('hex');
    const refreshTokenHash = this.hashToken(refreshToken);
    const csrfTokenHash = this.hashToken(csrfToken);
    const expiresAt = this.getRefreshExpiryDate(Boolean(loginDto.rememberMe));

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        csrfTokenHash,
        userAgent: context.userAgent,
        ipAddress: context.ip,
        rememberMe: Boolean(loginDto.rememberMe),
        status: SessionStatus.ACTIVE,
        expiresAt,
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    });

    await this.usersService.updateLastLogin(user.id);

    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'LOGIN_SUCCESS',
        ipAddress: context.ip,
        userAgent: context.userAgent,
        metadata: {
          sessionId: session.id,
        },
      },
    });

    return {
      accessToken,
      refreshToken,
      csrfToken,
      rememberMe: Boolean(loginDto.rememberMe),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    context: { ip?: string; userAgent?: string },
  ) {
    const genericResponse = {
      message:
        'Si el correo existe, te enviaremos un enlace para restablecer tu contraseña.',
    };

    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    if (!user || user.status !== UserStatus.ACTIVE) {
      return genericResponse;
    }

    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = this.getPasswordResetExpiryDate();

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        requestedFromIp: context.ip,
        requestedUserAgent: context.userAgent,
      },
    });

    const resetLink = `${this.getWebUrl()}/restablecer-contrasena?token=${encodeURIComponent(rawToken)}`;

    await this.sendPasswordResetEmail({
      to: user.email,
      fullName: user.fullName,
      resetLink,
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        ipAddress: context.ip,
        userAgent: context.userAgent,
      },
    });

    return genericResponse;
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    context: { ip?: string; userAgent?: string },
  ) {
    if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const tokenHash = this.hashToken(resetPasswordDto.token);

    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!resetToken) {
      throw new BadRequestException(
        'El enlace de recuperación es inválido o ya fue usado',
      );
    }

    if (resetToken.expiresAt < new Date()) {
      await this.prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      });

      throw new BadRequestException(
        'El enlace de recuperación expiró. Solicita uno nuevo',
      );
    }

    if (resetToken.user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Tu cuenta no está activa');
    }

    const passwordHash = await argon2.hash(resetPasswordDto.password);
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          passwordHash,
        },
      });

      await tx.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: now,
        },
      });

      await tx.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      });

      await tx.session.updateMany({
        where: {
          userId: resetToken.userId,
          status: SessionStatus.ACTIVE,
        },
        data: {
          status: SessionStatus.REVOKED,
          revokedAt: now,
          revokedReason: 'password_reset',
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: resetToken.userId,
          action: 'PASSWORD_RESET_COMPLETED',
          ipAddress: context.ip,
          userAgent: context.userAgent,
        },
      });
    });

    return {
      message: 'Contraseña actualizada correctamente',
    };
  }

  async refresh(input: {
    refreshToken?: string;
    csrfToken?: string;
    ip?: string;
    userAgent?: string;
  }) {
    if (!input.refreshToken || !input.csrfToken) {
      throw new UnauthorizedException('Sesión inválida');
    }

    const refreshTokenHash = this.hashToken(input.refreshToken);
    const csrfTokenHash = this.hashToken(input.csrfToken);

    const session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash,
        csrfTokenHash,
        status: SessionStatus.ACTIVE,
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Sesión inválida');
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.session.update({
        where: {
          id: session.id,
        },
        data: {
          status: SessionStatus.EXPIRED,
        },
      });

      throw new UnauthorizedException('La sesión expiró');
    }

    const newRefreshToken = randomBytes(48).toString('hex');
    const newCsrfToken = randomBytes(32).toString('hex');

    await this.prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        refreshTokenHash: this.hashToken(newRefreshToken),
        csrfTokenHash: this.hashToken(newCsrfToken),
        lastUsedAt: new Date(),
        ipAddress: input.ip,
        userAgent: input.userAgent,
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: session.user.id,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: 'SESSION_REFRESH',
        ipAddress: input.ip,
        userAgent: input.userAgent,
        metadata: {
          sessionId: session.id,
        },
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      csrfToken: newCsrfToken,
      rememberMe: session.rememberMe,
      user: {
        id: session.user.id,
        email: session.user.email,
        fullName: session.user.fullName,
        role: session.user.role,
        status: session.user.status,
      },
    };
  }

  async validateCsrf(input: { refreshToken?: string; csrfToken?: string }) {
    if (!input.refreshToken || !input.csrfToken) {
      return false;
    }

    const refreshTokenHash = this.hashToken(input.refreshToken);
    const csrfTokenHash = this.hashToken(input.csrfToken);

    const session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash,
        csrfTokenHash,
        status: SessionStatus.ACTIVE,
      },
    });

    if (!session) {
      return false;
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { status: SessionStatus.EXPIRED },
      });

      return false;
    }

    return true;
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) {
      return;
    }

    const refreshTokenHash = this.hashToken(refreshToken);

    const session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash,
        status: SessionStatus.ACTIVE,
      },
    });

    if (!session) {
      return;
    }

    await this.prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
        revokedReason: 'user_logout',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: session.userId,
        action: 'LOGOUT',
        metadata: {
          sessionId: session.id,
        },
      },
    });
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    };
  }
}
