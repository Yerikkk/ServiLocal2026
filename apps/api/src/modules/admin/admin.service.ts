import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, UserStatus, ServiceRequestStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { UpdateConfigDto } from './dto/admin-config.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Users ──────────────────────────────────────────────

  async listUsers(filters: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (
      filters.role &&
      Object.values(UserRole).includes(filters.role as UserRole)
    ) {
      where.role = filters.role;
    }

    if (
      filters.status &&
      Object.values(UserStatus).includes(filters.status as UserStatus)
    ) {
      where.status = filters.status;
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim();
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          status: true,
          trustScore: true,
          slPoints: true,
          lastLoginAt: true,
          createdAt: true,
          providerProfile: {
            select: {
              businessName: true,
              category: true,
              isVerified: true,
              serviceZone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        documentNumber: true,
        role: true,
        status: true,
        trustScore: true,
        slPoints: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        providerProfile: true,
        _count: {
          select: {
            serviceRequestsSent: true,
            serviceRequestsReceived: true,
            services: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async updateUserStatus(
    adminUserId: string,
    targetUserId: string,
    dto: UpdateUserStatusDto,
  ) {
    if (adminUserId === targetUserId) {
      throw new BadRequestException('No puedes cambiar tu propio estado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { status: dto.status },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: 'ADMIN_USER_STATUS_CHANGE',
        metadata: {
          targetUserId,
          previousStatus: user.status,
          newStatus: dto.status,
          reason: dto.reason ?? null,
        },
      },
    });

    // Create notification for the target user
    await this.prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'ACCOUNT_STATUS_CHANGE',
        title:
          dto.status === UserStatus.ACTIVE
            ? 'Tu cuenta ha sido reactivada'
            : 'Tu cuenta ha sido suspendida',
        message:
          dto.reason ??
          'El administrador ha actualizado el estado de tu cuenta.',
        data: { newStatus: dto.status } as any,
      },
    });

    return { message: 'Estado del usuario actualizado', user: updated };
  }

  async verifyProvider(
    adminUserId: string,
    providerId: string,
    verified: boolean,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id: providerId, role: UserRole.PROVIDER },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    await this.prisma.providerProfile.update({
      where: { userId: providerId },
      data: { isVerified: verified },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: verified
          ? 'ADMIN_PROVIDER_VERIFIED'
          : 'ADMIN_PROVIDER_UNVERIFIED',
        metadata: {
          providerId,
          businessName: user.providerProfile.businessName,
        },
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: providerId,
        type: 'PROVIDER_VERIFICATION',
        title: verified
          ? '¡Tu cuenta ha sido verificada!'
          : 'Tu verificación ha sido retirada',
        message: verified
          ? 'Tu perfil de proveedor ha sido verificado por el equipo de ServiLocal.'
          : 'Tu verificación ha sido retirada. Contacta al administrador para más información.',
        data: { verified } as any,
      },
    });

    return {
      message: verified ? 'Proveedor verificado' : 'Verificación retirada',
    };
  }

  // ─── Categories ──────────────────────────────────────────

  private slugify(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async listCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { services: true } } },
    });

    return { items: categories, total: categories.length };
  }

  async createCategory(adminUserId: string, dto: CreateCategoryDto) {
    const slug = this.slugify(dto.name);

    const existing = await this.prisma.category.findFirst({
      where: { OR: [{ name: dto.name }, { slug }] },
    });

    if (existing) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() ?? null,
        icon: dto.icon?.trim() ?? null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: 'ADMIN_CATEGORY_CREATED',
        metadata: { categoryId: category.id, name: category.name },
      },
    });

    return { message: 'Categoría creada', category };
  }

  async updateCategory(
    adminUserId: string,
    categoryId: string,
    dto: UpdateCategoryDto,
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const data: any = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
      data.slug = this.slugify(dto.name);

      const conflict = await this.prisma.category.findFirst({
        where: {
          OR: [{ name: data.name }, { slug: data.slug }],
          NOT: { id: categoryId },
        },
      });

      if (conflict) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
    }

    if (dto.description !== undefined)
      data.description = dto.description?.trim() ?? null;
    if (dto.icon !== undefined) data.icon = dto.icon?.trim() ?? null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const updated = await this.prisma.category.update({
      where: { id: categoryId },
      data,
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: 'ADMIN_CATEGORY_UPDATED',
        metadata: { categoryId, changes: JSON.parse(JSON.stringify(dto)) },
      },
    });

    return { message: 'Categoría actualizada', category: updated };
  }

  // ─── Audit Log ──────────────────────────────────────────

  async listAuditLogs(filters: {
    search?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 30));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.action?.trim()) {
      where.action = { contains: filters.action.trim(), mode: 'insensitive' };
    }

    if (filters.search?.trim()) {
      where.OR = [
        { action: { contains: filters.search.trim(), mode: 'insensitive' } },
        {
          actorUser: {
            fullName: { contains: filters.search.trim(), mode: 'insensitive' },
          },
        },
        {
          actorUser: {
            email: { contains: filters.search.trim(), mode: 'insensitive' },
          },
        },
      ];
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          actorUser: {
            select: { id: true, email: true, fullName: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Service Requests (Oversight) ─────────────────────────

  async listRequests(filters: { page?: number; limit?: number }) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          clientUser: { select: { id: true, fullName: true, email: true } },
          providerUser: {
            select: {
              fullName: true,
              providerProfile: { select: { businessName: true } },
            },
          },
        },
      }),
      this.prisma.serviceRequest.count(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── System Config ──────────────────────────────────────

  async getConfig() {
    return this.prisma.systemConfig.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateConfig(adminUserId: string, dto: UpdateConfigDto) {
    const config = await this.prisma.systemConfig.upsert({
      where: { key: dto.key },
      update: { value: dto.value, description: dto.description },
      create: { key: dto.key, value: dto.value, description: dto.description },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: 'ADMIN_CONFIG_UPDATED',
        metadata: { key: dto.key, value: dto.value },
      },
    });

    return config;
  }

  // ─── Dashboard Stats ────────────────────────────────────

  async getDashboardStats() {
    const [
      totalUsers,
      totalProviders,
      totalClients,
      activeUsers,
      suspendedUsers,
      verifiedProviders,
      totalRequests,
      pendingRequests,
      completedRequests,
      totalCategories,
      totalServices,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.PROVIDER } }),
      this.prisma.user.count({ where: { role: UserRole.CLIENT } }),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
      this.prisma.providerProfile.count({ where: { isVerified: true } }),
      this.prisma.serviceRequest.count(),
      this.prisma.serviceRequest.count({ where: { status: ServiceRequestStatus.PENDING } }),
      this.prisma.serviceRequest.count({ where: { status: ServiceRequestStatus.COMPLETED } }),
      this.prisma.category.count({ where: { isActive: true } }),
      this.prisma.service.count({ where: { isActive: true } }),
    ]);

    return {
      totalUsers,
      totalProviders,
      totalClients,
      activeUsers,
      suspendedUsers,
      verifiedProviders,
      totalRequests,
      pendingRequests,
      completedRequests,
      totalCategories,
      totalServices,
    };
  }
}
