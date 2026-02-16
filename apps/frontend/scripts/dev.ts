import net from 'node:net';

async function isPortAvailable(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = net
      .createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        server.close(() => resolve(true));
      })
      .listen(port);
  });
}

async function findAvailablePort(startPort: number, attempts = 20) {
  for (let i = 0; i < attempts; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting at ${startPort}`);
}

const requestedPort = Number.parseInt(process.env.PORT ?? '3001', 10);
const startPort = Number.isFinite(requestedPort) ? requestedPort : 3001;

const port = await findAvailablePort(startPort);
if (port !== startPort) {
  console.warn(
    `Port ${startPort} is in use. Starting Next.js on port ${port}. Set PORT to override.`,
  );
}

const child = Bun.spawn([process.execPath, '--bun', 'next', 'dev', '--port', String(port)], {
  cwd: `${import.meta.dir}/..`,
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
  env: {
    ...process.env,
    PORT: String(port),
  },
});

process.exit(await child.exited);
