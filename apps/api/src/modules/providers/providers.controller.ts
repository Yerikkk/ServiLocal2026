import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { ProvidersService } from './providers.service';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @UseInterceptors(CacheInterceptor)
  @Get('public')
  async listPublic(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('zone') zone?: string,
    @Query('verifiedOnly') verifiedOnly?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.providersService.listPublicProviders({
      search,
      category,
      zone,
      verifiedOnly: verifiedOnly === 'true',
      sort,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('public/:providerId')
  async getPublic(@Param('providerId') providerId: string) {
    return this.providersService.getPublicProviderById(providerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/trust-summary')
  async trustSummary(@CurrentUser() user: any) {
    return this.providersService.getTrustSummary(user.sub, user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/finance')
  async finance(@CurrentUser() user: any) {
    return this.providersService.getFinanceSummary(user.sub, user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: any) {
    return this.providersService.getMe(user.sub, user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @CurrentUser() user: any,
    @Body() updateProviderProfileDto: UpdateProviderProfileDto,
  ) {
    return this.providersService.updateMe(
      user.sub,
      user.role,
      updateProviderProfileDto,
    );
  }
}
