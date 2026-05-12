import type { IncomingMessage, ServerResponse } from 'node:http';
import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { createTrpcContext } from './trpc/trpc.context';
import { TrpcRouter } from './trpc/trpc.router';

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
    bodyParser: false,
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

  const trpcRouter = app.get(TrpcRouter);
  expressApp.use(
    '/trpc',
    createExpressMiddleware({
      router: trpcRouter.appRouter,
      createContext: async ({ req }) => createTrpcContext(req),
    }),
  );

  app.use(json({ limit: '60mb' }));
  app.use(urlencoded({ extended: true, limit: '60mb' }));

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

// --- Vercel Serverless Function Handler ---
let cachedHandler: ((req: IncomingMessage, res: ServerResponse) => void) | null = null;
let bootstrapError: Error | null = null;

async function getHandler() {
  if (bootstrapError) throw bootstrapError;
  if (!cachedHandler) {
    try {
      console.log('[Vercel] Bootstrapping NestJS application...');
      const startTime = Date.now();

      const app = await createApp();
      await app.init();
      cachedHandler = app.getHttpAdapter().getInstance();

      console.log(`[Vercel] NestJS bootstrapped in ${Date.now() - startTime}ms`);
    } catch (error) {
      bootstrapError = error instanceof Error ? error : new Error(String(error));
      console.error('[Vercel] NestJS bootstrap FAILED:', bootstrapError.message);
      console.error(bootstrapError.stack);
      throw bootstrapError;
    }
  }
  return cachedHandler;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const server = await getHandler();
    return server(req, res);
  } catch (error) {
    console.error('[Vercel] Handler error:', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Internal Server Error',
          message:
            process.env.NODE_ENV === 'production'
              ? 'The server encountered an error during startup.'
              : String(error),
        }),
      );
    }
  }
}
