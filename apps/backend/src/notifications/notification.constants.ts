export const NOTIFICATIONS_QUEUE = 'notifications';
export const DEFAULT_FRONTEND_URL = process.env.FRONTEND_URL ?? '';
export const DEFAULT_COMMAND_CENTER_URL = process.env.COMMAND_CENTER_URL ?? '';
export const NOTIFICATION_BATCH_SIZE = 20;
export const QSTASH_RETRY_COUNT = 5;

export type NotificationJobMap = {
  'welcome-sequence': { userId: string };
  'secure-access': { email: string };
  'admin-invite': { inviteId: string };
  'campaign-dispatch': { campaignId: string };
  'gdpr-export': { userId: string; requestorEmail: string };
};

export type NotificationJobName = keyof NotificationJobMap;
export type NotificationJobData = NotificationJobMap[NotificationJobName];

export function createRedisConnection() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    return null;
  }

  const parsed = new URL(redisUrl);

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    db: parsed.pathname && parsed.pathname !== '/' ? Number(parsed.pathname.slice(1)) : undefined,
    tls: parsed.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

export function getFrontendUrl() {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_FRONTEND_URL ??
    process.env.FRONTEND_URL ??
    DEFAULT_FRONTEND_URL;
  if (!raw) return '';
  return raw.split(',')[0].trim();
}

export function getCommandCenterUrl() {
  return process.env.COMMAND_CENTER_URL ?? DEFAULT_COMMAND_CENTER_URL;
}

export function getBackendPublicUrl() {
  return (
    process.env.BACKEND_PUBLIC_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.BACKEND_URL ??
    ''
  );
}

export function makeAbsoluteUrl(path: string) {
  return new URL(path, getFrontendUrl()).toString();
}

export function normalizePhoneNumber(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const cleaned = value.replace(/[^\d+]/g, '');

  if (!cleaned) {
    return null;
  }

  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

export function asWhatsappRecipient(value: string) {
  return value.startsWith('whatsapp:') ? value : `whatsapp:${value}`;
}

export function compactPreview(payload: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
}

export function parseEnvList(value: string | undefined) {
  return new Set(
    (value ?? '')
      .replace(/["']/g, '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function countValue(raw: unknown) {
  const value = typeof raw === 'number' ? raw : Number(raw ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export function getConfiguredResendSegments() {
  return [
    process.env.RESEND_ALL_USERS_SEGMENT_ID,
    process.env.RESEND_DEFAULT_SEGMENT_ID,
    process.env.RESEND_SIGNUPS_SEGMENT_ID,
  ].filter((segmentId): segmentId is string => Boolean(segmentId));
}
