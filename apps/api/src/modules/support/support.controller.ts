import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SupportService } from './support.service';
import { ContactSupportDto } from './dto/contact-support.dto';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('contact')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async contact(@Body() contactSupportDto: ContactSupportDto) {
    return this.supportService.sendContactEmail(contactSupportDto);
  }
}
