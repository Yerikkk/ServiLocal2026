import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup-app';
import express from 'express';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );

  setupApp(app);

  await app.init();
}

const bootstrapPromise = bootstrap();

export default async function handler(req: any, res: any) {
  await bootstrapPromise;
  server(req, res);
}
