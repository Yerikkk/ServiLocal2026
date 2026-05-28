import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /** Crear reseña (solo clientes, solicitud COMPLETED) */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.sub, user.role, dto);
  }

  /** Mis reseñas recibidas (proveedor) */
  @UseGuards(JwtAuthGuard)
  @Get('me/received')
  async getMyReceivedReviews(@CurrentUser() user: any) {
    return this.reviewsService.getMyReceivedReviews(user.sub, user.role);
  }

  /** Mis reseñas escritas (cliente) */
  @UseGuards(JwtAuthGuard)
  @Get('me/written')
  async getMyWrittenReviews(@CurrentUser() user: any) {
    return this.reviewsService.getMyWrittenReviews(user.sub, user.role);
  }

  /** Verificar si ya existe reseña para un requestId */
  @UseGuards(JwtAuthGuard)
  @Get('check/:requestId')
  async checkReview(@Param('requestId') requestId: string) {
    return this.reviewsService.checkReviewExists(requestId);
  }

  /** Reseñas públicas de un proveedor */
  @Get('provider/:providerId')
  async getProviderReviews(@Param('providerId') providerId: string) {
    return this.reviewsService.getProviderReviews(providerId);
  }
}
