import { createApp } from '../src/main';

let cachedHandler: ((req: unknown, res: unknown) => void) | null = null;

async function getHandler() {
  if (!cachedHandler) {
    const app = await createApp();
    await app.init();
    cachedHandler = app.getHttpAdapter().getInstance();
  }

  return cachedHandler;
}

export default async function handler(req: unknown, res: unknown) {
  const server = await getHandler();
  return server(req, res);
}
