import type { HomeCluster, UserEntry } from '@soouls/api/router';

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
  if (entry.title?.trim()) return entry.title.trim();
  const firstLine =
    entry.content
      .split('\n')
      .map((line) => line.trim())
      .find(Boolean) ?? '';
  return firstLine.slice(0, 80) || 'Untitled entry';
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

  const corpus = `${entry.title ?? ''} ${entry.content}`.toLowerCase();
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
