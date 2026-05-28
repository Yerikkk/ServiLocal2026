import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestStatusDto } from './dto/update-service-request-status.dto';
import { ServiceRequestsService } from './service-requests.service';

@UseGuards(JwtAuthGuard)
@Controller('service-requests')
export class ServiceRequestsController {
  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
  ) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateServiceRequestDto) {
    return this.serviceRequestsService.create(user.sub, user.role, dto);
  }

  @Get('client/me')
  async listClient(@CurrentUser() user: any) {
    return this.serviceRequestsService.listClientRequests(user.sub, user.role);
  }

  @Get('provider/me')
  async listProvider(@CurrentUser() user: any) {
    return this.serviceRequestsService.listProviderRequests(
      user.sub,
      user.role,
    );
  }

  @Patch(':requestId/status')
  async updateStatus(
    @CurrentUser() user: any,
    @Param('requestId') requestId: string,
    @Body() dto: UpdateServiceRequestStatusDto,
  ) {
    return this.serviceRequestsService.updateStatus(
      user.sub,
      user.role,
      requestId,
      dto,
    );
  }
}
