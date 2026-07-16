import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { setupApp } from './setup-app';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  setupApp(app);

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
