import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReportStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { TrustService } from '../trust/trust.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReportDto, ReviewReportDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trustService: TrustService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /** Crear un nuevo reporte */
  async create(reporterUserId: string, dto: CreateReportDto) {
    if (reporterUserId === dto.reportedUserId) {
      throw new BadRequestException('No puedes reportarte a ti mismo');
    }

    // Verificar que el usuario reportado existe
    const reportedUser = await this.prisma.user.findUnique({
      where: { id: dto.reportedUserId },
      select: { id: true, fullName: true },
    });

    if (!reportedUser) {
      throw new NotFoundException('Usuario reportado no encontrado');
    }

    // Verificar que no existe un reporte pendiente idéntico del mismo usuario
    const existingPending = await this.prisma.report.findFirst({
      where: {
        reporterUserId,
        reportedUserId: dto.reportedUserId,
        status: ReportStatus.PENDING,
        ...(dto.requestId ? { requestId: dto.requestId } : {}),
      },
    });

    if (existingPending) {
      throw new BadRequestException(
        'Ya tienes un reporte pendiente contra este usuario',
      );
    }

    const report = await this.prisma.report.create({
      data: {
        reporterUserId,
        reportedUserId: dto.reportedUserId,
        requestId: dto.requestId ?? null,
        reason: dto.reason,
        description: dto.description?.trim() ?? null,
      },
    });

    return {
      message:
        'Reporte enviado. El equipo de ServiLocal lo revisará en las próximas 24 horas.',
      reportId: report.id,
    };
  }

  /** Listar reportes (Admin) con filtro por estado */
  async listReports(filters: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (
      filters.status &&
      Object.values(ReportStatus).includes(filters.status as ReportStatus)
    ) {
      where.status = filters.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporterUser: { select: { id: true, fullName: true, email: true } },
          reportedUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              trustScore: true,
            },
          },
          request: { select: { id: true, serviceTitle: true } },
          reviewedByUser: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    const pendingCount = await this.prisma.report.count({
      where: { status: ReportStatus.PENDING },
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      pendingCount,
    };
  }

  /** Admin revisa un reporte: aplica sanción o desestima */
  async reviewReport(
    adminUserId: string,
    reportId: string,
    dto: ReviewReportDto,
  ) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reportedUser: { select: { id: true, fullName: true } },
        reporterUser: { select: { id: true, fullName: true } },
      },
    });

    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException('Este reporte ya fue revisado');
    }

    const newStatus =
      dto.action === 'REVIEWED'
        ? ReportStatus.REVIEWED
        : ReportStatus.DISMISSED;

    await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: newStatus,
        reviewedByUserId: adminUserId,
        reviewedAt: new Date(),
      },
    });

    if (dto.action === 'REVIEWED') {
      // Aplicar penalización de Trust al usuario reportado
      await this.trustService
        .recordTrustEvent({
          userId: report.reportedUserId,
          eventType: 'ADMIN_REPORT',
          customReason: dto.notes ?? 'Reporte validado por administrador',
        })
        .catch(() => {});

      // Notificar al usuario reportado
      await this.notificationsService
        .createNotification({
          userId: report.reportedUserId,
          type: 'ACCOUNT_WARNING',
          title: 'Aviso de conducta',
          message:
            'Hemos recibido y validado un reporte sobre tu comportamiento en la plataforma. Esto puede afectar tu puntuación de confianza.',
          data: { reportId },
        })
        .catch(() => {});

      // Registrar en auditoría
      await this.prisma.auditLog.create({
        data: {
          actorUserId: adminUserId,
          action: 'ADMIN_REPORT_APPLIED',
          metadata: {
            reportId,
            reportedUserId: report.reportedUserId,
            reason: report.reason,
            notes: dto.notes,
          },
        },
      });
    }

    return {
      message:
        dto.action === 'REVIEWED'
          ? 'Sanción aplicada y puntuación de confianza actualizada'
          : 'Reporte desestimado',
      reportId,
      newStatus,
    };
  }
}
