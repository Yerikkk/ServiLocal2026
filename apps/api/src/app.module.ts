import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { redisStore } from 'cache-manager-redis-yet';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './common/config/env.validation';
import { PrismaModule } from './database/prisma.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { RequestMessagesModule } from './modules/request-messages/request-messages.module';
import { ServiceRequestsModule } from './modules/service-requests/service-requests.module';
import { ServicesModule } from './modules/services/services.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TrustModule } from './modules/trust/trust.module';
import { UsersModule } from './modules/users/users.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SupportModule } from './modules/support/support.module';
import { UploadModule } from './common/upload/upload.module';
import { WebsocketsModule } from './common/websockets/websockets.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CsrfGuard } from './common/guards/csrf.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (redisUrl) {
          try {
            return {
              store: await redisStore({ url: redisUrl }),
            };
          } catch {
            console.warn('⚠️ Redis no disponible, usando cache en memoria');
          }
        }
        return { ttl: 60 };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL');
        const throttlerConfig: any = {
          throttlers: [
            {
              ttl: 60000,
              limit: config.get<string>('STRESS_TEST') === 'true' ? 1000000 : 20,
            },
          ],
        };
        if (redisUrl) {
          try {
            throttlerConfig.storage = new ThrottlerStorageRedisService(redisUrl);
          } catch {
            console.warn('⚠️ Redis no disponible para throttling, usando memoria');
          }
        }
        return throttlerConfig;
      },
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProvidersModule,
    ServiceRequestsModule,
    RequestMessagesModule,
    AdminModule,
    NotificationsModule,
    FavoritesModule,
    ServicesModule,
    TrustModule,
    ScheduleModule.forRoot(),
    TasksModule,
    ReviewsModule,
    ReportsModule,
    SupportModule,
    UploadModule,
    WebsocketsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}
