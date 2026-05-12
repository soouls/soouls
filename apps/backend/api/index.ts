import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from '../src/main';

let cachedHandler: ((req: IncomingMessage, res: ServerResponse) => void) | null = null;
let bootstrapError: Error | null = null;

async function getHandler() {
  // If a previous bootstrap attempt failed, don't retry every request —
  // return the cached error so Vercel logs show the real cause.
  if (bootstrapError) {
    throw bootstrapError;
  }

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

    // Return a proper error response instead of crashing silently
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
