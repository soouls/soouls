export const NOTIFICATIONS_QUEUE = 'notifications';
export const DEFAULT_FRONTEND_URL = process.env.FRONTEND_URL ?? '';
export const DEFAULT_COMMAND_CENTER_URL = process.env.COMMAND_CENTER_URL ?? '';
export const NOTIFICATION_BATCH_SIZE = 20;

export const SOOULS_LINKS = {
  website: process.env.SOOULS_WEBSITE_URL ?? 'https://soouls.in',
  source: process.env.SOOULS_SOURCE_URL ?? 'https://source.in',
  instagram: process.env.SOOULS_INSTAGRAM_URL ?? 'https://www.instagram.com/soouls.in/',
  x: process.env.SOOULS_X_URL ?? 'https://x.com/Soouls_in',
  linkedin:
    process.env.SOOULS_LINKEDIN_URL ?? 'https://www.linkedin.com/company/soouls/?viewAsMember=true',
  whatsappGroup:
    process.env.SOOULS_WHATSAPP_GROUP_URL ?? 'https://chat.whatsapp.com/FbOlj3NEtbh3AsnIPRyYAd',
  emailHeroImage:
    process.env.SOOULS_EMAIL_HERO_IMAGE_URL ??
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80',
};

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
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_FRONTEND_URL ??
    process.env.FRONTEND_URL ??
    DEFAULT_FRONTEND_URL
  );
}

export function getCommandCenterUrl() {
  return process.env.COMMAND_CENTER_URL ?? DEFAULT_COMMAND_CENTER_URL;
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
