import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // ─── Public ────────────────────────────────────────────

  @UseInterceptors(CacheInterceptor)
  @Get('public')
  async listPublic(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('providerId') providerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.servicesService.listPublicServices({
      search,
      categoryId,
      providerId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @UseInterceptors(CacheInterceptor)
  @Get('categories')
  async listCategories() {
    return this.servicesService.listPublicCategories();
  }

  // ─── Provider ──────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async listMyServices(@CurrentUser() user: any) {
    return this.servicesService.listMyServices(user.sub, user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateServiceDto) {
    return this.servicesService.create(user.sub, user.role, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':serviceId')
  async update(
    @CurrentUser() user: any,
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.updateMyService(
      user.sub,
      user.role,
      serviceId,
      dto,
    );
  }
}
