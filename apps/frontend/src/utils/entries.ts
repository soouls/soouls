import type { UserEntry } from '@soouls/api/router';
import LZString from 'lz-string';

type EntryGoalBlock = {
  type: 'goal';
  goal?: string;
  label?: string;
  seconds?: number;
};

type EntryTasklistBlock = {
  type: 'tasklist';
  title?: string;
  tasks?: Array<{ text?: string; done?: boolean }>;
};

type EntryImageBlock = {
  type: 'image';
  dataUrl?: string;
  url?: string;
  src?: string;
  name?: string;
  isSticker?: boolean;
  isGif?: boolean;
};

type EntryVoiceBlock = {
  type: 'voice';
  duration?: number;
};

type EntryDoodleBlock = {
  type: 'doodle';
};

type EntryParagraphBlock = {
  type: 'paragraph';
  content?: string;
};

export type EntryBlock =
  | EntryGoalBlock
  | EntryTasklistBlock
  | EntryImageBlock
  | EntryVoiceBlock
  | EntryDoodleBlock
  | EntryParagraphBlock
  | { type?: string; [key: string]: unknown };

export type ParsedEntryData = {
  title: string;
  textContent: string;
  fullText: string;
  excerpt: string;
  blocks: EntryBlock[];
  goals: EntryGoalBlock[];
  tasklists: EntryTasklistBlock[];
  imageCount: number;
  voiceCount: number;
  doodleCount: number;
};

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function firstMeaningfulLine(value: string): string {
  return (
    value
      .split('\n')
      .map((line) => line.trim())
      .find(Boolean) ?? ''
  );
}

function blockToText(block: EntryBlock): string[] {
  if (!block || typeof block !== 'object') return [];

  if (block.type === 'goal') {
    return [normalizeText(block.goal), normalizeText(block.label)].filter(Boolean);
  }

  if (block.type === 'paragraph') {
    return [normalizeText(block.content)].filter(Boolean);
  }

  if (block.type === 'tasklist') {
    const taskTexts = Array.isArray(block.tasks)
      ? block.tasks.map((task) => normalizeText(task?.text)).filter(Boolean)
      : [];
    return [normalizeText(block.title), ...taskTexts].filter(Boolean);
  }

  if (block.type === 'image') {
    return [normalizeText(block.name)].filter(Boolean);
  }

  return [];
}

/**
 * Robustly decodes entry content, handling potential compression and encoding variations.
 * Optimized to prevent character garbling (especially for emojis and non-standard symbols).
 */
export function decodeEntryContent(rawContent: string | null | undefined): string {
  if (!rawContent) return '';

  const trimmed = rawContent.trim();

  // 1. If it's already a valid JSON string (starts with { or [), return as is
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return rawContent;

  try {
    // 2. Handle draft prefix if present (used in local storage drafts)
    const cleanContent = trimmed.startsWith('lz:') ? trimmed.slice(3) : trimmed;

    // 3. Attempt decompression from Base64 (Standard for new records)
    let decompressed = LZString.decompressFromBase64(cleanContent);

    // 4. Fallback to UTF16 (Legacy/Mixed records)
    if (!decompressed) {
      decompressed = LZString.decompressFromUTF16(cleanContent);
    }

    // 5. Final validation: if we got something and it looks like it could be JSON or plain text
    if (decompressed && decompressed.length > 0) {
      return decompressed;
    }

    return rawContent;
  } catch (err) {
    console.warn('Failed to decode entry content:', err);
    return rawContent;
  }
}

export function parseEntryData(
  rawContent: string | null | undefined,
  fallbackTitle?: string | null,
): ParsedEntryData {
  const decoded = decodeEntryContent(rawContent);
  const baseTitle = normalizeText(fallbackTitle);

  try {
    const parsed = JSON.parse(decoded) as {
      title?: string;
      textContent?: string;
      blocks?: EntryBlock[];
    };

    if (parsed && typeof parsed === 'object') {
      const blocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];
      const blockText = blocks.flatMap((block) => blockToText(block));
      const textContent = normalizeText(parsed.textContent);
      const fullText = [textContent, ...blockText].filter(Boolean).join('\n\n').trim();
      const title =
        baseTitle ||
        normalizeText(parsed.title) ||
        firstMeaningfulLine(textContent) ||
        blockText[0] ||
        'Untitled entry';

      return {
        title,
        textContent,
        fullText,
        excerpt: firstMeaningfulLine(fullText) || title,
        blocks,
        goals: blocks.filter((block): block is EntryGoalBlock => block.type === 'goal'),
        tasklists: blocks.filter((block): block is EntryTasklistBlock => block.type === 'tasklist'),
        imageCount: blocks.filter((block) => block.type === 'image').length,
        voiceCount: blocks.filter((block) => block.type === 'voice').length,
        doodleCount: blocks.filter((block) => block.type === 'doodle').length,
      };
    }
  } catch {
    // The content is plain text, which is still a valid entry payload for legacy records.
  }

  const plainText = decoded.trim();
  const title = baseTitle || firstMeaningfulLine(plainText) || 'Untitled entry';

  return {
    title,
    textContent: plainText,
    fullText: plainText,
    excerpt: firstMeaningfulLine(plainText) || title,
    blocks: [],
    goals: [],
    tasklists: [],
    imageCount: 0,
    voiceCount: 0,
    doodleCount: 0,
  };
}

export function getEntryTitle(entry: Pick<UserEntry, 'title' | 'content'>): string {
  return parseEntryData(entry.content, entry.title).title;
}

export function getEntryPlainText(entry: Pick<UserEntry, 'title' | 'content'>): string {
  return parseEntryData(entry.content, entry.title).fullText;
}

export function getEntrySearchText(entry: Pick<UserEntry, 'title' | 'content'>): string {
  const parsed = parseEntryData(entry.content, entry.title);
  return [parsed.title, parsed.fullText].filter(Boolean).join(' ').toLowerCase();
}
