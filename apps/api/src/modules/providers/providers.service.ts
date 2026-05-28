import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ProviderProfile,
  ServiceCategory,
  User,
  UserRole,
  UserStatus,
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

  private getCategoryLabel(category: ServiceCategory) {
    const labels: Record<ServiceCategory, string> = {
      ELECTRICIDAD: 'Electricidad',
      PLOMERIA: 'Plomería',
      LIMPIEZA: 'Limpieza',
      CARPINTERIA: 'Carpintería',
      PINTURA: 'Pintura',
      JARDINERIA: 'Jardinería',
      CERRAJERIA: 'Cerrajería',
      AIRE_ACONDICIONADO: 'Aire acondicionado',
      OTHER: 'Otro servicio',
    };

    return labels[category];
  }

  private getServiceName(
    providerProfile: Pick<
      ProviderProfile,
      'category' | 'customServiceName' | 'specialty'
    >,
  ) {
    if (providerProfile.category === ServiceCategory.OTHER) {
      return providerProfile.customServiceName?.trim() || 'Otro servicio';
    }

    return this.getCategoryLabel(providerProfile.category);
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

  private isValidCategory(category?: string): category is ServiceCategory {
    return Object.values(ServiceCategory).includes(category as ServiceCategory);
  }

  private buildTrustSummary(
    user: Pick<User, 'email' | 'phone'>,
    providerProfile: Pick<
      ProviderProfile,
      | 'ruc'
      | 'businessName'
      | 'category'
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

    const hasServiceDetail =
      providerProfile.category === ServiceCategory.OTHER
        ? Boolean(providerProfile.customServiceName?.trim())
        : Boolean(providerProfile.specialty?.trim());

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
        points: providerProfile.category ? 10 : 0,
        maxPoints: 10,
        completed: Boolean(providerProfile.category),
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
          providerProfile.category === ServiceCategory.OTHER
            ? 'Especifica el nombre de tu servicio personalizado.'
            : 'Agrega una especialidad o subcategoría para reforzar tu perfil.',
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
      | 'category'
      | 'customServiceName'
      | 'specialty'
      | 'serviceZone'
      | 'description'
      | 'isVerified'
      | 'updatedAt'
    >,
  ) {
    return {
      providerId: user.id,
      responsibleName: user.fullName,
      phone: user.phone,
      businessName: providerProfile.businessName,
      category: providerProfile.category,
      serviceName: this.getServiceName(providerProfile),
      customServiceName: providerProfile.customServiceName,
      specialty: providerProfile.specialty,
      serviceZone: providerProfile.serviceZone,
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
      if (provider.category !== filters.category) {
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
    const users = await this.prisma.user.findMany({
      where: {
        role: UserRole.PROVIDER,
        status: UserStatus.ACTIVE,
      },
      include: {
        providerProfile: true,
      },
    });

    const serializedProviders = users
      .filter((user) => Boolean(user.providerProfile))
      .map((user) => this.serializePublicProvider(user, user.providerProfile!));

    const filteredProviders = serializedProviders.filter((provider) =>
      this.matchesPublicFilters(provider, filters),
    );

    const sortedProviders = this.sortPublicProviders(
      filteredProviders,
      this.normalizeSort(filters.sort),
    );

    return {
      total: sortedProviders.length,
      items: sortedProviders,
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
        providerProfile: true,
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
        providerProfile: true,
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
        category: user.providerProfile.category,
        customServiceName: user.providerProfile.customServiceName,
        specialty: user.providerProfile.specialty,
        serviceZone: user.providerProfile.serviceZone,
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

    if (
      updateProviderProfileDto.category === ServiceCategory.OTHER &&
      !updateProviderProfileDto.customServiceName?.trim()
    ) {
      throw new BadRequestException(
        'Debes indicar el nombre del servicio cuando eliges "Otro servicio"',
      );
    }

    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        providerProfile: true,
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
        category: updateProviderProfileDto.category,
        customServiceName:
          updateProviderProfileDto.category === ServiceCategory.OTHER
            ? (updateProviderProfileDto.customServiceName?.trim() ?? null)
            : null,
        specialty: updateProviderProfileDto.specialty?.trim() ?? null,
        serviceZone: updateProviderProfileDto.serviceZone,
        description: updateProviderProfileDto.description,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action: 'PROVIDER_PROFILE_UPDATED',
        metadata: {
          category: updatedProfile.category,
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
        category: updatedProfile.category,
        customServiceName: updatedProfile.customServiceName,
        specialty: updatedProfile.specialty,
        serviceZone: updatedProfile.serviceZone,
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

    // Obtener todas las solicitudes del proveedor
    const allRequests = await this.prisma.serviceRequest.findMany({
      where: { providerUserId: userId },
      select: { id: true, status: true, createdAt: true },
    });

    const completed = allRequests.filter((r) => r.status === 'COMPLETED');
    const cancelled = allRequests.filter((r) => r.status === 'CANCELLED');
    const expired = allRequests.filter((r) => r.status === 'EXPIRED');

    const completedThisMonth = completed.filter(
      (r) => new Date(r.createdAt) >= firstDayOfMonth,
    );

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
        totalEarningsEstimate: 0,
        commissionsEstimate: 0,
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
