import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Favorite Providers ────────────────────────────────

  async toggleFavoriteProvider(userId: string, providerId: string) {
    const provider = await this.prisma.user.findFirst({
      where: {
        id: providerId,
        role: UserRole.PROVIDER,
        status: UserStatus.ACTIVE,
      },
    });

    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    const existing = await this.prisma.favoriteProvider.findUnique({
      where: { userId_providerId: { userId, providerId } },
    });

    if (existing) {
      await this.prisma.favoriteProvider.delete({ where: { id: existing.id } });
      return { isFavorite: false, message: 'Proveedor removido de favoritos' };
    }

    await this.prisma.favoriteProvider.create({
      data: { userId, providerId },
    });

    return { isFavorite: true, message: 'Proveedor agregado a favoritos' };
  }

  async listFavoriteProviders(userId: string) {
    const favorites = await this.prisma.favoriteProvider.findMany({
      where: { userId },
      include: {
        provider: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            providerProfile: {
              select: {
                businessName: true,
                category: true,
                customServiceName: true,
                specialty: true,
                serviceZone: true,
                description: true,
                isVerified: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: favorites
        .filter((f) => f.provider.providerProfile)
        .map((f) => ({
          favoriteId: f.id,
          providerId: f.provider.id,
          responsibleName: f.provider.fullName,
          phone: f.provider.phone,
          businessName: f.provider.providerProfile!.businessName,
          category: f.provider.providerProfile!.category,
          serviceName:
            f.provider.providerProfile!.category === 'OTHER'
              ? f.provider.providerProfile!.customServiceName || 'Otro servicio'
              : f.provider.providerProfile!.category,
          serviceZone: f.provider.providerProfile!.serviceZone,
          isVerified: f.provider.providerProfile!.isVerified,
          createdAt: f.createdAt,
        })),
      total: favorites.length,
    };
  }

  async checkFavoriteProvider(userId: string, providerId: string) {
    const existing = await this.prisma.favoriteProvider.findUnique({
      where: { userId_providerId: { userId, providerId } },
    });

    return { isFavorite: Boolean(existing) };
  }

  // ─── Favorite Services ─────────────────────────────────

  async toggleFavoriteService(userId: string, serviceId: string) {
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, isActive: true },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    const existing = await this.prisma.favoriteService.findUnique({
      where: { userId_serviceId: { userId, serviceId } },
    });

    if (existing) {
      await this.prisma.favoriteService.delete({ where: { id: existing.id } });
      return { isFavorite: false, message: 'Servicio removido de favoritos' };
    }

    await this.prisma.favoriteService.create({
      data: { userId, serviceId },
    });

    return { isFavorite: true, message: 'Servicio agregado a favoritos' };
  }

  async listFavoriteServices(userId: string) {
    const favorites = await this.prisma.favoriteService.findMany({
      where: { userId },
      include: {
        service: {
          include: {
            category: { select: { id: true, name: true } },
            providerUser: {
              select: {
                id: true,
                fullName: true,
                providerProfile: {
                  select: { businessName: true, isVerified: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: favorites.map((f) => ({
        favoriteId: f.id,
        service: {
          id: f.service.id,
          name: f.service.name,
          description: f.service.description,
          referencePrice: f.service.referencePrice,
          categoryName: f.service.category.name,
          providerName:
            f.service.providerUser.providerProfile?.businessName ??
            f.service.providerUser.fullName,
          isVerified:
            f.service.providerUser.providerProfile?.isVerified ?? false,
        },
        createdAt: f.createdAt,
      })),
      total: favorites.length,
    };
  }
}
