'use client';

import { useUser } from '@clerk/nextjs';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import imageCompression from 'browser-image-compression';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Check,
  Clock,
  Eraser,
  GripVertical,
  Image as ImageIcon,
  ListTodo,
  Loader2,
  Mic,
  Pause,
  PenTool,
  Play,
  Plus,
  Sparkles,
  Square,
  StopCircle,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { decodeEntryContent } from '../../../src/utils/entries';
import { getOptimizedImageUrl } from '../../../src/utils/images';
import { trpc } from '../../../src/utils/trpc';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });
const gf = new GiphyFetch(
  process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'umSoMdQJRH8u5gCmX0BXFNPOsWRVhqHe',
);

// Stable references for Giphy Grid to prevent infinite re-renders
const fetchGifsTrending = (offset: number) => gf.trending({ offset, limit: 10, type: 'gifs' });
const fetchStickersTrending = (offset: number) =>
  gf.trending({ offset, limit: 12, type: 'stickers' });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

async function sha256Hex(blob: Blob): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

type MediaBlockMetadata = {
  storageKey?: string;
  contentType?: string;
  byteSize?: number;
  sha256?: string;
  uploadedAt?: string;
};

// ─── Types ────────────────────────────────────────────────────────────────────
type SentenceBentoBlock = {
  id: string;
  text: string;
  order: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type ComposerLayoutItem = {
  id: string;
  kind: 'sentence' | 'block';
  order: number;
  width: number;
  height: number;
};

type EntryMetadata = {
  sentenceBentoLayout?: SentenceBentoBlock[];
  composerLayout?: ComposerLayoutItem[];
};

function splitIntoThoughtUnits(text: string) {
  return text
    .split(/(?<=[.!?])\s+|\n+/g)
    .map((unit) => unit.trim())
    .filter(Boolean);
}

function buildSentenceBentoLayout(text: string): SentenceBentoBlock[] {
  const units = splitIntoThoughtUnits(text);
  const occupied = new Set<string>();
  const fits = (x: number, y: number, width: number, height: number) => {
    for (let yy = y; yy < y + height; yy++) {
      for (let xx = x; xx < x + width; xx++) {
        if (xx >= 6 || occupied.has(`${xx}:${yy}`)) return false;
      }
    }
    return true;
  };
  const occupy = (x: number, y: number, width: number, height: number) => {
    for (let yy = y; yy < y + height; yy++) {
      for (let xx = x; xx < x + width; xx++) {
        occupied.add(`${xx}:${yy}`);
      }
    }
  };

  return units.map((unit, order) => {
    const words = unit.split(/\s+/).filter(Boolean).length;
    const width = Math.min(6, words > 28 || order === 0 ? 2 : words > 14 ? 2 : 1);
    const height = words > 26 ? 2 : 1;
    let placed = { x: 0, y: 0 };
    outer: for (let y = 0; y < 64; y++) {
      for (let x = 0; x <= 6 - width; x++) {
        if (fits(x, y, width, height)) {
          placed = { x, y };
          break outer;
        }
      }
    }
    occupy(placed.x, placed.y, width, height);
    return { id: `sentence_${order + 1}`, text: unit, order, ...placed, width, height };
  });
}

type Block =
  | ({
      id: string;
      type: 'image';
      dataUrl: string;
      name: string;
      isSticker?: boolean;
      isGif?: boolean;
    } & MediaBlockMetadata)
  | ({ id: string; type: 'voice'; dataUrl: string; duration: number } & MediaBlockMetadata)
  | ({ id: string; type: 'doodle'; dataUrl: string } & MediaBlockMetadata)
  | { id: string; type: 'goal'; goal: string; label: string; seconds: number; running: boolean }
  | {
      id: string;
      type: 'tasklist';
      title: string;
      tasks: { id: string; text: string; done: boolean }[];
    };

interface PersistedState {
  textContent: string;
  blocks: Block[];
  metadata?: EntryMetadata;
}

// ─── useLocalStorage hook ─────────────────────────────────────────────────────
// Reads once on mount, writes on every change. Never SSR-crashes.
function usePersistedEntry(initialId: string | null) {
  const lsKeyRef = useRef(`soouls_entry_v1_${initialId || 'new'}`);

  const [textContent, setTextContentRaw] = useState('');
  const textContentRef = useRef(textContent);
  const [blocks, setBlocksRaw] = useState<Block[]>([]);
  const [metadata, setMetadataRaw] = useState<EntryMetadata>({});
  const metadataRef = useRef<EntryMetadata>({});
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage once on mount (client only)
  useEffect(() => {
    // If this is a brand-new entry (no ID), wipe the stale 'new' key
    // so old data never leaks into a fresh canvas.
    if (!initialId) {
      localStorage.removeItem(lsKeyRef.current);
      setHydrated(true);
      return;
    }
    try {
      const raw = localStorage.getItem(lsKeyRef.current);
      if (raw) {
        const parsed: PersistedState = JSON.parse(raw);
        // Pause all goal timers on restore — user can resume manually
        const restored = parsed.blocks.map((b) =>
          b.type === 'goal' ? { ...b, running: false } : b,
        );
        setTextContentRaw(parsed.textContent ?? '');
        textContentRef.current = parsed.textContent ?? '';
        setBlocksRaw(restored);
        setMetadataRaw(parsed.metadata ?? {});
        metadataRef.current = parsed.metadata ?? {};
      }
    } catch {
      /* corrupt data - ignore */
    }
    setHydrated(true);
  }, [initialId]);

  // Persist to localStorage whenever text or blocks change
  const persist = useCallback(
    (text: string, blks: Block[], nextMetadata = metadataRef.current) => {
      if (!hydrated) return;
      setSaveStatus('saving');
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        try {
          const state: PersistedState = {
            textContent: text,
            blocks: blks,
            metadata: {
              ...nextMetadata,
              sentenceBentoLayout: buildSentenceBentoLayout(text),
            },
          };
          localStorage.setItem(lsKeyRef.current, JSON.stringify(state));
          setSaveStatus('saved');
        } catch {
          // localStorage quota exceeded (large images/audio)
          setSaveStatus('idle');
          console.warn('localStorage quota exceeded');
        }
      }, 500);
    },
    [hydrated],
  );

  // Auto-dismiss "saved" pill after 2.5s
  useEffect(() => {
    if (saveStatus !== 'saved') return;
    const t = setTimeout(() => setSaveStatus('idle'), 2500);
    return () => clearTimeout(t);
  }, [saveStatus]);

  // Wrapped setters that also trigger persist
  const setTextContent = useCallback(
    (valOrUpdater: string | ((prev: string) => string)) => {
      setTextContentRaw((prevRaw) => {
        const nextVal = typeof valOrUpdater === 'function' ? valOrUpdater(prevRaw) : valOrUpdater;
        textContentRef.current = nextVal;
        setBlocksRaw((prevBlocks) => {
          persist(nextVal, prevBlocks, metadataRef.current);
          return prevBlocks;
        });
        return nextVal;
      });
    },
    [persist],
  );

  const setBlocks = useCallback(
    (updater: (prev: Block[]) => Block[]) => {
      setBlocksRaw((prev) => {
        const next = updater(prev);
        persist(textContentRef.current, next, metadataRef.current);
        return next;
      });
    },
    [persist],
  );

  const setMetadata = useCallback(
    (updater: EntryMetadata | ((prev: EntryMetadata) => EntryMetadata)) => {
      setMetadataRaw((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        metadataRef.current = next;
        setBlocksRaw((prevBlocks) => {
          persist(textContentRef.current, prevBlocks, next);
          return prevBlocks;
        });
        return next;
      });
    },
    [persist],
  );

  const clearAll = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    localStorage.removeItem(lsKeyRef.current);
    setTextContentRaw('');
    textContentRef.current = '';
    setBlocksRaw([]);
    setMetadataRaw({});
    metadataRef.current = {};
    setSaveStatus('idle');
  }, []);

  // Migrate the localStorage key from 'new' to a real entry ID after first DB save
  const migrateKey = useCallback((newId: string) => {
    const oldKey = lsKeyRef.current;
    const newKey = `soouls_entry_v1_${newId}`;
    if (oldKey === newKey) return; // already on the right key
    try {
      const data = localStorage.getItem(oldKey);
      if (data) {
        localStorage.setItem(newKey, data);
      }
      localStorage.removeItem(oldKey);
    } catch {
      /* ignore */
    }
    lsKeyRef.current = newKey;
  }, []);

  return {
    textContent,
    setTextContent,
    blocks,
    setBlocks,
    metadata,
    setMetadata,
    hydrated,
    saveStatus,
    clearAll,
    migrateKey,
  };
}

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

