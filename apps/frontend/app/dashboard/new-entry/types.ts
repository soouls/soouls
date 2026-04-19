export type EntryBlock =
  | { id: string; type: 'image'; dataUrl: string; name: string }
  | { id: string; type: 'voice'; dataUrl: string; duration: number }
  | { id: string; type: 'doodle'; dataUrl: string }
  | { id: string; type: 'goal'; goal: string; label: string; seconds: number; running: boolean }
  | {
      id: string;
      type: 'tasklist';
      title: string;
      tasks: { id: string; text: string; done: boolean }[];
    };

export interface EntryPayload {
  version: 2;
  textContent: string;
  blocks: EntryBlock[];
}
