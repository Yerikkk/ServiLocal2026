import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { UpdateConfigDto } from './dto/admin-config.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Dashboard ─────────────────────────────────────────

  @Get('dashboard')
  async dashboard() {
    return this.adminService.getDashboardStats();
  }

  // ─── Users ─────────────────────────────────────────────

  @Get('users')
  async listUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listUsers({
      search,
      role,
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('users/:userId')
  async getUser(@Param('userId') userId: string) {
    return this.adminService.getUserById(userId);
  }

  @Patch('users/:userId/status')
  async updateUserStatus(
    @CurrentUser() admin: { sub: string },
    @Param('userId') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(admin.sub, userId, dto);
  }

  @Patch('users/:userId/verify')
  async verifyProvider(
    @CurrentUser() admin: { sub: string },
    @Param('userId') userId: string,
    @Body() body: { verified: boolean },
  ) {
    return this.adminService.verifyProvider(admin.sub, userId, body.verified);
  }

  // ─── Categories ────────────────────────────────────────

  @Get('categories')
  async listCategories() {
    return this.adminService.listCategories();
  }

  @Post('categories')
  async createCategory(
    @CurrentUser() admin: { sub: string },
    @Body() dto: CreateCategoryDto,
  ) {
    return this.adminService.createCategory(admin.sub, dto);
  }

  @Patch('categories/:categoryId')
  async updateCategory(
    @CurrentUser() admin: { sub: string },
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.adminService.updateCategory(admin.sub, categoryId, dto);
  }

  // ─── Audit Log ─────────────────────────────────────────

  @Get('audit-logs')
  async listAuditLogs(
    @Query('search') search?: string,
    @Query('action') action?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listAuditLogs({
      search,
      action,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  // ─── Service Requests ────────────────────────────────────

  @Get('requests')
  async listRequests(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listRequests({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  // ─── System Config ───────────────────────────────────────

  @Get('config')
  async getConfig() {
    return this.adminService.getConfig();
  }

  @Patch('config')
  async updateConfig(
    @CurrentUser() admin: { sub: string },
    @Body() dto: UpdateConfigDto,
  ) {
    return this.adminService.updateConfig(admin.sub, dto);
  }
}
