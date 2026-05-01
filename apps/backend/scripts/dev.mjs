import { spawn } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootEnv = resolve(currentDir, '..', '..', '..', '.env');

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

const appRoot = realpathSync.native(resolve(currentDir, '..'));
const entryPoint = resolve(appRoot, 'src', 'main.ts');

const child = spawn('bun', ['run', entryPoint], {
  cwd: appRoot,
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

child.on('error', (error) => {
  console.error('[Soouls API] Failed to start backend dev process:', error);
  process.exit(1);
});

function stopChild(signal = 'SIGTERM') {
  if (!child.killed && child.exitCode === null) {
    child.kill(signal);
  }
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    stopChild(signal);
  });
}

process.on('exit', () => {
  stopChild();
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
