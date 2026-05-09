import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

const isVercel = process.env.VERCEL === '1';

export async function createApp(): Promise<INestApplication> {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // Lower sampling in serverless to reduce cold start overhead
    tracesSampleRate: isVercel ? 0.1 : 1.0,
    profilesSampleRate: isVercel ? 0 : 1.0,
  });

  const app = await NestFactory.create(AppModule, {
    // Disable verbose logging in serverless to speed up cold start
    logger: isVercel ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Skip pino-http on Vercel — it adds cold start weight and Vercel has built-in logging
  if (!isVercel) {
    const pinoHttp = await import('pino-http');
    const pino = pinoHttp.default || pinoHttp;
    app.use(
      (pino as any)({
        autoLogging: true,
      }),
    );
  }

  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Only set global prefix if VERCEL_BACKEND_PREFIX is explicitly configured
  // (e.g. when routing through a shared domain). Standalone Vercel projects don't need it.
  const backendPrefix = process.env.VERCEL_BACKEND_PREFIX;
  if (backendPrefix) {
    app.setGlobalPrefix(backendPrefix);
  } else if (!isVercel && !isDevelopment) {
    app.setGlobalPrefix('/_/backend');
  }

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.use(helmet());

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const allowedOrigins = Array.from(
    new Set([process.env.FRONTEND_URL, process.env.COMMAND_CENTER_URL].filter(Boolean) as string[]),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      // Allow all Vercel domains (production & previews)
      if (origin.endsWith('.vercel.app')) {
        callback(null, true);
        return;
      }

      if (isDevelopment && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS origin not allowed: ${origin}`), false);
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Forwarded-User-Id',
      'X-Masquerade-Session',
      'X-Clerk-Authorization',
    ],
    credentials: true,
  });

  console.log(`[Soouls API] CORS allowed origins: ${allowedOrigins.join(', ')}`);
  return app;
}

async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`[Soouls API] Listening on port ${port}`);
}

if (!isVercel) {
  void bootstrap();
}

