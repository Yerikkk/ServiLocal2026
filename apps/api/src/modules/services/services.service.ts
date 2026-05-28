import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureProviderRole(role: string) {
    if (role !== UserRole.PROVIDER) {
      throw new ForbiddenException('Acceso solo para proveedores');
    }
  }

  async create(userId: string, role: string, dto: CreateServiceDto) {
    this.ensureProviderRole(role);

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category || !category.isActive) {
      throw new NotFoundException('Categoría no encontrada o inactiva');
    }

    const service = await this.prisma.service.create({
      data: {
        providerUserId: userId,
        categoryId: dto.categoryId,
        name: dto.name.trim(),
        description: dto.description.trim(),
        referencePrice: dto.referencePrice
          ? new Prisma.Decimal(dto.referencePrice)
          : null,
        estimatedTime: dto.estimatedTime?.trim() ?? null,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return { message: 'Servicio publicado correctamente', service };
  }

  async listMyServices(userId: string, role: string) {
    this.ensureProviderRole(role);

    const services = await this.prisma.service.findMany({
      where: { providerUserId: userId },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { items: services, total: services.length };
  }

  async updateMyService(
    userId: string,
    role: string,
    serviceId: string,
    dto: UpdateServiceDto,
  ) {
    this.ensureProviderRole(role);

    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, providerUserId: userId },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    const data: any = {};

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category || !category.isActive) {
        throw new NotFoundException('Categoría no encontrada o inactiva');
      }
      data.categoryId = dto.categoryId;
    }

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.description !== undefined)
      data.description = dto.description.trim();
    if (dto.referencePrice !== undefined) {
      data.referencePrice = dto.referencePrice
        ? new Prisma.Decimal(dto.referencePrice)
        : null;
    }
    if (dto.estimatedTime !== undefined)
      data.estimatedTime = dto.estimatedTime?.trim() ?? null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const updated = await this.prisma.service.update({
      where: { id: serviceId },
      data,
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return { message: 'Servicio actualizado', service: updated };
  }

  async listPublicServices(filters: {
    search?: string;
    categoryId?: string;
    providerId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.providerId) where.providerUserId = filters.providerId;

    if (filters.search?.trim()) {
      const search = filters.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          providerUser: {
            select: {
              id: true,
              fullName: true,
              providerProfile: {
                select: {
                  businessName: true,
                  isVerified: true,
                  serviceZone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      items: services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        referencePrice: s.referencePrice,
        estimatedTime: s.estimatedTime,
        category: s.category,
        provider: {
          id: s.providerUser.id,
          name:
            s.providerUser.providerProfile?.businessName ??
            s.providerUser.fullName,
          isVerified: s.providerUser.providerProfile?.isVerified ?? false,
          serviceZone: s.providerUser.providerProfile?.serviceZone ?? '',
        },
        createdAt: s.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async listPublicCategories() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { services: { where: { isActive: true } } } },
      },
    });

    return {
      items: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        serviceCount: c._count.services,
      })),
    };
  }
}
