import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateRequestMessageDto } from './dto/create-request-message.dto';
import { RequestMessagesService } from './request-messages.service';

@UseGuards(JwtAuthGuard)
@Controller('request-messages')
export class RequestMessagesController {
  constructor(
    private readonly requestMessagesService: RequestMessagesService,
  ) {}

  @Get('request/:requestId')
  async listMessages(
    @CurrentUser() user: any,
    @Param('requestId') requestId: string,
  ) {
    return this.requestMessagesService.listMessages(
      user.sub,
      user.role,
      requestId,
    );
  }

  @Post('request/:requestId')
  async createMessage(
    @CurrentUser() user: any,
    @Param('requestId') requestId: string,
    @Body() dto: CreateRequestMessageDto,
  ) {
    return this.requestMessagesService.createMessage(
      user.sub,
      user.role,
      requestId,
      dto,
    );
  }
}
