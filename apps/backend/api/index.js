'use strict';

let cachedHandler = null;
let bootstrapError = null;

async function getHandler() {
  if (bootstrapError) {
    throw bootstrapError;
  }

  if (!cachedHandler) {
    try {
      console.log('[Vercel] Bootstrapping NestJS application...');
      const startTime = Date.now();
      const { createApp } = await import('../dist/apps/backend/src/main.js');
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

module.exports = async function handler(req, res) {
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
};
