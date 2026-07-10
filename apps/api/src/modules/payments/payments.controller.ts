import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(@Body() body: { amount: number; currency?: string }) {
    return this.paymentsService.createPaymentIntent(
      body.amount,
      body.currency || 'PEN',
    );
  }

  // TODO: When integrating a real payment provider (Stripe, PayPal, etc.),
  // validate the webhook signature from the provider's headers to prevent forgery.
  @Post('webhook')
  async handleWebhook(@Body() event: any) {
    return this.paymentsService.handleWebhook(event);
  }
}

