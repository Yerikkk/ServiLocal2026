import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ServiceRequestStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../../common/websockets/notifications.gateway';
import { CreateRequestMessageDto } from './dto/create-request-message.dto';

@Injectable()
export class RequestMessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  private async getRequestForParticipant(requestId: string, userId: string) {
    const request = await this.prisma.serviceRequest.findFirst({
      where: {
        id: requestId,
        OR: [{ clientUserId: userId }, { providerUserId: userId }],
      },
      include: {
        clientUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        providerUser: {
          select: {
            id: true,
            fullName: true,
            providerProfile: {
              select: {
                businessName: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return request;
  }

  private ensureAllowedRole(role: string) {
    if (role !== UserRole.CLIENT && role !== UserRole.PROVIDER) {
      throw new ForbiddenException(
        'Solo cliente y proveedor tienen acceso al chat',
      );
    }
  }

  async listMessages(userId: string, role: string, requestId: string) {
    this.ensureAllowedRole(role);
    const request = await this.getRequestForParticipant(requestId, userId);

    const messages = await this.prisma.serviceRequestMessage.findMany({
      where: {
        requestId,
      },
      include: {
        senderUser: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      request: {
        id: request.id,
        serviceTitle: request.serviceTitle,
        status: request.status,
        client: request.clientUser,
        provider: {
          id: request.providerUser.id,
          fullName: request.providerUser.fullName,
          businessName:
            request.providerUser.providerProfile?.businessName ?? 'Proveedor',
        },
      },
      items: messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: {
          id: message.senderUser.id,
          fullName: message.senderUser.fullName,
          role: message.senderUser.role,
        },
        isMine: message.senderUser.id === userId,
      })),
    };
  }

  async createMessage(
    userId: string,
    role: string,
    requestId: string,
    dto: CreateRequestMessageDto,
  ) {
    this.ensureAllowedRole(role);
    const request = await this.getRequestForParticipant(requestId, userId);

    const closedStatuses = new Set<ServiceRequestStatus>([
      ServiceRequestStatus.CANCELLED,
      ServiceRequestStatus.COMPLETED,
      ServiceRequestStatus.EXPIRED,
    ]);

    if (closedStatuses.has(request.status)) {
      throw new BadRequestException(
        'No se pueden enviar mensajes en una solicitud cerrada',
      );
    }

    const message = await this.prisma.serviceRequestMessage.create({
      data: {
        requestId,
        senderUserId: userId,
        content: dto.content,
      },
      include: {
        senderUser: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    const formattedMessage = {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      sender: {
        id: message.senderUser.id,
        fullName: message.senderUser.fullName,
        role: message.senderUser.role,
      },
      isMine: false,
    };

    // Send real-time message to the other party
    const recipientId =
      request.clientUserId === userId
        ? request.providerUserId
        : request.clientUserId;

    this.notificationsGateway.sendMessageToUser(recipientId, { 
      requestId, 
      message: formattedMessage 
    });

    // Notify the other party
    await this.notifyNewMessage(request, userId, message.senderUser.fullName);

    return {
      message: 'Mensaje enviado',
      item: {
        ...formattedMessage,
        isMine: true,
      },
    };
  }

  private async notifyNewMessage(
    request: any,
    senderId: string,
    senderName: string,
  ) {
    const recipientId =
      request.clientUserId === senderId
        ? request.providerUserId
        : request.clientUserId;

    await this.notificationsService
      .createNotification({
        userId: recipientId,
        type: 'NEW_MESSAGE',
        title: 'Nuevo mensaje',
        message: `${senderName} te envió un mensaje en la solicitud "${request.serviceTitle}"`,
        data: { requestId: request.id },
      })
      .catch(() => {});
  }
}
