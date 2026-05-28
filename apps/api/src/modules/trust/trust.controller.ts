import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrustService } from './trust.service';

@UseGuards(JwtAuthGuard)
@Controller('trust')
export class TrustController {
  constructor(private readonly trustService: TrustService) {}

  @Get('me')
  async getMyTrust(@CurrentUser() user: any) {
    return this.trustService.getTrustSummary(user.sub);
  }

  @Get('me/events')
  async getMyTrustEvents(
    @CurrentUser() user: any,
    @Query('take') take?: string,
  ) {
    return this.trustService.getUserEvents(user.sub, Number(take) || 50);
  }
}
