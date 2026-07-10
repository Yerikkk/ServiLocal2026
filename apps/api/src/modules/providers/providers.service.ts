import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ProviderProfile,
  User,
  UserRole,
  UserStatus,
  Category,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';

type TrustBreakdownItem = {
  key: string;
  label: string;
  points: number;
  maxPoints: number;
  completed: boolean;
  guidance: string;
};

type TrustSummary = {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  levelLabel: string;
  completedChecks: number;
  totalChecks: number;
  breakdown: TrustBreakdownItem[];
  nextSteps: string[];
};

type PublicProviderSort =
  | 'trust_desc'
  | 'trust_asc'
  | 'updated_desc'
  | 'name_asc';

type PublicProvidersFilters = {
  search?: string;
  category?: string;
  zone?: string;
  verifiedOnly?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
};

type PublicProviderItem = ReturnType<
  ProvidersService['serializePublicProvider']
>;

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureProviderRole(role: string) {
    if (role !== UserRole.PROVIDER) {
      throw new ForbiddenException('Acceso solo para proveedores');
    }
  }

  private getCategoryLabel(category?: Category | null) {
    return category?.name || 'Otro servicio';
  }

  private getServiceName(
    providerProfile: Pick<
      ProviderProfile,
      'customServiceName' | 'specialty'
    > & { category?: Category | null },
  ) {
    return providerProfile.customServiceName?.trim() || this.getCategoryLabel(providerProfile.category) || 'Otro servicio';
  }

  private normalizeText(value?: string | null) {
    return value?.trim().toLowerCase() ?? '';
  }

  private normalizeSort(sort?: string): PublicProviderSort {
    const allowed: PublicProviderSort[] = [
      'trust_desc',
      'trust_asc',
      'updated_desc',
      'name_asc',
    ];

    return allowed.includes(sort as PublicProviderSort)
      ? (sort as PublicProviderSort)
      : 'trust_desc';
  }

  private isValidCategory(category?: string): boolean {
    return typeof category === 'string' && category.length > 0;
  }

  private normalizeCategoryFilter(category: string): string {
    return category.trim().toLowerCase().replace(/_/g, '-');
  }

  private matchesCategoryFilter(
    provider: Pick<PublicProviderItem, 'categoryId' | 'categorySlug'>,
    filter: string,
  ): boolean {
    const normalized = filter.trim();
    if (!normalized) return true;

    if (provider.categoryId === normalized) return true;

    const filterSlug = this.normalizeCategoryFilter(normalized);
    const providerSlug = (provider.categorySlug ?? '').toLowerCase();
    if (providerSlug && providerSlug === filterSlug) return true;

    const legacyFromSlug = providerSlug
      .toUpperCase()
      .replace(/-/g, '_');
    if (legacyFromSlug && legacyFromSlug === normalized.toUpperCase()) {
      return true;
    }

    return false;
  }

  private buildTrustSummary(
    user: Pick<User, 'email' | 'phone'>,
    providerProfile: Pick<
      ProviderProfile,
      | 'ruc'
      | 'businessName'
      | 'categoryId'
      | 'customServiceName'
      | 'specialty'
      | 'serviceZone'
      | 'description'
      | 'isVerified'
    >,
  ): TrustSummary {
    const descriptionLength = providerProfile.description?.trim().length ?? 0;
    const hasDetailedDescription = descriptionLength >= 80;
    const hasAcceptableDescription = descriptionLength >= 30;

    const hasServiceDetail = Boolean(providerProfile.customServiceName?.trim()) || Boolean(providerProfile.specialty?.trim());

    const breakdown: TrustBreakdownItem[] = [
      {
        key: 'email',
        label: 'Correo de contacto',
        points: user.email?.trim() ? 5 : 0,
        maxPoints: 5,
        completed: Boolean(user.email?.trim()),
        guidance: 'Mantén un correo de contacto válido.',
      },
      {
        key: 'phone',
        label: 'Teléfono o WhatsApp',
        points: user.phone?.trim() ? 5 : 0,
        maxPoints: 5,
        completed: Boolean(user.phone?.trim()),
        guidance: 'Agrega un teléfono o WhatsApp de contacto.',
      },
      {
        key: 'ruc',
        label: 'RUC declarado',
        points: providerProfile.ruc?.trim().length === 11 ? 20 : 0,
        maxPoints: 20,
        completed: providerProfile.ruc?.trim().length === 11,
        guidance: 'Declara un RUC válido de 11 dígitos.',
      },
      {
        key: 'businessName',
        label: 'Nombre comercial',
        points: providerProfile.businessName?.trim().length >= 3 ? 10 : 0,
        maxPoints: 10,
        completed: providerProfile.businessName?.trim().length >= 3,
        guidance: 'Completa el nombre comercial o razón social.',
      },
      {
        key: 'category',
        label: 'Categoría principal',
        points: providerProfile.categoryId ? 10 : 0,
        maxPoints: 10,
        completed: Boolean(providerProfile.categoryId),
        guidance: 'Selecciona tu categoría principal.',
      },
      {
        key: 'serviceZone',
        label: 'Zona de atención',
        points: providerProfile.serviceZone?.trim().length >= 2 ? 10 : 0,
        maxPoints: 10,
        completed: providerProfile.serviceZone?.trim().length >= 2,
        guidance: 'Configura tu zona principal de atención.',
      },
      {
        key: 'description',
        label: 'Descripción profesional',
        points: hasDetailedDescription ? 15 : hasAcceptableDescription ? 8 : 0,
        maxPoints: 15,
        completed: hasDetailedDescription,
        guidance:
          'Amplía tu descripción profesional para explicar mejor tu experiencia y servicios.',
      },
      {
        key: 'serviceDetail',
        label: 'Detalle del servicio',
        points: hasServiceDetail ? 10 : 0,
        maxPoints: 10,
        completed: hasServiceDetail,
        guidance:
          'Agrega una especialidad o nombre de servicio personalizado para reforzar tu perfil.',
      },
      {
        key: 'verification',
        label: 'Verificación del proveedor',
        points: providerProfile.isVerified ? 15 : 0,
        maxPoints: 15,
        completed: providerProfile.isVerified,
        guidance:
          'Completa el proceso de verificación para aumentar tu confianza.',
      },
    ];

    const score = breakdown.reduce((acc, item) => acc + item.points, 0);
    const completedChecks = breakdown.filter((item) => item.completed).length;
    const totalChecks = breakdown.length;

    let level: TrustSummary['level'] = 'LOW';
    let levelLabel = 'Confianza baja';

    if (score >= 85) {
      level = 'VERY_HIGH';
      levelLabel = 'Confianza muy alta';
    } else if (score >= 65) {
      level = 'HIGH';
      levelLabel = 'Confianza alta';
    } else if (score >= 40) {
      level = 'MEDIUM';
      levelLabel = 'Confianza media';
    }

    return {
      score,
      level,
      levelLabel,
      completedChecks,
      totalChecks,
      breakdown,
      nextSteps: breakdown
        .filter((item) => !item.completed)
        .map((item) => item.guidance),
    };
  }

  private serializePublicProvider(
    user: Pick<User, 'id' | 'fullName' | 'phone' | 'status' | 'role' | 'email'>,
    providerProfile: Pick<
      ProviderProfile,
      | 'ruc'
      | 'businessName'
      | 'categoryId'
      | 'customServiceName'
      | 'specialty'
      | 'serviceZone'
      | 'latitude'
      | 'longitude'
      | 'description'
      | 'isVerified'
      | 'updatedAt'
    > & { category?: Category | null },
  ) {
    return {
      providerId: user.id,
      responsibleName: user.fullName,
      phone: user.phone,
      businessName: providerProfile.businessName,
      categoryId: providerProfile.categoryId,
      categorySlug: providerProfile.category?.slug ?? null,
      categoryName: providerProfile.category?.name || null,
      serviceName: this.getServiceName(providerProfile),
      customServiceName: providerProfile.customServiceName,
      specialty: providerProfile.specialty,
      serviceZone: providerProfile.serviceZone,
      latitude: providerProfile.latitude ? Number(providerProfile.latitude) : null,
      longitude: providerProfile.longitude ? Number(providerProfile.longitude) : null,
      description: providerProfile.description,
      isVerified: providerProfile.isVerified,
      updatedAt: providerProfile.updatedAt,
      trustSummary: this.buildTrustSummary(user, providerProfile),
    };
  }

  private matchesPublicFilters(
    provider: PublicProviderItem,
    filters: PublicProvidersFilters,
  ) {
    const normalizedSearch = this.normalizeText(filters.search);
    const normalizedZone = this.normalizeText(filters.zone);

    if (filters.verifiedOnly && !provider.isVerified) {
      return false;
    }

    if (filters.category && this.isValidCategory(filters.category)) {
      if (!this.matchesCategoryFilter(provider, filters.category)) {
        return false;
      }
    }

    if (normalizedZone) {
      if (this.normalizeText(provider.serviceZone) !== normalizedZone) {
        return false;
      }
    }

    if (normalizedSearch) {
      const haystack = [
        provider.businessName,
        provider.responsibleName,
        provider.serviceName,
        provider.specialty,
        provider.serviceZone,
        provider.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(normalizedSearch)) {
        return false;
      }
    }

    return true;
  }

  private sortPublicProviders(
    providers: PublicProviderItem[],
    sort: PublicProviderSort,
  ) {
    return [...providers].sort((a, b) => {
      if (a.isVerified !== b.isVerified) {
        return a.isVerified ? -1 : 1;
      }

      switch (sort) {
        case 'trust_asc':
          return a.trustSummary.score - b.trustSummary.score;
        case 'updated_desc':
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case 'name_asc':
          return a.businessName.localeCompare(b.businessName, 'es');
        case 'trust_desc':
        default:
          return b.trustSummary.score - a.trustSummary.score;
      }
    });
  }

  async listPublicProviders(filters: PublicProvidersFilters = {}) {
    const where: Prisma.UserWhereInput = {
      role: UserRole.PROVIDER,
      status: UserStatus.ACTIVE,
      providerProfile: {
        isNot: null,
      },
    };

    const andConditions: Prisma.UserWhereInput[] = [];

    if (filters.verifiedOnly) {
      andConditions.push({
        providerProfile: {
          isVerified: true,
        },
      });
    }

    if (filters.category && this.isValidCategory(filters.category)) {
      const normalizedCategory = filters.category.trim();
      const filterSlug = this.normalizeCategoryFilter(normalizedCategory);
      andConditions.push({
        providerProfile: {
          OR: [
            { categoryId: normalizedCategory },
            { category: { slug: filterSlug } },
            { category: { slug: normalizedCategory.toLowerCase().replace(/_/g, '-') } },
          ],
        },
      });
    }

    if (filters.zone) {
      const normalizedZone = filters.zone.trim();
      andConditions.push({
        providerProfile: {
          serviceZone: {
            equals: normalizedZone,
            mode: 'insensitive',
          },
        },
      });
    }

    if (filters.search) {
      const normalizedSearch = filters.search.trim();
      andConditions.push({
        OR: [
          { fullName: { contains: normalizedSearch, mode: 'insensitive' } },
          {
            providerProfile: {
              OR: [
                { businessName: { contains: normalizedSearch, mode: 'insensitive' } },
                { customServiceName: { contains: normalizedSearch, mode: 'insensitive' } },
                { specialty: { contains: normalizedSearch, mode: 'insensitive' } },
                { serviceZone: { contains: normalizedSearch, mode: 'insensitive' } },
                { description: { contains: normalizedSearch, mode: 'insensitive' } },
                { category: { name: { contains: normalizedSearch, mode: 'insensitive' } } },
              ],
            },
          },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        providerProfile: { include: { category: true } },
      },
    });

    const serializedProviders = users
      .filter((user) => Boolean(user.providerProfile))
      .map((user) => this.serializePublicProvider(user, user.providerProfile!));

    const sortedProviders = this.sortPublicProviders(
      serializedProviders,
      this.normalizeSort(filters.sort),
    );

    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
    const startIndex = (page - 1) * limit;
    
    const paginatedItems = sortedProviders.slice(startIndex, startIndex + limit);

    return {
      total: sortedProviders.length,
      page,
      limit,
      totalPages: Math.ceil(sortedProviders.length / limit),
      items: paginatedItems,
    };
  }

  async getPublicProviderById(providerId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: providerId,
        role: UserRole.PROVIDER,
        status: UserStatus.ACTIVE,
      },
      include: {
        providerProfile: { include: { category: true } },
      },
    });

    if (!user || !user.providerProfile) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return this.serializePublicProvider(user, user.providerProfile);
  }

  async getTrustSummary(userId: string, role: string) {
    this.ensureProviderRole(role);

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        providerProfile: true,
      },
    });

    if (!user || !user.providerProfile) {
      throw new NotFoundException('Perfil de proveedor no encontrado');
    }

    return this.buildTrustSummary(user, user.providerProfile);
  }

  async getMe(userId: string, role: string) {
    this.ensureProviderRole(role);

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        providerProfile: { include: { category: true } },
      },
    });

    if (!user || !user.providerProfile) {
      throw new NotFoundException('Perfil de proveedor no encontrado');
    }

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
      providerProfile: {
        id: user.providerProfile.id,
        ruc: user.providerProfile.ruc,
        businessName: user.providerProfile.businessName,
        categoryId: user.providerProfile.categoryId,
        categoryName: user.providerProfile.category?.name || null,
        customServiceName: user.providerProfile.customServiceName,
        specialty: user.providerProfile.specialty,
        serviceZone: user.providerProfile.serviceZone,
        latitude: user.providerProfile.latitude ? Number(user.providerProfile.latitude) : null,
        longitude: user.providerProfile.longitude ? Number(user.providerProfile.longitude) : null,
        description: user.providerProfile.description,
        isVerified: user.providerProfile.isVerified,
        createdAt: user.providerProfile.createdAt,
        updatedAt: user.providerProfile.updatedAt,
      },
      trustSummary: this.buildTrustSummary(user, user.providerProfile),
    };
  }

  async updateMe(
    userId: string,
    role: string,
    updateProviderProfileDto: UpdateProviderProfileDto,
  ) {
    this.ensureProviderRole(role);

    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        providerProfile: { include: { category: true } },
      },
    });

    if (!currentUser || !currentUser.providerProfile) {
      throw new NotFoundException('Perfil de proveedor no encontrado');
    }

    const existingRuc = await this.prisma.providerProfile.findFirst({
      where: {
        ruc: updateProviderProfileDto.ruc,
        NOT: {
          userId,
        },
      },
    });

    if (existingRuc) {
      throw new ConflictException(
        'El RUC ya está registrado por otro proveedor',
      );
    }

    const updatedProfile = await this.prisma.providerProfile.update({
      where: {
        userId,
      },
      data: {
        ruc: updateProviderProfileDto.ruc,
        businessName: updateProviderProfileDto.businessName,
        categoryId: updateProviderProfileDto.category,
        customServiceName: updateProviderProfileDto.customServiceName?.trim() ?? null,
        specialty: updateProviderProfileDto.specialty?.trim() ?? null,
        serviceZone: updateProviderProfileDto.serviceZone,
        latitude: updateProviderProfileDto.latitude ?? null,
        longitude: updateProviderProfileDto.longitude ?? null,
        description: updateProviderProfileDto.description,
      },
      include: { category: true },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action: 'PROVIDER_PROFILE_UPDATED',
        metadata: {
          categoryId: updatedProfile.categoryId,
          customServiceName: updatedProfile.customServiceName,
          serviceZone: updatedProfile.serviceZone,
        },
      },
    });

    return {
      message: 'Perfil profesional actualizado correctamente',
      providerProfile: {
        id: updatedProfile.id,
        ruc: updatedProfile.ruc,
        businessName: updatedProfile.businessName,
        categoryId: updatedProfile.categoryId,
        categoryName: updatedProfile.category?.name || null,
        customServiceName: updatedProfile.customServiceName,
        specialty: updatedProfile.specialty,
        serviceZone: updatedProfile.serviceZone,
        latitude: updatedProfile.latitude ? Number(updatedProfile.latitude) : null,
        longitude: updatedProfile.longitude ? Number(updatedProfile.longitude) : null,
        description: updatedProfile.description,
        isVerified: updatedProfile.isVerified,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt,
      },
      trustSummary: this.buildTrustSummary(currentUser, updatedProfile),
    };
  }

  async getFinanceSummary(userId: string, role: string) {
    this.ensureProviderRole(role);

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Obtener todas las solicitudes del proveedor (incluyendo el título para estimar ganancias)
    const allRequests = await this.prisma.serviceRequest.findMany({
      where: { providerUserId: userId },
      select: { id: true, status: true, createdAt: true, serviceTitle: true },
    });

    const completed = allRequests.filter((r) => r.status === 'COMPLETED');
    const cancelled = allRequests.filter((r) => r.status === 'CANCELLED');
    const expired = allRequests.filter((r) => r.status === 'EXPIRED');

    const completedThisMonth = completed.filter(
      (r) => new Date(r.createdAt) >= firstDayOfMonth,
    );

    // Obtener catálogo de servicios del proveedor para estimar ingresos reales
    const providerServices = await this.prisma.service.findMany({
      where: { providerUserId: userId, isActive: true },
      select: { name: true, referencePrice: true },
    });

    const prices = providerServices
      .map((s) => (s.referencePrice ? Number(s.referencePrice) : 0))
      .filter((p) => p > 0);

    const avgPrice =
      prices.length > 0
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : 50; // Fallback a 50 PEN si no tiene servicios configurados

    // Estimar ganancias de solicitudes completadas este mes
    let totalEarningsEstimate = 0;
    for (const req of completedThisMonth) {
      const matchedService = providerServices.find(
        (s) => s.name.trim().toLowerCase() === req.serviceTitle.trim().toLowerCase(),
      );
      if (matchedService && matchedService.referencePrice) {
        totalEarningsEstimate += Number(matchedService.referencePrice);
      } else {
        totalEarningsEstimate += avgPrice;
      }
    }

    // 10% de comisión estimada para el plan FREE
    const commissionsEstimate = Math.round(totalEarningsEstimate * 0.10 * 100) / 100;
    totalEarningsEstimate = Math.round(totalEarningsEstimate * 100) / 100;

    // Breakdown mensual de los últimos 6 meses
    const monthlyBreakdown: { month: string; label: string; completed: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthKey = d.toISOString().slice(0, 7);
      const monthLabel = d.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
      const count = completed.filter((r) => {
        const date = new Date(r.createdAt);
        return date >= d && date < nextMonth;
      }).length;
      monthlyBreakdown.push({ month: monthKey, label: monthLabel, completed: count });
    }

    return {
      currentMonth: {
        completed: completedThisMonth.length,
        totalEarningsEstimate,
        commissionsEstimate,
      },
      allTime: {
        totalCompleted: completed.length,
        totalCancelled: cancelled.length,
        totalExpired: expired.length,
        totalRequests: allRequests.length,
      },
      monthlyBreakdown,
      plan: 'FREE',
    };
  }
}
