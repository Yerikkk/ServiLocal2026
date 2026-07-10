import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  app.setGlobalPrefix('api');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
          scriptSrc: ["'self'", 'https:'],
          connectSrc: [
            "'self'",
            'http://localhost:3000',
            'http://localhost:3001',
          ],
          fontSrc: ["'self'", 'data:', 'https:'],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
    }),
  );

  app.use(compression());
  app.use(cookieParser());

  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origen no permitido por CORS'), false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3001);

  if (process.env.STRESS_TEST === 'true') {
    console.log('\n======================================================');
    console.log('[ALERTA DE SISTEMA] MODO PRUEBA DE ESTRÉS ACTIVADO');
    console.log('======================================================');
    console.log('Modificaciones de Configuración:');
    console.log(' - Rate Limiting (Throttler): DESACTIVADO (Límite: 1,000,000 req/min)');
    console.log(' - Pool de Conexiones (BD): Estándar');
    console.log('------------------------------------------------------');
    console.log('El sistema está listo para pruebas de alta concurrencia.');
    console.log('======================================================\n');
  }
}
bootstrap();
