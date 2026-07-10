import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ServiceRequestStatus, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TrustService } from '../trust/trust.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestStatusDto } from './dto/update-service-request-status.dto';

@Injectable()
export class ServiceRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly trustService: TrustService,
  ) {}

  private readonly REQUEST_EXPIRATION_HOURS = 48;

  private ensureClientRole(role: string) {
    if (role !== UserRole.CLIENT) {
      throw new ForbiddenException('Acceso solo para clientes');
    }
  }

  private ensureProviderRole(role: string) {
    if (role !== UserRole.PROVIDER) {
      throw new ForbiddenException('Acceso solo para proveedores');
    }
  }

  private serializeClientRequest(request: any) {
    const providerProfile = request.providerUser.providerProfile;

    return {
      id: request.id,
      serviceTitle: request.serviceTitle,
      message: request.message,
      serviceZone: request.serviceZone,
      preferredDate: request.preferredDate,
      expiresAt: request.expiresAt,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      provider: {
        providerId: request.providerUser.id,
        responsibleName: request.providerUser.fullName,
        businessName: providerProfile?.businessName ?? 'Proveedor',
        serviceName:
          providerProfile?.category?.slug === 'otro-servicio'
            ? providerProfile?.customServiceName || 'Otro servicio'
            : (providerProfile?.category?.name ?? 'Servicio'),
        specialty: providerProfile?.specialty ?? null,
        serviceZone: providerProfile?.serviceZone ?? null,
        isVerified: providerProfile?.isVerified ?? false,
      },
    };
  }

  private serializeProviderRequest(request: any) {
    return {
      id: request.id,
      serviceTitle: request.serviceTitle,
      message: request.message,
      serviceZone: request.serviceZone,
      preferredDate: request.preferredDate,
      expiresAt: request.expiresAt,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      client: {
        id: request.clientUser.id,
        fullName: request.clientUser.fullName,
        email: request.clientUser.email,
        phone: request.clientUser.phone,
      },
    };
  }

  async create(userId: string, role: string, dto: CreateServiceRequestDto) {
    this.ensureClientRole(role);

    const provider = await this.prisma.user.findFirst({
      where: {
        id: dto.providerId,
        role: UserRole.PROVIDER,
        status: UserStatus.ACTIVE,
      },
      include: {
        providerProfile: true,
      },
    });

    if (!provider || !provider.providerProfile) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    if (provider.id === userId) {
      throw new BadRequestException(
        'No puedes enviarte una solicitud a ti mismo',
      );
    }

    const existingPendingRequest = await this.prisma.serviceRequest.findFirst({
      where: {
        clientUserId: userId,
        providerUserId: provider.id,
        status: ServiceRequestStatus.PENDING,
      },
    });

    if (existingPendingRequest) {
      throw new BadRequestException(
        'Ya tienes una solicitud pendiente con este proveedor',
      );
    }

    let parsedPreferredDate: Date | null = null;

    if (dto.preferredDate?.trim()) {
      parsedPreferredDate = new Date(dto.preferredDate);

      if (Number.isNaN(parsedPreferredDate.getTime())) {
        throw new BadRequestException('La fecha tentativa no es válida');
      }
    }

    const request = await this.prisma.serviceRequest.create({
      data: {
        clientUserId: userId,
        providerUserId: provider.id,
        serviceTitle: dto.serviceTitle,
        message: dto.message,
        serviceZone: dto.serviceZone,
        preferredDate: parsedPreferredDate,
        expiresAt: new Date(
          Date.now() + this.REQUEST_EXPIRATION_HOURS * 60 * 60 * 1000,
        ),
      },
      include: {
        clientUser: {
          select: { id: true, fullName: true },
        },
        providerUser: {
          include: {
            providerProfile: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Notify provider of new request
    await this.notificationsService
      .createNotification({
        userId: provider.id,
        type: 'NEW_SERVICE_REQUEST',
        title: 'Nueva solicitud de servicio',
        message: `${request.clientUser?.fullName ?? 'Un cliente'} te envió una solicitud: ${dto.serviceTitle}`,
        data: { requestId: request.id },
      })
      .catch(() => {});

    return {
      message: 'Solicitud enviada correctamente',
      request: this.serializeClientRequest(request),
    };
  }

  async listClientRequests(userId: string, role: string) {
    this.ensureClientRole(role);

    const requests = await this.prisma.serviceRequest.findMany({
      where: {
        clientUserId: userId,
      },
      include: {
        providerUser: {
          include: {
            providerProfile: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      total: requests.length,
      items: requests.map((request) => this.serializeClientRequest(request)),
    };
  }

  async listProviderRequests(userId: string, role: string) {
    this.ensureProviderRole(role);

    const requests = await this.prisma.serviceRequest.findMany({
      where: {
        providerUserId: userId,
      },
      include: {
        clientUser: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      total: requests.length,
      items: requests.map((request) => this.serializeProviderRequest(request)),
    };
  }

  async updateStatus(
    userId: string,
    role: string,
    requestId: string,
    dto: UpdateServiceRequestStatusDto,
  ) {

    const request = await this.prisma.serviceRequest.findFirst({
      where: {
        id: requestId,
        OR: [{ providerUserId: userId }, { clientUserId: userId }],
      },
      include: {
        clientUser: true,
        providerUser: {
          include: {
            providerProfile: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.status === ServiceRequestStatus.EXPIRED) {
      throw new BadRequestException('La solicitud ya expiró');
    }

    this.validateStatusTransition({
      actorUserId: userId,
      actorRole: role,
      currentStatus: request.status,
      nextStatus: dto.status,
      request,
    });

    const updated = await this.prisma.serviceRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: dto.status,
        ...(dto.status === ServiceRequestStatus.CANCELLED && dto.cancelReason
          ? { cancelReason: dto.cancelReason }
          : {}),
      },
      include: {
        clientUser: true,
        providerUser: {
          include: {
            providerProfile: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Notify the other party about status change
    const notifyUserId =
      role === UserRole.CLIENT ? request.providerUserId : request.clientUserId;
    const statusMsg = this.getStatusUpdateMessage(dto.status);
    await this.notificationsService
      .createNotification({
        userId: notifyUserId,
        type: 'REQUEST_STATUS_CHANGE',
        title: statusMsg,
        message: `La solicitud "${request.serviceTitle}" cambió a ${dto.status}`,
        data: { requestId: request.id, newStatus: dto.status },
      })
      .catch(() => {});

    // Trigger trust events based on status change
    if (dto.status === 'COMPLETED') {
      await this.trustService
        .onRequestCompleted(
          request.id,
          request.clientUserId,
          request.providerUserId,
        )
        .catch(() => {});
    } else if (dto.status === 'CANCELLED') {
      const cancelledByUserId =
        role === UserRole.CLIENT
          ? request.clientUserId
          : request.providerUserId;
      await this.trustService
        .onRequestCancelled(request.id, cancelledByUserId, !!dto.cancelReason)
        .catch(() => {});
    } else if (dto.status === 'EXPIRED') {
      await this.trustService
        .onRequestExpired(request.id, request.providerUserId)
        .catch(() => {});
    }

    return {
      message: statusMsg,
      request:
        role === UserRole.CLIENT
          ? this.serializeClientRequest(updated)
          : this.serializeProviderRequest(updated),
    };
  }

  private getStatusUpdateMessage(status: ServiceRequestStatus) {
    switch (status) {
      case ServiceRequestStatus.NEGOTIATION:
        return 'Solicitud puesta en negociación';
      case ServiceRequestStatus.ACCEPTED:
        return 'Solicitud aceptada correctamente';
      case ServiceRequestStatus.IN_PROGRESS:
        return 'Solicitud marcada en proceso';
      case ServiceRequestStatus.COMPLETED:
        return 'Solicitud completada correctamente';
      case ServiceRequestStatus.CANCELLED:
        return 'Solicitud cancelada correctamente';
      case ServiceRequestStatus.EXPIRED:
        return 'Solicitud expirada';
      case ServiceRequestStatus.PENDING:
      default:
        return 'Estado actualizado correctamente';
    }
  }

  private validateStatusTransition(params: {
    actorUserId: string;
    actorRole: string;
    currentStatus: ServiceRequestStatus;
    nextStatus: ServiceRequestStatus;
    request: { providerUserId: string; clientUserId: string };
  }) {
    const { actorUserId, actorRole, currentStatus, nextStatus, request } =
      params;

    if (nextStatus === ServiceRequestStatus.PENDING) {
      throw new BadRequestException(
        'No puedes volver una solicitud a pendiente',
      );
    }

    if (nextStatus === ServiceRequestStatus.EXPIRED) {
      throw new BadRequestException(
        'El estado expirada lo gestiona el sistema',
      );
    }

    const isProviderActor = actorRole === UserRole.PROVIDER;
    const isClientActor = actorRole === UserRole.CLIENT;

    if (!isProviderActor && !isClientActor) {
      throw new ForbiddenException(
        'No tienes permisos para gestionar solicitudes',
      );
    }

    if (isProviderActor && request.providerUserId !== actorUserId) {
      throw new ForbiddenException(
        'No puedes gestionar solicitudes de otro proveedor',
      );
    }

    if (isClientActor && request.clientUserId !== actorUserId) {
      throw new ForbiddenException(
        'No puedes gestionar solicitudes de otro cliente',
      );
    }

    if (isClientActor) {
      const allowedClientTransitions = new Set<ServiceRequestStatus>([
        ServiceRequestStatus.CANCELLED,
      ]);

      if (!allowedClientTransitions.has(nextStatus)) {
        throw new ForbiddenException(
          'El cliente solo puede cancelar solicitudes',
        );
      }

      const cancellableByClient = new Set<ServiceRequestStatus>([
        ServiceRequestStatus.PENDING,
        ServiceRequestStatus.NEGOTIATION,
        ServiceRequestStatus.ACCEPTED,
        ServiceRequestStatus.IN_PROGRESS,
      ]);

      if (!cancellableByClient.has(currentStatus)) {
        throw new BadRequestException(
          'Solo puedes cancelar solicitudes pendientes, en negociación, aceptadas o en proceso',
        );
      }

      return;
    }

    const allowedByCurrent: Record<
      ServiceRequestStatus,
      ServiceRequestStatus[]
    > = {
      [ServiceRequestStatus.PENDING]: [
        ServiceRequestStatus.NEGOTIATION,
        ServiceRequestStatus.ACCEPTED,
        ServiceRequestStatus.CANCELLED,
      ],
      [ServiceRequestStatus.NEGOTIATION]: [
        ServiceRequestStatus.ACCEPTED,
        ServiceRequestStatus.CANCELLED,
      ],
      [ServiceRequestStatus.ACCEPTED]: [
        ServiceRequestStatus.IN_PROGRESS,
        ServiceRequestStatus.CANCELLED,
      ],
      [ServiceRequestStatus.IN_PROGRESS]: [ServiceRequestStatus.COMPLETED],
      [ServiceRequestStatus.COMPLETED]: [],
      [ServiceRequestStatus.CANCELLED]: [],
      [ServiceRequestStatus.EXPIRED]: [],
    };

    if (!allowedByCurrent[currentStatus].includes(nextStatus)) {
      throw new BadRequestException('Transición de estado no permitida');
    }
  }

  /**
   * Expire PENDING requests whose expiresAt has passed.
   * Called lazily on every API read AND proactively by the SchedulerService every hour.
   */
  async expirePendingRequests(): Promise<number> {
    const now = new Date();

    // Find expired requests with enough context to notify both parties
    const expiredRequests = await this.prisma.serviceRequest.findMany({
      where: {
        status: ServiceRequestStatus.PENDING,
        expiresAt: { lt: now },
      },
      select: {
        id: true,
        serviceTitle: true,
        clientUserId: true,
        providerUserId: true,
      },
    });

    if (expiredRequests.length === 0) return 0;

    // Bulk update status
    await this.prisma.serviceRequest.updateMany({
      where: {
        status: ServiceRequestStatus.PENDING,
        expiresAt: { lt: now },
      },
      data: { status: ServiceRequestStatus.EXPIRED },
    });

    // Notify parties and record trust events for each
    await Promise.allSettled(
      expiredRequests.map(async (req) => {
        // Notify client
        await this.notificationsService.createNotification({
          userId: req.clientUserId,
          type: 'SERVICE_REQUEST_EXPIRED',
          title: 'Solicitud expirada',
          message: `Tu solicitud "${req.serviceTitle}" expiró sin ser atendida por el proveedor.`,
        });

        // Notify provider
        await this.notificationsService.createNotification({
          userId: req.providerUserId,
          type: 'SERVICE_REQUEST_EXPIRED',
          title: 'Solicitud no atendida',
          message: `La solicitud "${req.serviceTitle}" expiró porque no fue aceptada a tiempo. Esto puede afectar tu puntuación de confianza.`,
        });

        // Trust penalty for provider (not responding = -5 points)
        try {
          await this.trustService.recordTrustEvent({
            userId: req.providerUserId,
            eventType: 'REQUEST_EXPIRED',
            requestId: req.id,
          });
        } catch {
          // Trust event is non-critical, continue
        }
      }),
    );

    return expiredRequests.length;
  }
}
