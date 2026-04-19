import type { EntryBlock, EntryPayload } from './types';

export function encodeEntryPayload(textContent: string, blocks: EntryBlock[]) {
  const payload: EntryPayload = {
    version: 2,
    textContent,
    blocks,
  };

  return JSON.stringify(payload);
}

export function decodeEntryPayload(raw: string): EntryPayload {
  try {
    const parsed = JSON.parse(raw) as Partial<EntryPayload> | null;
    if (parsed && parsed.version === 2 && Array.isArray(parsed.blocks)) {
      return {
        version: 2,
        textContent: typeof parsed.textContent === 'string' ? parsed.textContent : '',
        blocks: parsed.blocks as EntryBlock[],
      };
    }
  } catch {
    // fall back to legacy text entries
  }

  return {
    version: 2,
    textContent: raw,
    blocks: [],
  };
}

export function extractEntryPreview(raw: string) {
  return decodeEntryPayload(raw).textContent || raw;
}