function getDefaultSentenceTile(unit: string, index: number): ComposerLayoutItem {
  const words = unit.split(/\s+/).filter(Boolean).length;
  const width = words > 28 || index === 0 ? 2 : words > 14 ? 2 : 1;
  const height = words > 26 ? 2 : 1;
  return {
    id: `sentence_${index + 1}`,
    kind: 'sentence',
    order: index,
    width,
    height,
  };
}

function getDefaultBlockTile(block: Block, index: number): ComposerLayoutItem {
  if (block.type === 'image') {
    return {
      id: block.id,
      kind: 'block',
      order: index,
      width: block.isSticker || block.isGif ? 1 : 2,
      height: block.isSticker || block.isGif ? 2 : 2,
    };
  }
  if (block.type === 'voice') {
    return { id: block.id, kind: 'block', order: index, width: 2, height: 1 };
  }
  if (block.type === 'doodle') {
    return { id: block.id, kind: 'block', order: index, width: 2, height: 2 };
  }
  if (block.type === 'goal') {
    return { id: block.id, kind: 'block', order: index, width: 2, height: 2 };
  }
  return { id: block.id, kind: 'block', order: index, width: 2, height: 2 };
}

function reconcileComposerLayout(
  textUnits: string[],
  blocks: Block[],
  savedLayout: ComposerLayoutItem[] | undefined,
) {
  const defaults = [
    ...textUnits.map((unit, index) => getDefaultSentenceTile(unit, index)),
    ...blocks.map((block, index) => getDefaultBlockTile(block, textUnits.length + index)),
  ];
  const defaultsById = new Map(defaults.map((item) => [item.id, item]));
  const orderedIds = new Set(defaults.map((item) => item.id));

  const hydrated = (savedLayout ?? [])
    .filter((item) => orderedIds.has(item.id))
    .map((item, order) => {
      const fallback = defaultsById.get(item.id);
      if (!fallback) {
        return null;
      }
      return {
        ...fallback,
        ...item,
        order,
      };
    })
    .filter((item): item is ComposerLayoutItem => item !== null);

  const seen = new Set(hydrated.map((item) => item.id));
  const missing = defaults
    .filter((item) => !seen.has(item.id))
    .map((item, index) => ({
      ...item,
      order: hydrated.length + index,
    }));

  return [...hydrated, ...missing];
}

function getTileSpanClass(item: ComposerLayoutItem) {
  const widthClass = item.width >= 2 ? 'sm:col-span-2' : '';
  const desktopWidthClass = item.width >= 2 ? 'xl:col-span-2' : '';
  const heightClass = item.height >= 2 ? 'min-h-[220px]' : 'min-h-[128px]';
  return [widthClass, desktopWidthClass, heightClass].filter(Boolean).join(' ');
}

