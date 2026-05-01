import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';
import helmet from 'helmet';
import pino from 'pino-http';
import { AppModule } from './app.module';

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });

  const app = await NestFactory.create(AppModule);

  app.use(
    pino({
      autoLogging: true,
    }),
  );
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const appWithBodyParser = app as typeof app & {
    useBodyParser: (
      type: 'json' | 'urlencoded',
      options: Record<string, boolean | number | string>,
    ) => void;
  };

  appWithBodyParser.useBodyParser('json', { limit: '10mb' });
  appWithBodyParser.useBodyParser('urlencoded', { extended: true, limit: '10mb' });
  app.use(helmet());

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const allowedOrigins = Array.from(
    new Set(
      [
        process.env.FRONTEND_URL,
        process.env.COMMAND_CENTER_URL,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
      ].filter(Boolean) as string[],
    ),
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

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`[Soouls API] Listening on port ${port}`);
  console.log(`[Soouls API] CORS allowed origins: ${allowedOrigins.join(', ')}`);
}

bootstrap();
