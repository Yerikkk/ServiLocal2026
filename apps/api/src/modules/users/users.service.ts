import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        providerProfile: true,
      },
    });
  }

  async updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async updateProfile(id: string, data: any) {
    const { providerProfile, ...userData } = data;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        providerProfile: providerProfile
          ? {
              update: providerProfile,
            }
          : undefined,
      },
      include: {
        providerProfile: true,
      },
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string,
  ) {
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isCurrentValid = await argon2.verify(
      user.passwordHash,
      currentPassword,
    );

    if (!isCurrentValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    const isSamePassword = await argon2.verify(user.passwordHash, newPassword);
    if (isSamePassword) {
      throw new BadRequestException(
        'La nueva contraseña no puede ser igual a la actual',
      );
    }

    const passwordHash = await argon2.hash(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Log the password change
    await this.prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action: 'PASSWORD_CHANGED',
        metadata: {
          method: 'settings_panel',
        },
      },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