function reorderComposerLayout(layout: ComposerLayoutItem[], draggedId: string, targetId: string) {
  if (!draggedId || !targetId || draggedId === targetId) return layout;
  const fromIndex = layout.findIndex((item) => item.id === draggedId);
  const toIndex = layout.findIndex((item) => item.id === targetId);
  if (fromIndex < 0 || toIndex < 0) return layout;
  const next = [...layout];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return layout;
  next.splice(toIndex, 0, moved);
  return next.map((item, index) => ({ ...item, order: index }));
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL PRIMITIVES
// ══════════════════════════════════════════════════════════════════════════════
function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      {children}
    </motion.div>
  );
}
function Modal({
  title,
  icon,
  onClose,
  extra,
  footer,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  extra?: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ scale: 0.95, y: 16 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95, y: 16 }}
      className="bg-[#1C1C1C]/90 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 rounded-[32px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8)] w-full max-w-[460px] flex flex-col relative"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/50 hover:text-white transition-colors backdrop-blur-md"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04] bg-black/10">
        <span className="text-white text-[15px] tracking-wide font-medium flex items-center gap-3">
          {icon}
          {title}
        </span>
        <div className="flex items-center gap-1 pr-8">{extra}</div>
      </div>
      {children}
      <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-white/[0.04] bg-black/10">
        {footer}
      </div>
    </motion.div>
  );
}
const _IconBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
  >
    {children}
  </button>
);
const GhostBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-4 py-2.5 text-[13px] font-medium text-white/50 hover:text-white transition-colors tracking-wide"
  >
    {children}
  </button>
);
const OrangeBtn = ({
  onClick,
  disabled,
  children,
}: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="px-8 py-2.5 bg-[var(--soouls-accent)] hover:opacity-90 disabled:opacity-40 disabled:hover:translate-y-0 text-white text-[13px] rounded-full transition-all duration-300 font-semibold shadow-[0_8px_20px_rgba(var(--soouls-accent-rgb),0.3)] hover:shadow-[0_8px_30px_rgba(var(--soouls-accent-rgb),0.5)] tracking-wide hover:-translate-y-0.5"
  >
    {children}
  </button>
);
const MInput = ({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-white text-[14px] placeholder:text-white/30 outline-none focus:border-[var(--soouls-accent)]/50 focus:bg-black/40 transition-all w-full shadow-inner ${className}`}
  />
);

// ══════════════════════════════════════════════════════════════════════════════
// MODALS
// ══════════════════════════════════════════════════════════════════════════════
function DoodleModal({
  onClose,
  onSave,
  onSaveImage,
  onAppendText,
}: {
  onClose: () => void;
  onSave: (d: string) => void;
  onSaveImage: (u: string, n: string, isSticker?: boolean, isGif?: boolean) => void;
  onAppendText: (t: string) => void;
}) {
  const [tab, setTab] = useState<'stickers' | 'emoji' | 'gif' | 'draw'>('stickers');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, [tab]);

  const fetchStickers = useCallback(
    (offset: number) => {
      return debouncedQuery
        ? gf.search(debouncedQuery, { offset, limit: 12, type: 'stickers' })
        : fetchStickersTrending(offset);
    },
    [debouncedQuery],
  );

  const fetchGifs = useCallback(
    (offset: number) => {
      return debouncedQuery
        ? gf.search(debouncedQuery, { offset, limit: 10, type: 'gifs' })
        : fetchGifsTrending(offset);
    },
    [debouncedQuery],
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<ImageData[]>([]);
  const [color, setColor] = useState('var(--soouls-accent)');
  const [size, _setSize] = useState(4);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const sx = c.width / r.width;
    const sy = c.height / r.height;
    if ('touches' in e && e.touches[0])
      return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy };
    const me = e as React.MouseEvent;
    return { x: (me.clientX - r.left) * sx, y: (me.clientY - r.top) * sy };
  };
  const snap = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    history.current.push(ctx.getImageData(0, 0, c.width, c.height));
    if (history.current.length > 40) history.current.shift();
  };
  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    snap();
    drawing.current = true;
    const p = getPos(e);
    if (!p) return;
    last.current = p;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(p.x, p.y, (tool === 'eraser' ? size * 3 : size) / 2, 0, Math.PI * 2);
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.fillStyle = color;
    ctx.fill();
  };
  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current || !last.current) return;
    const p = getPos(e);
    if (!p) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = tool === 'eraser' ? size * 3 : size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    last.current = p;
  };
  const onUp = () => {
    drawing.current = false;
    last.current = null;
  };
  const undo = () => {
    if (!history.current.length) return;
    const imageData = history.current.pop();
    if (imageData) canvasRef.current?.getContext('2d')?.putImageData(imageData, 0, 0);
  };
  const clearCanvas = () => {
    snap();
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
  };

  return (
    <Overlay>
      <div className="bg-[#1C1C1C]/90 backdrop-blur-3xl rounded-[32px] w-[460px] shadow-[0_24px_80px_rgba(0,0,0,0.8)] flex flex-col border border-white/10 relative overflow-hidden ring-1 ring-white/5">
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/50 hover:text-white transition-colors backdrop-blur-md"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Premium Pill Tabs */}
        <div className="flex p-3 gap-2 border-b border-white/5 bg-black/20 z-10">
          {(
            [
              { id: 'stickers', label: 'Stickers' },
              { id: 'emoji', label: 'Emoji' },
              { id: 'gif', label: 'GIFs' },
              { id: 'draw', label: 'Canvas' },
            ] as const
          ).map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-[16px] text-[13px] font-medium transition-all duration-300 ${tab === t.id ? 'bg-white/10 text-white shadow-lg scale-100 ring-1 ring-white/10' : 'text-white/40 hover:text-white/80 hover:bg-white/5 scale-95'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full relative">
          {(tab === 'stickers' || tab === 'gif') && (
            <div className="absolute top-0 left-0 right-0 p-3 z-10 bg-gradient-to-b from-[#151515] to-transparent">
              <input
                type="text"
                placeholder={`Search ${tab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 text-[14px] text-white placeholder:text-white/30 outline-none focus:border-[var(--soouls-accent)]/60 focus:bg-black/60 transition-all shadow-inner"
              />
            </div>
          )}

          {tab === 'stickers' && (
            <div className="h-[480px] overflow-y-auto px-4 pt-20 pb-4 custom-scrollbar bg-[#151515]">
              <Grid
                width={428}
                columns={3}
                gutter={8}
                fetchGifs={fetchStickers}
                key={`stickers-${debouncedQuery}`}
                noResultsMessage={
                  <div className="text-white/40 text-center py-10">No stickers found</div>
                }
                onGifClick={(gif, e) => {
                  e.preventDefault();
                  onSaveImage(gif.images.downsized.url, gif.title || 'Sticker', true, false);
                  onClose();
                }}
              />
            </div>
          )}

          {tab === 'emoji' && (
            <div className="h-[480px] bg-[#151515]">
              <EmojiPicker
                theme={'dark' as import('emoji-picker-react').Theme}
                width="100%"
                height="100%"
                skinTonesDisabled
                searchDisabled={false}
                onEmojiClick={(emojiData) => {
                  onAppendText(emojiData.emoji);
                  onClose();
                }}
              />
            </div>
          )}

          {tab === 'gif' && (
            <div className="h-[480px] overflow-y-auto px-4 pt-20 pb-4 custom-scrollbar bg-[#151515]">
              <Grid
                width={428}
                columns={2}
                gutter={8}
                fetchGifs={fetchGifs}
                key={`gifs-${debouncedQuery}`}
                noResultsMessage={
                  <div className="text-white/40 text-center py-10">No GIFs found</div>
                }
                onGifClick={(gif, e) => {
                  e.preventDefault();
                  onSaveImage(gif.images.downsized.url, gif.title || 'GIF', false, true);
                  onClose();
                }}
              />
            </div>
          )}

          {tab === 'draw' && (
            <div className="relative w-full h-[440px] bg-[#0A0A0A] bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]">
              {/* Floating Glass Toolbars */}
              <div className="absolute top-4 left-4 flex gap-3 items-center bg-black/40 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/10 shadow-2xl z-10">
                {['var(--soouls-accent)', '#60A5FA', '#34D399', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setColor(c);
                      setTool('pen');
                    }}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${color === c && tool === 'pen' ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-black scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <div className="w-px h-4 bg-white/20 mx-1" />
                <button
                  type="button"
                  onClick={() => setTool('eraser')}
                  className={`p-1.5 rounded-full transition-all ${tool === 'eraser' ? 'bg-white/20 text-white shadow-inner' : 'text-white/40 hover:text-white/90'}`}
                >
                  <Eraser className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute top-4 right-16 flex gap-1 items-center bg-black/40 backdrop-blur-xl px-2.5 py-1.5 rounded-full border border-white/10 shadow-2xl z-10">
                <button
                  type="button"
                  onClick={undo}
                  className="p-2 hover:text-white text-white/50 transition-colors rounded-full hover:bg-white/10"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="p-2 hover:text-red-400 text-white/50 transition-colors rounded-full hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Interaction Canvas */}
              <canvas
                ref={canvasRef}
                width={1000}
                height={800}
                className="absolute inset-0 w-full h-full block touch-none z-0"
                style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
                onMouseDown={onDown}
                onMouseMove={onMove}
                onMouseUp={onUp}
                onMouseLeave={onUp}
                onTouchStart={onDown}
                onTouchMove={onMove}
                onTouchEnd={onUp}
              />

              {/* Glowing Save Button */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 pointer-events-none">
                <button
                  type="button"
                  onClick={() => {
                    onSave(canvasRef.current?.toDataURL('image/webp', 0.8) || '');
                    onClose();
                  }}
                  className="px-10 py-3.5 rounded-full bg-[var(--soouls-accent)] hover:opacity-90 text-white text-[14px] transition-all duration-300 pointer-events-auto shadow-[0_10px_40px_rgba(var(--soouls-accent-rgb),0.4)] hover:shadow-[0_10px_60px_rgba(var(--soouls-accent-rgb),0.6)] font-semibold tracking-wide hover:-translate-y-1"
                >
                  Drop into Entry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

function ImageModal({
  onClose,
  onAdd,
}: { onClose: () => void; onAdd: (d: string, n: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const load = async (f: File) => {
    if (!f.type.startsWith('image/')) return;
    try {
      const compressed = await imageCompression(f, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        initialQuality: 0.82,
        useWebWorker: true,
        fileType: 'image/webp',
      });
      setName(f.name.replace(/\.[^.]+$/u, '.webp'));
      setPreview(await readFileAsDataUrl(compressed));
    } catch (error) {
      console.warn('Image compression failed; using original file.', error);
      setName(f.name);
      setPreview(await readFileAsDataUrl(f));
    }
  };
  return (
    <Overlay>
      <Modal
        title="Add Image"
        icon={<ImageIcon className="w-3.5 h-3.5 text-[var(--soouls-accent)]" />}
        onClose={onClose}
        footer={
          <>
            <GhostBtn onClick={onClose}>Cancel</GhostBtn>
            <OrangeBtn
              disabled={!preview}
              onClick={() => {
                if (preview) {
                  onAdd(preview, name);
                  onClose();
                }
              }}
            >
              Add to entry
            </OrangeBtn>
          </>
        }
      >
        <div className="p-5">
          {!preview ? (
            <button
              type="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter') ref.current?.click();
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                if (e.dataTransfer.files[0]) void load(e.dataTransfer.files[0]);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onClick={() => ref.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-14 w-full flex flex-col items-center gap-3 cursor-pointer transition-colors ${drag ? 'border-[var(--soouls-accent)] bg-[var(--soouls-accent)]/5' : 'border-white/10 hover:border-white/20'}`}
            >
              <ImageIcon className="w-10 h-10 text-slate-500" />
              <p className="text-slate-400 text-sm text-center">
                Drop image here or <span className="text-[var(--soouls-accent)]">browse</span>
              </p>
              <input
                ref={ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) void load(e.target.files[0]);
                }}
              />
            </button>
          ) : (
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={preview}
                alt="preview"
                className="w-full max-h-60 object-contain bg-black/20"
              />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setName('');
                }}
                className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-lg hover:bg-black/80 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      </Modal>
    </Overlay>
  );
}

function GoalModal({
  onClose,
  onAdd,
}: { onClose: () => void; onAdd: (goal: string, label: string) => void }) {
  const [goal, setGoal] = useState('');
  const [label, setLabel] = useState('');
  return (
    <Overlay>
      <Modal
        title="Set Goal & Timer"
        icon={<Clock className="w-3.5 h-3.5 text-[var(--soouls-accent)]" />}
        onClose={onClose}
        footer={
          <>
            <GhostBtn onClick={onClose}>Cancel</GhostBtn>
            <OrangeBtn
              disabled={!goal.trim()}
              onClick={() => {
                onAdd(goal, label);
                onClose();
              }}
            >
              Start timer
            </OrangeBtn>
          </>
        }
      >
        <div className="p-5 flex flex-col gap-3">
          <MInput
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="I will complete..."
          />
          <MInput
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (e.g. Goal art)"
          />
        </div>
      </Modal>
    </Overlay>
  );
}

function TasklistModal({
  onClose,
  onAdd,
}: { onClose: () => void; onAdd: (title: string, tasks: string[]) => void }) {
  const [title, setTitle] = useState('Tasks to be complete today :');
  const [tasks, setTasks] = useState(['']);
  return (
    <Overlay>
      <Modal
        title="Task List"
        icon={<ListTodo className="w-3.5 h-3.5 text-[var(--soouls-accent)]" />}
        onClose={onClose}
        footer={
          <>
            <GhostBtn onClick={onClose}>Cancel</GhostBtn>
            <OrangeBtn
              disabled={tasks.every((t) => !t.trim())}
              onClick={() => {
                onAdd(
                  title,
                  tasks.filter((t) => t.trim()),
                );
                onClose();
              }}
            >
              Add list
            </OrangeBtn>
          </>
        }
      >
        <div className="p-5 flex flex-col gap-3">
          <MInput value={title} onChange={(e) => setTitle(e.target.value)} />
          {tasks.map((t, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: simple tasks list
            <div key={`task-${i}`} className="flex gap-2 items-center">
              <MInput
                value={t}
                onChange={(e) => {
                  const n = [...tasks];
                  n[i] = e.target.value;
                  setTasks(n);
                }}
                placeholder={`Task ${i + 1}`}
                className="flex-1"
              />
              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => setTasks(tasks.filter((_, j) => j !== i))}
                  className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setTasks([...tasks, ''])}
            className="flex items-center gap-1 text-[var(--soouls-accent)] text-xs hover:text-[#ff6b47] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add task
          </button>
        </div>
      </Modal>
    </Overlay>
  );
}

function VoiceModal({
  onClose,
  onAdd,
}: { onClose: () => void; onAdd: (dataUrl: string, duration: number) => void }) {
  const { recording, elapsed, start, stop } = useVoiceRecorder((dataUrl, duration) => {
    onAdd(dataUrl, duration);
    onClose();
  });

  return (
    <Overlay>
      <div className="bg-[#1C1C1C]/90 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 rounded-[32px] w-[360px] py-14 flex flex-col items-center relative shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/50 hover:text-white transition-colors backdrop-blur-md"
        >
          <X className="w-4 h-4" />
        </button>

        <p className="text-white text-[16px] font-medium tracking-wide mb-2">Record Voice Note</p>
        <p className="text-[var(--soouls-accent)] text-[32px] font-mono font-light tracking-tight mb-10 h-10">
          {recording
            ? `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`
            : '00:00'}
        </p>

        <button
          type="button"
          onClick={recording ? undefined : start}
          className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 mb-12 ${recording ? 'bg-[var(--soouls-accent)]/10 ring-2 ring-[var(--soouls-accent)]/50 scale-105' : 'bg-black/40 hover:bg-black/60 shadow-inner ring-1 ring-white/5'}`}
        >
          <Mic
            className={`w-10 h-10 ${recording ? 'text-[var(--soouls-accent)] animate-pulse drop-shadow-[0_0_15px_rgba(212,107,78,0.8)]' : 'text-white/30'}`}
            fill="currentColor"
          />
        </button>

        <div className="flex gap-14">
          <div className="flex flex-col items-center gap-3 group">
            <button
              type="button"
              className="w-14 h-14 rounded-full bg-black/20 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105"
            >
              <Pause className="w-5 h-5 text-white/60 group-hover:text-white" fill="currentColor" />
            </button>
            <span className="text-[11px] text-white/30 font-medium tracking-wide group-hover:text-white/60">
              PAUSE
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 group">
            <button
              type="button"
              onClick={() => {
                if (recording) stop();
                else onClose();
              }}
              className="w-14 h-14 rounded-full bg-black/20 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105"
            >
              <Square
                className="w-4 h-4 text-white/60 group-hover:text-white"
                fill="currentColor"
              />
            </button>
            <span className="text-[11px] text-white/30 font-medium tracking-wide group-hover:text-white/60">
              STOP
            </span>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOCK CARDS  (all inside canvas)
// ══════════════════════════════════════════════════════════════════════════════
function Card({
  children,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  className = '',
}: {
  children: React.ReactNode;
  onRemove: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  className?: string;
}) {
  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart as any}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`relative bg-[#1e1e1e] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3 group cursor-grab active:cursor-grabbing ${className}`}
    >
      {onDragStart && (
        <div className="absolute -left-5 top-2 opacity-0 group-hover:opacity-40 transition-opacity z-10 cursor-grab">
          <GripVertical className="w-4 h-4 text-white" />
        </div>
      )}
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-[var(--soouls-accent)] rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] text-[#4ade80] flex items-center gap-1.5 font-medium tracking-wide">
    {children}
    <span className="flex items-center justify-center w-3 h-3 bg-[#4ade80] rounded-full">
      <Check className="w-2 h-2 text-black" strokeWidth={3.5} />
    </span>
  </span>
);

function ImageCard({
  b,
  onRemove,
  className = '',
  ...dragProps
}: {
  b: Extract<Block, { type: 'image' }>;
  onRemove: () => void;
  className?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}) {
  const isSticker = b.isSticker || b.isGif;

  return (
    <Card className={className} onRemove={onRemove} {...dragProps}>
      <img
        src={isSticker ? b.dataUrl : getOptimizedImageUrl(b.dataUrl, { width: 1200 })}
        alt={b.name}
        className={
          isSticker
            ? 'w-auto max-w-[180px] h-auto object-contain mx-auto drop-shadow-lg hover:scale-105 transition-transform'
            : 'w-full h-auto rounded-[16px] shadow-sm'
        }
      />
      {!isSticker && (
        <div className="flex justify-between items-center w-full px-1">
          <span className="text-[10px] text-white/40 max-w-[120px] truncate">{b.name}</span>
          <Badge>Image added</Badge>
        </div>
      )}
    </Card>
  );
}

function VoiceCard({
  b,
  onRemove,
  className = '',
  ...dragProps
}: {
  b: Extract<Block, { type: 'voice' }>;
  onRemove: () => void;
  className?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  useEffect(() => {
    const a = new Audio(b.dataUrl);
    audioRef.current = a;
    a.addEventListener('ended', () => {
      setPlaying(false);
      setProg(0);
    });
    a.addEventListener('timeupdate', () => setProg((a.currentTime / (a.duration || 1)) * 100));
    return () => a.pause();
  }, [b.dataUrl]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play();
      setPlaying(true);
    }
  };
  const bars = Array.from({ length: 38 }, (_, i) =>
    Math.min(100, 18 + Math.abs(Math.sin(i * 0.8 + 1) * 55 + Math.cos(i * 0.35) * 25)),
  );

  return (
    <Card className={className} onRemove={onRemove} {...dragProps}>
      <div className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-[16px] border border-white/5">
        <button
          type="button"
          onClick={toggle}
          className="w-8 h-8 rounded-full bg-[var(--soouls-accent)] flex items-center justify-center flex-shrink-0 hover:bg-[#ff6b47] transition-colors shadow-lg"
        >
          {playing ? (
            <Pause className="w-4 h-4 text-white" fill="white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
          )}
        </button>
        <div className="flex items-end gap-[1.5px] flex-1 h-8">
          {bars.map((h, i) => {
            return (
              <div
                key={`bar-${i}`}
                className="flex-1 rounded-full transition-colors"
                style={{
                  height: `${h}%`,
                  backgroundColor:
                    i / bars.length <= prog / 100
                      ? 'var(--soouls-accent)'
                      : 'rgba(255,255,255,0.1)',
                }}
              />
            );
          })}
        </div>
        <span className="text-slate-400 text-[11px] font-mono">{fmt(b.duration)}</span>
      </div>
      <div className="flex items-center justify-end px-1 mt-1">
        <Badge>Voice note added</Badge>
      </div>
    </Card>
  );
}

function DoodleCard({
  b,
  onRemove,
  className = '',
  ...dragProps
}: {
  b: Extract<Block, { type: 'doodle' }>;
  onRemove: () => void;
  className?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}) {
  return (
    <Card className={className} onRemove={onRemove} {...dragProps}>
      <img
        src={getOptimizedImageUrl(b.dataUrl, { width: 1200 })}
        alt="doodle"
        className="w-full h-auto max-h-48 object-contain drop-shadow-2xl"
      />
      <div className="flex justify-center w-full px-1">
        <Badge>Doodle added</Badge>
      </div>
    </Card>
  );
}

function GoalCard({
  b,
  onUpdate,
  onRemove,
  className = '',
  ...dragProps
}: {
  b: Extract<Block, { type: 'goal' }>;
  onUpdate: (x: Block) => void;
  onRemove: () => void;
  className?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (b.running) {
      intervalRef.current = setInterval(() => onUpdate({ ...b, seconds: b.seconds + 1 }), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [b.running, b.seconds]);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}: ${String(m).padStart(2, '0')}: ${String(sec).padStart(2, '0')}`;
  };
  const now = new Date();
  const ampm = now.getHours() >= 12 ? 'pm' : 'am';

  return (
    <Card className={className} onRemove={onRemove} {...dragProps}>
      <div className="flex flex-col gap-3 group/goal">
        <div className="inline-flex items-center border border-white/60 rounded-full px-5 py-2 text-white/90 text-[13px] font-light w-max max-w-full">
          <span className="truncate">{b.goal}</span>
        </div>

        <div className="flex items-baseline gap-2 relative">
          <span className="text-[var(--soouls-accent)] text-[32px] font-light tracking-tight tabular-nums">
            {fmt(b.seconds)}
          </span>
          <span className="text-[var(--soouls-accent)]/60 text-sm">{ampm}</span>

          {/* Floating controls that appear on hover */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/goal:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onUpdate({ ...b, running: !b.running })}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/60 transition-colors"
            >
              {b.running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ ...b, seconds: 0, running: false })}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/60 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <Badge>Goal set</Badge>
      </div>
    </Card>
  );
}

function TasklistCard({
  b,
  onUpdate,
  onRemove,
  className = '',
  ...dragProps
}: {
  b: Extract<Block, { type: 'tasklist' }>;
  onUpdate: (x: Block) => void;
  onRemove: () => void;
  className?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}) {
  const toggle = (tid: string) =>
    onUpdate({ ...b, tasks: b.tasks.map((t) => (t.id === tid ? { ...t, done: !t.done } : t)) });
  return (
    <Card className={className} onRemove={onRemove} {...dragProps}>
      <div className="flex flex-col gap-3">
        <p className="text-white/80 text-[14px] font-light tracking-wide">{b.title}</p>
        <div className="flex flex-col gap-2.5">
          {b.tasks.map((task) => (
            <button
              type="button"
              key={task.id}
              onClick={() => toggle(task.id)}
              className="flex items-center gap-3 text-left group/t w-max"
            >
              <div
                className={`w-[14px] h-[14px] rounded-[3px] flex items-center justify-center flex-shrink-0 border transition-colors ${task.done ? 'bg-transparent border-[var(--soouls-accent)]' : 'border-[var(--soouls-accent)] bg-transparent'}`}
              >
                {task.done && (
                  <Check className="w-3 h-3 text-[var(--soouls-accent)]" strokeWidth={4} />
                )}
              </div>
              <span
                className={`text-[13px] font-light transition-colors ${task.done ? 'text-white/30 line-through' : 'text-white/90'}`}
              >
                {task.text}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-1">
          <Badge>Tasks added</Badge>
        </div>
      </div>
    </Card>
  );
}

// ─── Toolbar button ───────────────────────────────────────────────────────────
// ─── Voice recorder hook ──────────────────────────────────────────────────────
function useVoiceRecorder(onDone: (dataUrl: string, duration: number) => void) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const _streamRef = useRef<MediaStream | null>(null);
  const t0 = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (mrRef.current && mrRef.current.state !== 'inactive') {
        mrRef.current.stop();
      }
      if (_streamRef.current) {
        for (const track of _streamRef.current.getTracks()) {
          track.stop();
        }
        _streamRef.current = null;
      }
    };
  }, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mrRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const r = new FileReader();
        r.onload = (e) =>
          onDone(e.target?.result as string, Math.round((Date.now() - t0.current) / 1000));
        r.readAsDataURL(blob);
        for (const t of stream.getTracks()) t.stop();
      };
      mr.start();
      t0.current = Date.now();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      alert('Mic access denied');
    }
  };

  const stop = useCallback(() => {
    if (mrRef.current && mrRef.current.state !== 'inactive') {
      mrRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    setElapsed(0);
  }, []);

  return { recording, elapsed, start, stop };
}

import { Suspense } from 'react';

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE (wrapped in Suspense for useSearchParams)
// ══════════════════════════════════════════════════════════════════════════════
export default function NewEntryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <NewEntryContent />
    </Suspense>
  );
}

function NewEntryContent() {
  const { user } = useUser();
  const router = useRouter();
  const { setIsOpen } = useSidebar();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  // ── Persisted state (text + blocks survive refresh) ────────────────────────
  const {
    textContent,
    setTextContent,
    blocks,
    setBlocks,
    metadata,
    setMetadata,
    hydrated,
    saveStatus,
    migrateKey,
  } = usePersistedEntry(initialId);
  const [modal, setModal] = useState<null | 'image' | 'doodle' | 'goal' | 'tasklist' | 'voice'>(
    null,
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  // ── tRPC auto-save (syncs to DB in addition to localStorage) ──────────────
  const utils = trpc.useContext();
  const upsertSyncMutation = trpc.private.entries.upsertSync.useMutation();
  const upsertSyncRef = useRef(upsertSyncMutation.mutateAsync);
  useEffect(() => {
    upsertSyncRef.current = upsertSyncMutation.mutateAsync;
  });

  const [entryId, setEntryId] = useState<string | null>(initialId);
  const entryIdRef = useRef<string | null>(initialId);
  const metadataRef = useRef<EntryMetadata>(metadata);
  const isSaving = useRef(false);
  const pendingCloudSave = useRef(false);
  const cloudRetry = useRef<NodeJS.Timeout | null>(null);
  const cloudSaveWaiters = useRef<Array<() => void>>([]);
  const dbDebounce = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef<string | undefined>(undefined);
  const latestDraftRef = useRef({ text: textContent, blocks });
  useEffect(() => {
    entryIdRef.current = entryId;
  }, [entryId]);
  useEffect(() => {
    metadataRef.current = metadata;
  }, [metadata]);
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);
  useEffect(() => {
    latestDraftRef.current = { text: textContent, blocks };
  }, [textContent, blocks]);

  const { data: existingEntry } = trpc.private.entries.getOne.useQuery(
    { id: initialId || '' },
    { enabled: !!initialId },
  );
  useEffect(() => {
    if (existingEntry) {
      try {
        const decoded = decodeEntryContent(existingEntry.content);
        const parsed = JSON.parse(decoded);
        if (parsed.textContent !== undefined) {
          // Senior note: Using functional check to avoid stale closures in initial load
          setTextContent((prev) => (!prev ? parsed.textContent || '' : prev));
          setBlocks((prev) => (prev.length === 0 ? parsed.blocks || [] : prev));
          if (parsed.metadata) {
            setMetadata((prev) =>
              Object.keys(prev).length === 0 ? (parsed.metadata as EntryMetadata) : prev,
            );
          }
        } else {
          setTextContent((prev) => (!prev ? existingEntry.content || '' : prev));
        }
      } catch {
        setTextContent((prev) => (!prev ? existingEntry.content || '' : prev));
      }
      setEntryId(existingEntry.id);
    }
  }, [existingEntry, setTextContent, setBlocks]);

  const getUploadUrlMutation = trpc.private.entries.getUploadUrl.useMutation();
  const _updateMediaUrlMutation = trpc.private.entries.updateMediaUrl.useMutation();

  const resolveCloudSaveWaiters = useCallback(() => {
    const waiters = cloudSaveWaiters.current.splice(0);
    for (const resolve of waiters) resolve();
  }, []);

  const waitForCloudSave = useCallback(async () => {
    if (!isSaving.current && !pendingCloudSave.current) return;
    await new Promise<void>((resolve) => {
      cloudSaveWaiters.current.push(resolve);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (cloudRetry.current) clearTimeout(cloudRetry.current);
      resolveCloudSaveWaiters();
    };
  }, [resolveCloudSaveWaiters]);

  const performDbSave = useRef(async (text: string, blks: Block[], id: string | null) => {
    if (!userIdRef.current) return;
    if (isSaving.current) {
      pendingCloudSave.current = true;
      setSyncStatus('syncing');
      return;
    }

    if (cloudRetry.current) {
      clearTimeout(cloudRetry.current);
      cloudRetry.current = null;
    }

    isSaving.current = true;
    setSyncStatus('syncing');
    let shouldRunPendingSave = false;
    try {
      let targetEntryId = id;
      if (!targetEntryId) {
        const initialPayload = JSON.stringify({
          textContent: text,
          blocks: blks,
          metadata: {
            ...metadataRef.current,
            sentenceBentoLayout: buildSentenceBentoLayout(text),
          },
        });
        const entry = await upsertSyncRef.current({
          content: initialPayload,
          type: 'entry',
          finalize: false,
        });
        targetEntryId = entry.id;
        setEntryId(entry.id);
        entryIdRef.current = entry.id;
        migrateKey(entry.id);
        window.history.replaceState(null, '', `/home/new-entry?id=${entry.id}`);
      }

      // 1. Handle media uploads if needed. A real DB entry must exist first so
      // the backend can verify ownership before issuing R2 upload URLs.
      const updatedBlocks = [...blks];
      let blocksChanged = false;

      for (let i = 0; i < updatedBlocks.length; i++) {
        const block = updatedBlocks[i];
        if (!block || !['image', 'voice', 'doodle'].includes(block.type)) continue;

        // At this point, we know it's one of the 3 media block types which all have a dataUrl property.
        const mediaBlock = block as { type: 'image' | 'voice' | 'doodle'; dataUrl: string };
        if (!mediaBlock.dataUrl || !mediaBlock.dataUrl.startsWith('data:')) continue;

        const blockDataUrl = mediaBlock.dataUrl;
        try {
          const mimePart = blockDataUrl.split(';')[0];
          const contentType =
            mimePart?.split(':')[1] ?? (block.type === 'voice' ? 'audio/webm' : 'image/webp');
          const { uploadUrl, publicUrl, storageKey } = await getUploadUrlMutation.mutateAsync({
            entryId: targetEntryId,
            contentType,
          });

          const response = await fetch(blockDataUrl);
          const blob = await response.blob();
          const checksum = await sha256Hex(blob);

          await fetch(uploadUrl, {
            method: 'PUT',
            body: blob,
            headers: { 'Content-Type': blob.type },
          });

          // Update the specific block type carefully while keeping other props (duration, name)
          updatedBlocks[i] = {
            ...block,
            dataUrl: publicUrl,
            storageKey,
            contentType: blob.type || contentType,
            byteSize: blob.size,
            sha256: checksum,
            uploadedAt: new Date().toISOString(),
          } as Block;
          blocksChanged = true;
        } catch (uploadErr) {
          console.error(`Failed to upload ${block.type}:`, uploadErr);
        }
      }

      if (blocksChanged) {
        setBlocks((_prev) => updatedBlocks);
      }

      const payloadString = JSON.stringify({
        textContent: text,
        blocks: updatedBlocks,
        metadata: {
          ...metadataRef.current,
          sentenceBentoLayout: buildSentenceBentoLayout(text),
        },
      });
      await upsertSyncRef.current({
        id: targetEntryId,
        content: payloadString,
        type: 'entry',
        finalize: false,
      });

      // Invalidate multiple queries to ensure consistency
      void utils.private.home.getClusters.invalidate();
      void utils.private.entries.getAll.invalidate();
      void utils.private.entries.getGalaxy.invalidate();

      setSyncStatus('synced');
    } catch (err) {
      console.error('DB save failed:', err);
      setSyncStatus('error');
      if (cloudRetry.current) clearTimeout(cloudRetry.current);
      cloudRetry.current = setTimeout(() => {
        const latest = latestDraftRef.current;
        void performDbSave.current(latest.text, latest.blocks, entryIdRef.current);
      }, 5000);
    } finally {
      isSaving.current = false;
      if (pendingCloudSave.current) {
        pendingCloudSave.current = false;
        shouldRunPendingSave = true;
      } else {
        resolveCloudSaveWaiters();
      }
    }

    if (shouldRunPendingSave) {
      const latest = latestDraftRef.current;
      await performDbSave.current(latest.text, latest.blocks, entryIdRef.current);
    }
  });

  // DB debounce — fires 2s after last keystroke or block change
  useEffect(() => {
    if (!textContent.trim() && blocks.length === 0) return;
    setSyncStatus('idle');
    if (dbDebounce.current) clearTimeout(dbDebounce.current);
    dbDebounce.current = setTimeout(() => {
      // Accessing latest state from refs or capturing current values in closure
      // Senior approach: capture values to ensure the timeout saves what was present AT THE TIME of the call
      // or use refs to save the ABSOLUTE LATEST. Here we use the latest since it's a debounced "final" save.
      performDbSave.current(textContent, blocks, entryIdRef.current);
    }, 2000);
    return () => {
      if (dbDebounce.current) clearTimeout(dbDebounce.current);
    };
  }, [textContent, blocks]);

  const handleHome = async () => {
    if (dbDebounce.current) clearTimeout(dbDebounce.current);
    if (textContent.trim() || blocks.length > 0) {
      await performDbSave.current(textContent, blocks, entryIdRef.current);
      await waitForCloudSave();
    }
    router.push('/home');
  };

  // ── Block helpers (setBlocks auto-persists to localStorage) ───────────────
  const addBlock = (b: Block) => setBlocks((prev) => [...prev, b]);
  const removeBlock = (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id));
  const updateBlock = (upd: Block) =>
    setBlocks((prev) => prev.map((b) => (b.id === upd.id ? upd : b)));
  const _moveBlock = (fromIdx: number, toIdx: number) => {
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      if (moved) next.splice(toIdx, 0, moved);
      return next;
    });
  };
  const textUnits = useMemo(() => {
    const trimmed = textContent.trim();
    return trimmed ? [trimmed] : [];
  }, [textContent]);
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [newThoughtDraft, setNewThoughtDraft] = useState('');
  const composerLayout = useMemo(
    () => reconcileComposerLayout(textUnits, blocks, metadata.composerLayout),
    [blocks, metadata.composerLayout, textUnits],
  );
  const blockMap = useMemo(() => new Map(blocks.map((block) => [block.id, block])), [blocks]);

  const updateTextUnit = useCallback(
    (index: number, nextValue: string) => {
      const nextUnits = [...textUnits];
      if (index < 0 || index >= nextUnits.length) return;
      const trimmed = nextValue.trim();
      if (!trimmed) {
        nextUnits.splice(index, 1);
      } else {
        nextUnits[index] = trimmed;
      }
      setTextContent(nextUnits.join('\n'));
    },
    [setTextContent, textUnits],
  );

  const commitDraftThoughts = useCallback(() => {
    const incoming = newThoughtDraft.trim();
    if (!incoming) return;
    setTextContent((current) => {
      const trimmed = current.trim();
      return trimmed ? `${trimmed}\n\n${incoming}` : incoming;
    });
    setNewThoughtDraft('');
  }, [newThoughtDraft, setTextContent]);

  useEffect(() => {
    const current = metadata.composerLayout ?? [];
    const matches =
      current.length === composerLayout.length &&
      current.every((item, index) => {
        const next = composerLayout[index];
        return (
          next &&
          item.id === next.id &&
          item.kind === next.kind &&
          item.order === next.order &&
          item.width === next.width &&
          item.height === next.height
        );
      });
    if (!matches) {
      setMetadata((prev) => ({ ...prev, composerLayout }));
    }
  }, [composerLayout, metadata.composerLayout, setMetadata]);

  // Don't render blocks until localStorage is hydrated (avoids flash)
  if (!hydrated) return <div className="soouls-page" />;

  return (
    <div className="soouls-page flex flex-col relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute top-12 left-0 right-0 flex justify-center pointer-events-none opacity-[0.7] select-none z-0 overflow-hidden whitespace-nowrap">
        <span
          className="soouls-watermark text-[18vw] leading-none"
          style={{
            WebkitTextStroke: '1px rgba(255,255,255,0.7)',
          }}
        >
          Soouls
        </span>
      </div>

      {/* Header */}
      <header className="w-full max-w-[1600px] mx-auto px-5 md:px-12 py-6 md:py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center text-[15px] font-light tracking-normal sm:text-[22px]">
          <button
            type="button"
            onClick={handleHome}
            className="text-white/40 hover:text-white transition-colors"
          >
            Home
          </button>
          <span className="text-[var(--soouls-accent)]">/New Entry</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status — local draft persistence + encrypted DB sync */}
          <div className="min-w-[220px] flex justify-end">
            <AnimatePresence mode="wait">
              {syncStatus === 'syncing' ? (
                <motion.div
                  key="syncing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-white/40 text-xs"
                >
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Encrypting and syncing...
                </motion.div>
              ) : syncStatus === 'synced' ? (
                <motion.div
                  key="synced"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-emerald-400 text-xs bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
                >
                  <Check className="w-3 h-3" />
                  Encrypted and synced
                </motion.div>
              ) : syncStatus === 'error' ? (
                <motion.div
                  key="sync-error"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-amber-300 text-xs bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20"
                >
                  <Clock className="w-3 h-3" />
                  Draft stored locally, retrying cloud save
                </motion.div>
              ) : saveStatus === 'saving' ? (
                <motion.div
                  key="local-saving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-white/40 text-xs"
                >
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving draft...
                </motion.div>
              ) : saveStatus === 'saved' ? (
                <motion.div
                  key="local-saved"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-[var(--soouls-accent)] text-xs bg-[rgba(var(--soouls-accent-rgb),0.1)] px-3 py-1 rounded-full border border-[rgba(var(--soouls-accent-rgb),0.2)]"
                >
                  <Check className="w-3 h-3" />
                  Draft stored on this device
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 rounded-full border-2 border-white/10 hover:border-white/30 transition-all cursor-pointer overflow-hidden"
          >
            {user?.imageUrl && (
              <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            )}
          </button>
        </div>
      </header>

      {/* ── THE CANVAS PANEL ─────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-2 md:px-12 relative z-10 flex flex-col mt-24 pb-0 items-stretch h-full">
        <div className="soouls-panel flex-1 rounded-t-[24px] md:rounded-t-[32px] flex flex-col overflow-hidden relative">
          {/* Scrollable writing + blocks - everything lives here */}
          <div className="flex-1 overflow-y-auto pt-6 px-4 pb-40 flex flex-col gap-5 md:px-10">
            {composerLayout.length === 0 && blocks.length === 0 ? (
              <div className="grid w-full auto-rows-[minmax(160px,auto)] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <div className="soouls-card sm:col-span-2 xl:col-span-4 min-h-[320px] rounded-[32px] p-7 shadow-[0_26px_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
                  <textarea
                    value={newThoughtDraft}
                    onChange={(e) => setNewThoughtDraft(e.target.value)}
                    onBlur={commitDraftThoughts}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        commitDraftThoughts();
                      }
                    }}
                    placeholder="Drop new entry..."
                    className="w-full bg-transparent border-none outline-none resize-none text-[28px] text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-0 focus:border-transparent focus:ring-offset-0 leading-relaxed font-light shadow-none"
                    style={{ minHeight: 260, boxShadow: 'none' }}
                  />
                </div>
              </div>
            ) : null}

            {(composerLayout.length > 0 || blocks.length > 0 || textUnits.length > 0) && (
              <div className="relative">
                <div className="grid w-full auto-rows-[minmax(118px,auto)] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <AnimatePresence initial={false}>
                    {composerLayout.map((item, _index) => {
                      const dragHandlers = {
                        onDragStart: (event: React.DragEvent) => {
                          setDraggedTileId(item.id);
                          setDropTargetId(item.id);
                          event.dataTransfer.effectAllowed = 'move';
                        },
                        onDragOver: (event: React.DragEvent) => {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = 'move';
                          if (dropTargetId !== item.id) {
                            setDropTargetId(item.id);
                          }
                        },
                        onDrop: (event: React.DragEvent) => {
                          event.preventDefault();
                          if (!draggedTileId || draggedTileId === item.id) return;
                          setMetadata((prev) => ({
                            ...prev,
                            composerLayout: reorderComposerLayout(
                              reconcileComposerLayout(
                                textUnits,
                                blocks,
                                prev.composerLayout ?? composerLayout,
                              ),
                              draggedTileId,
                              item.id,
                            ),
                          }));
                          setDraggedTileId(null);
                          setDropTargetId(null);
                        },
                        onDragEnd: () => {
                          setDraggedTileId(null);
                          setDropTargetId(null);
                        },
                      };
                      const spanClass = getTileSpanClass(item);
                      const isDropTarget = dropTargetId === item.id && draggedTileId !== item.id;

                      if (item.kind === 'sentence') {
                        const sentenceIndex = Number(item.id.replace('sentence_', '')) - 1;
                        const unit = textUnits[sentenceIndex];
                        if (!unit) return null;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            draggable
                            {...dragHandlers}
                            className={`group/thought relative flex break-words rounded-[28px] border bg-[#232323]/94 p-6 text-left text-[17px] leading-relaxed text-white/82 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-2xl transition ${spanClass} ${
                              isDropTarget
                                ? 'border-white/[0.08]'
                                : 'border-white/[0.04] hover:border-white/[0.1]'
                            }`}
                          >
                            <span className="absolute right-4 top-4 opacity-0 transition-opacity group-hover/thought:opacity-40">
                              <GripVertical className="h-4 w-4 text-white/70" />
                            </span>
                            <span className="flex h-full flex-col justify-start gap-4">
                              <textarea
                                value={unit}
                                onChange={(event) =>
                                  updateTextUnit(sentenceIndex, event.target.value)
                                }
                                onBlur={(event) =>
                                  updateTextUnit(sentenceIndex, event.target.value)
                                }
                                className="min-h-[72px] w-full resize-none bg-transparent text-[17px] leading-relaxed text-white/84 outline-none ring-0 focus:outline-none focus:ring-0 placeholder:text-white/30"
                              />
                            </span>
                          </button>
                        );
                      }

                      const block = blockMap.get(item.id);
                      if (!block) return null;
                      const blockClassName = `${spanClass} ${
                        isDropTarget ? 'border-white/[0.08]' : ''
                      }`;

                      return (
                        <motion.div key={item.id} layout className={spanClass}>
                          {block.type === 'image' && (
                            <ImageCard
                              b={block}
                              className={blockClassName}
                              onRemove={() => removeBlock(block.id)}
                              {...dragHandlers}
                            />
                          )}
                          {block.type === 'voice' && (
                            <VoiceCard
                              b={block}
                              className={blockClassName}
                              onRemove={() => removeBlock(block.id)}
                              {...dragHandlers}
                            />
                          )}
                          {block.type === 'doodle' && (
                            <DoodleCard
                              b={block}
                              className={blockClassName}
                              onRemove={() => removeBlock(block.id)}
                              {...dragHandlers}
                            />
                          )}
                          {block.type === 'goal' && (
                            <GoalCard
                              b={block}
                              className={blockClassName}
                              onUpdate={updateBlock}
                              onRemove={() => removeBlock(block.id)}
                              {...dragHandlers}
                            />
                          )}
                          {block.type === 'tasklist' && (
                            <TasklistCard
                              b={block}
                              className={blockClassName}
                              onUpdate={updateBlock}
                              onRemove={() => removeBlock(block.id)}
                              {...dragHandlers}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  <div className="sm:col-span-2 xl:col-span-2 min-h-[128px] rounded-[28px] border border-white/[0.04] bg-[#232323]/94 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
                    <textarea
                      value={newThoughtDraft}
                      onChange={(event) => setNewThoughtDraft(event.target.value)}
                      onBlur={commitDraftThoughts}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          commitDraftThoughts();
                        }
                      }}
                      placeholder="Add more"
                      className="min-h-[72px] w-full resize-none bg-transparent text-center text-[18px] leading-relaxed text-white/76 outline-none ring-0 focus:outline-none focus:ring-0 placeholder:text-white/38"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Floating Horizontal Toolbar fixed to the bottom right of the main panel */}
          <div className="absolute bottom-5 left-1/2 z-50 flex w-[calc(100%-24px)] -translate-x-1/2 flex-col items-center gap-3 md:bottom-8 md:left-auto md:right-8 md:w-auto md:translate-x-0 md:items-start">
            {/* Tooltip */}
            <div className="relative rounded-full border border-white/5 bg-[#1C1C1C] px-5 py-2.5 text-[12px] font-light text-white/60 shadow-2xl md:ml-8 md:text-[14px]">
              Add if it helps you remember
              <div className="absolute -bottom-1.5 right-[20%] w-3 h-3 bg-[#1C1C1C] border-b border-r border-white/5 rotate-45 shadow-sm" />
            </div>

            {/* Toolbar Buttons */}
            <div className="flex max-w-full items-center overflow-x-auto rounded-full border border-white/20 bg-[#1C1C1C]/90 shadow-2xl backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setModal('image')}
                className={`flex items-center gap-2.5 px-6 py-4 hover:bg-white/5 border-r border-white/10 transition-colors group ${blocks.some((b) => b.type === 'image' && !b.isSticker && !b.isGif) ? 'text-[var(--soouls-accent)]' : 'text-white/80 hover:text-[var(--soouls-accent)]'}`}
              >
                <ImageIcon className="w-5 h-5" />
                <span className="text-[15px] font-light">Add image</span>
                {blocks.filter((b) => b.type === 'image' && !b.isSticker && !b.isGif).length >
                  0 && (
                  <span className="bg-[var(--soouls-accent)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center ml-1">
                    {blocks.filter((b) => b.type === 'image' && !b.isSticker && !b.isGif).length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setModal('voice')}
                className={`flex items-center gap-2.5 px-6 py-4 hover:bg-white/5 border-r border-white/10 transition-colors group ${blocks.some((b) => b.type === 'voice') ? 'text-[#60A5FA]' : 'text-white/80 hover:text-[#60A5FA]'}`}
              >
                <Mic className="w-5 h-5" />
                <span className="text-[15px] font-light">Voice note</span>
                {blocks.filter((b) => b.type === 'voice').length > 0 && (
                  <span className="bg-[var(--soouls-accent)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center ml-1">
                    {blocks.filter((b) => b.type === 'voice').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setModal('doodle')}
                className={`flex items-center gap-2.5 px-6 py-4 hover:bg-white/5 border-r border-white/10 transition-colors group ${blocks.some((b) => b.type === 'doodle' || (b.type === 'image' && (b.isSticker || b.isGif))) ? 'text-[#A78BFA]' : 'text-white/80 hover:text-[#A78BFA]'}`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-5 h-5"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <path d="M14 2v6h6M10 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  <path d="m8 15 4 4 6-6" />
                </svg>
                <span className="text-[15px] font-light">Doodle</span>
                {blocks.filter(
                  (b) => b.type === 'doodle' || (b.type === 'image' && (b.isSticker || b.isGif)),
                ).length > 0 && (
                  <span className="bg-[#A78BFA] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center ml-1">
                    {
                      blocks.filter(
                        (b) =>
                          b.type === 'doodle' || (b.type === 'image' && (b.isSticker || b.isGif)),
                      ).length
                    }
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setModal('tasklist')}
                className={`flex items-center gap-2.5 px-6 py-4 hover:bg-white/5 border-r border-white/10 transition-colors group ${blocks.some((b) => b.type === 'tasklist') ? 'text-[#F59E0B]' : 'text-white/80 hover:text-[#F59E0B]'}`}
              >
                <ListTodo className="w-5 h-5" />
                <span className="text-[15px] font-light">Tasklist</span>
              </button>

              <button
                type="button"
                onClick={() => setModal('goal')}
                className={`flex items-center gap-2.5 px-6 py-4 hover:bg-white/5 transition-colors group ${blocks.some((b) => b.type === 'goal') ? 'text-[#34D399]' : 'text-white/80 hover:text-[#34D399]'}`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-5 h-5"
                >
                  <path d="M5 22h14" />
                  <path d="M5 2h14" />
                  <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                  <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                </svg>
                <span className="text-[15px] font-light">Set time</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'image' && (
          <ImageModal
            onClose={() => setModal(null)}
            onAdd={(d, n) => addBlock({ id: uid(), type: 'image', dataUrl: d, name: n })}
          />
        )}
        {modal === 'doodle' && (
          <DoodleModal
            onClose={() => setModal(null)}
            onSave={(d) => addBlock({ id: uid(), type: 'doodle', dataUrl: d })}
            onSaveImage={(d, n, isS, isG) =>
              addBlock({
                id: uid(),
                type: 'image',
                dataUrl: d,
                name: n,
                isSticker: isS,
                isGif: isG,
              })
            }
            onAppendText={(t) => setTextContent((prev) => prev + t)}
          />
        )}
        {modal === 'goal' && (
          <GoalModal
            onClose={() => setModal(null)}
            onAdd={(goal, label) =>
              addBlock({ id: uid(), type: 'goal', goal, label, seconds: 0, running: true })
            }
          />
        )}
        {modal === 'tasklist' && (
          <TasklistModal
            onClose={() => setModal(null)}
            onAdd={(title, tasks) =>
              addBlock({
                id: uid(),
                type: 'tasklist',
                title,
                tasks: tasks.map((t) => ({ id: uid(), text: t, done: false })),
              })
            }
          />
        )}
        {modal === 'voice' && (
          <VoiceModal
            onClose={() => setModal(null)}
            onAdd={(u, d) => addBlock({ id: uid(), type: 'voice', dataUrl: u, duration: d })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
