import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ServiceRequestStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { TrustService } from '../trust/trust.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trustService: TrustService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /** Cliente crea reseña sobre una solicitud COMPLETED */
  async create(userId: string, role: string, dto: CreateReviewDto) {
    if (role !== UserRole.CLIENT) {
      throw new ForbiddenException('Solo los clientes pueden dejar reseñas');
    }

    // Verificar que la solicitud existe y está completada
    const request = await this.prisma.serviceRequest.findFirst({
      where: {
        id: dto.requestId,
        clientUserId: userId,
        status: ServiceRequestStatus.COMPLETED,
      },
      include: {
        providerUser: {
          select: {
            id: true,
            fullName: true,
            providerProfile: { select: { businessName: true } },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(
        'Solicitud no encontrada o no está completada',
      );
    }

    // Verificar que no existe ya una reseña para esta solicitud
    const existing = await this.prisma.review.findUnique({
      where: { requestId: dto.requestId },
    });

    if (existing) {
      throw new ConflictException('Ya dejaste una reseña para esta solicitud');
    }

    const review = await this.prisma.review.create({
      data: {
        requestId: dto.requestId,
        clientUserId: userId,
        providerUserId: request.providerUserId,
        rating: dto.rating,
        comment: dto.comment?.trim() ?? null,
      },
    });

    // Notificar al proveedor
    const businessName =
      request.providerUser.providerProfile?.businessName ??
      request.providerUser.fullName;

    await this.notificationsService
      .createNotification({
        userId: request.providerUserId,
        type: 'NEW_REVIEW',
        title: '¡Nueva reseña recibida!',
        message: `Recibiste una reseña de ${dto.rating} ★ por el servicio "${request.serviceTitle}"`,
        data: { reviewId: review.id, requestId: dto.requestId, rating: dto.rating },
      })
      .catch(() => {});

    return {
      message: 'Reseña publicada correctamente',
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        providerName: businessName,
      },
    };
  }

  /** Reseñas recibidas por el proveedor autenticado */
  async getMyReceivedReviews(userId: string, role: string) {
    if (role !== UserRole.PROVIDER) {
      throw new ForbiddenException('Acceso solo para proveedores');
    }

    const reviews = await this.prisma.review.findMany({
      where: { providerUserId: userId },
      include: {
        clientUser: { select: { id: true, fullName: true } },
        request: { select: { id: true, serviceTitle: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = reviews.length;
    const avgRating =
      total > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
        : 0;

    // Distribución de estrellas
    const distribution = [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((r) => r.rating === stars).length;
      return {
        stars,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });

    return {
      avgRating,
      total,
      distribution,
      items: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        service: r.request.serviceTitle,
        client: {
          id: r.clientUser.id,
          fullName: r.clientUser.fullName,
        },
      })),
    };
  }

  /** Reseñas públicas de un proveedor por ID */
  async getProviderReviews(providerId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { providerUserId: providerId },
      include: {
        clientUser: { select: { id: true, fullName: true } },
        request: { select: { id: true, serviceTitle: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const total = reviews.length;
    const avgRating =
      total > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
        : 0;

    const distribution = [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((r) => r.rating === stars).length;
      return {
        stars,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });

    return {
      avgRating,
      total,
      distribution,
      items: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        service: r.request.serviceTitle,
        clientName: r.clientUser.fullName,
      })),
    };
  }

  /** Reseñas escritas por el cliente autenticado */
  async getMyWrittenReviews(userId: string, role: string) {
    if (role !== UserRole.CLIENT) {
      throw new ForbiddenException('Acceso solo para clientes');
    }

    const reviews = await this.prisma.review.findMany({
      where: { clientUserId: userId },
      include: {
        providerUser: {
          select: {
            id: true,
            fullName: true,
            providerProfile: { select: { businessName: true } },
          },
        },
        request: { select: { id: true, serviceTitle: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      total: reviews.length,
      items: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        service: r.request.serviceTitle,
        requestId: r.requestId,
        provider: {
          id: r.providerUser.id,
          name:
            r.providerUser.providerProfile?.businessName ??
            r.providerUser.fullName,
        },
      })),
    };
  }

  /** Verifica si ya existe reseña para un requestId */
  async checkReviewExists(requestId: string) {
    const review = await this.prisma.review.findUnique({
      where: { requestId },
      select: { id: true },
    });
    return { hasReview: Boolean(review) };
  }
}
