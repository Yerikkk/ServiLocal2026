import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // ─── Providers ─────────────────────────────────────────

  @Post('providers/:providerId')
  async toggleFavoriteProvider(
    @CurrentUser() user: any,
    @Param('providerId') providerId: string,
  ) {
    return this.favoritesService.toggleFavoriteProvider(user.sub, providerId);
  }

  @Get('providers')
  async listFavoriteProviders(@CurrentUser() user: any) {
    return this.favoritesService.listFavoriteProviders(user.sub);
  }

  @Get('providers/:providerId/check')
  async checkFavoriteProvider(
    @CurrentUser() user: any,
    @Param('providerId') providerId: string,
  ) {
    return this.favoritesService.checkFavoriteProvider(user.sub, providerId);
  }

  // ─── Services ──────────────────────────────────────────

  @Post('services/:serviceId')
  async toggleFavoriteService(
    @CurrentUser() user: any,
    @Param('serviceId') serviceId: string,
  ) {
    return this.favoritesService.toggleFavoriteService(user.sub, serviceId);
  }

  @Get('services')
  async listFavoriteServices(@CurrentUser() user: any) {
    return this.favoritesService.listFavoriteServices(user.sub);
  }
}
