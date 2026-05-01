import { spawn } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const appRoot = realpathSync.native(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const rootEnv = resolve(appRoot, '..', '..', '.env');

// Load environment variables if the file exists (native in Node 20.6+)
if (existsSync(rootEnv)) {
  try {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(rootEnv);
    }
  } catch (e) {
    console.warn('Failed to load root .env file:', e.message);
  }
}
const nextBin = resolve(appRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
const args = process.argv.slice(2);
const command = args[0] ?? 'build';

const env = {
  ...process.env,
  NODE_ENV: command === 'build' || command === 'start' ? 'production' : process.env.NODE_ENV,
};

const child = spawn(process.execPath, [nextBin, ...args], {
  cwd: appRoot,
  stdio: 'inherit',
  env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
