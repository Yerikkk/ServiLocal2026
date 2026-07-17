const path = require('path');
const express = require('express');

const server = express();
let bootstrapPromise = null;

async function bootstrap() {
  const distDir = path.join(__dirname, '..', 'dist');

  const { NestFactory } = require('@nestjs/core');
  const { ExpressAdapter } = require('@nestjs/platform-express');
  const { AppModule } = require(path.join(distDir, 'app.module'));
  const { setupApp } = require(path.join(distDir, 'setup-app'));

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  setupApp(app);
  await app.init();
}

module.exports = async function handler(req, res) {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrap();
  }
  await bootstrapPromise;
  server(req, res);
};
