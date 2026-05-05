import type { HomeCluster, UserEntry } from '@soouls/api/router';
import { getEntrySearchText, getEntryTitle as getParsedEntryTitle } from './entries';

function ordinal(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return `${value}st`;
  if (mod10 === 2 && mod100 !== 12) return `${value}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${value}rd`;
  return `${value}th`;
}

export function formatCurrentMonthRange(now = new Date()): string {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  return `${ordinal(start.getDate())} ${month}-${ordinal(end.getDate())} ${month}`;
}

export function getEntryTitle(entry: Pick<UserEntry, 'title' | 'content'>): string {
  return getParsedEntryTitle(entry);
}

export function truncateText(value: string, length: number): string {
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}...`;
}

export function buildActivityBars(
  entries: Array<Pick<UserEntry, 'createdAt'>>,
  buckets = 8,
): number[] {
  const counts = new Array(buckets).fill(0);
  for (const entry of entries) {
    const hour = new Date(entry.createdAt).getHours();
    const index = Math.min(buckets - 1, Math.floor((hour / 24) * buckets));
    counts[index] += 1;
  }

  const max = Math.max(...counts, 1);
  return counts.map((count) => Math.max(12, Math.round((count / max) * 100)));
}

export function buildWeeklyActivityBars(
  entries: Array<Pick<UserEntry, 'createdAt'>>,
  now = new Date(),
): number[] {
  const counts = new Array(7).fill(0);
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  // We want to map current week's days (Sun-Sat)
  // But the design might show the last 7 days relative to today.
  // Actually, Sun Mon Tue Wed Thu Fri Sat is standard.
  
  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    if (date >= weekAgo) {
      const day = date.getDay(); // 0 is Sunday
      counts[day] += 1;
    }
  }

  const max = Math.max(...counts, 1);
  return counts.map((count) => Math.max(12, Math.round((count / max) * 100)));
}


export function clusterMatchesEntry(
  cluster: Pick<HomeCluster, 'name'>,
  entry: Pick<UserEntry, 'title' | 'content'>,
): boolean {
  const keywords = cluster.name
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((word) => word.trim())
    .filter((word) => word.length > 2);

  if (keywords.length === 0) return false;

  const corpus = getEntrySearchText(entry);
  return keywords.some((keyword) => corpus.includes(keyword));
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
