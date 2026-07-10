import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ContactSupportDto } from './dto/contact-support.dto';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendContactEmail(contactSupportDto: ContactSupportDto) {
    try {
      const transporter = nodemailer.createTransport({
        host: this.configService.get<string>('MAIL_HOST') ?? 'localhost',
        port: Number(this.configService.get<string>('MAIL_PORT') ?? '1025'),
        secure: false,
      });

      const from = this.configService.get<string>('MAIL_FROM') ?? 'no-reply@servilocal.pe';
      const to = this.configService.get<string>('SUPPORT_EMAIL') ?? 'soporte@servilocal.pe';

      await transporter.sendMail({
        from,
        to,
        subject: `[Soporte] ${contactSupportDto.subject}`,
        text: `Nombre: ${contactSupportDto.fullName}\nEmail: ${contactSupportDto.email}\n\nMensaje:\n${contactSupportDto.message}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
            <h2 style="margin-bottom: 8px;">Nuevo mensaje de soporte</h2>
            <p><strong>De:</strong> ${contactSupportDto.fullName} (${contactSupportDto.email})</p>
            <p><strong>Asunto:</strong> ${contactSupportDto.subject}</p>
            <hr />
            <p style="white-space: pre-wrap;">${contactSupportDto.message}</p>
          </div>
        `,
      });

      this.logger.log(`Contact email sent from ${contactSupportDto.email}`);
      return { message: 'Mensaje enviado correctamente' };
    } catch (error) {
      this.logger.error('Error sending contact email', error);
      throw error;
    }
  }
}
