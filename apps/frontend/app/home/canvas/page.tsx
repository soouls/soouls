'use client';

import { useUser } from '@clerk/nextjs';
import { AnimatePresence, type PanInfo, motion } from 'framer-motion';
import { Search, Plus, MousePointer2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { trpc } from '../../../src/utils/trpc';

type FolderItem = {
  id: string;
  title: string;
  entryCount: number;
  updatedAtLabel: string;
};

type DroppedItem = FolderItem & {
  instanceId: number;
  x: number;
  y: number;
};

const FolderIcon = ({ className, count = '0' }: { className?: string; count?: string }) => (
  <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M10 25C10 22.2386 12.2386 20 15 20H38.5C39.6935 20 40.8443 20.4261 41.745 21.2014L50.255 28.5486C51.1557 29.3239 52.3065 29.75 53.5 29.75H85C87.7614 29.75 90 31.9886 90 34.75V70C90 72.7614 87.7614 75 85 75H15C12.2386 75 10 72.7614 10 70V25Z"
      fill="#3B2C28"
      stroke="rgba(255,255,255,0.1)"
      strokeWidth="1.5"
    />
    <rect
      x="18"
      y="55"
      width="22"
      height="10"
      rx="5"
      fill="#D46B4E"
    />
    <text
      x="36"
      y="60"
      fill="white"
      fontSize="5"
      fontWeight="700"
      textAnchor="middle"
      className="font-urbanist tracking-tighter"
    >
      {count} ENTRIES
    </text>
  </svg>
);

export default function CanvasPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  const { data } = trpc.private.home.getClusters.useQuery(undefined);
  const trpcContext = trpc.useContext();
  const createFolder = trpc.private.home.createFolder.useMutation({
    onSuccess: async () => {
      await trpcContext.private.home.getClusters.invalidate();
    },
  });
  const deleteFolder = trpc.private.home.deleteFolder.useMutation({
    onSuccess: async () => {
      await trpcContext.private.home.getClusters.invalidate();
    },
  });
  const [query, setQuery] = useState('');
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const folders = useMemo(() => {
    const clusterFolders: FolderItem[] = (data?.items ?? []).map(cluster => ({
      id: cluster.id,
      title: cluster.name,
      entryCount: cluster.entryCount,
      updatedAtLabel: cluster.updatedAtLabel
    }));

    const manualFolders: FolderItem[] = (data?.folders ?? []).map(folder => ({
      id: folder.id,
      title: folder.title,
      entryCount: folder.entryCount,
      updatedAtLabel: folder.updatedAtLabel
    }));

    return [...clusterFolders, ...manualFolders].filter((folder) =>
      folder.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [data?.items, data?.folders, query]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    folder: FolderItem,
  ) => {
    const dropZone = dropZoneRef.current?.getBoundingClientRect();
    if (!dropZone) return;

    const { x, y } = info.point;
    if (x >= dropZone.left && x <= dropZone.right && y >= dropZone.top && y <= dropZone.bottom) {
      setDroppedItems((prev) => [
        ...prev,
        {
          ...folder,
          instanceId: Date.now(),
          x: x - dropZone.left - 60,
          y: y - dropZone.top - 50,
        },
      ]);
    }

    setIsDraggingOver(false);
  };

  return (
    <div className="min-h-screen bg-[var(--soouls-bg)] text-[var(--soouls-text)] flex flex-col relative overflow-hidden font-urbanist select-none">
      {/* Background Image */}
      <div className="pointer-events-none absolute inset-0 select-none z-0" aria-hidden="true">
        <Image
          src="/images/tree-bg.png"
          alt=""
          fill
          style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.1 }}
          priority={false}
        />
      </div>

      {/* Background Watermark */}
      <div className="absolute top-12 left-0 right-0 flex justify-center pointer-events-none opacity-[0.4] select-none z-0 overflow-hidden whitespace-nowrap">
        <span
          className="text-[18vw] font-urbanist font-light leading-none text-transparent tracking-widest"
          style={{ WebkitTextStroke: '1px var(--soouls-text-faint)' }}
        >
          Soouls
        </span>
      </div>

      <header className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center text-[20px] font-light tracking-wide">
          <button
            type="button"
            onClick={() => router.push('/home')}
            className="text-[var(--soouls-text-faint)] hover:text-[var(--soouls-text)] transition-colors"
          >
            Home
          </button>
          <span className="text-[#D46B4E] mx-1 opacity-80">/</span>
          <span className="text-[#D46B4E] font-medium">Canvas</span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 rounded-full border-2 border-white/10 hover:border-white/30 transition-all cursor-pointer overflow-hidden shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        >
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          )}
        </button>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 flex flex-col mt-12 pb-0 items-stretch h-full">
        <div className="flex-1 rounded-t-[32px] bg-[#0F0F0F]/60 backdrop-blur-[48px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col relative border-t border-white/10 p-6 md:p-8 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 h-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-[1.2] rounded-[28px] border border-white/5 bg-black/20 backdrop-blur-md shadow-inner flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-white/[0.06] space-y-4">
                <div className="h-4" /> {/* Spacer instead of title */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-full focus-within:ring-1 focus-within:ring-[#D46B4E]/50 transition bg-white/5 border border-white/10">
                  <Search className="w-4 h-4 text-white/40" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="search for entries"
                    className="bg-transparent w-full focus:outline-none text-sm placeholder:text-white/40 text-white"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide custom-scrollbar">
                <div className="grid grid-cols-2 gap-x-6 gap-y-10">
                  {folders.map((folder) => (
                    <motion.div
                      key={folder.id}
                      drag
                      dragSnapToOrigin
                      onDoubleClick={() => router.push(`/home/canvas/${folder.id}`)}
                      onDragStart={() => setIsDraggingOver(true)}
                      onDragEnd={(event, info) => handleDragEnd(event, info, folder)}
                      whileDrag={{ scale: 1.1, zIndex: 50, opacity: 0.8 }}
                      className="flex flex-col items-start group cursor-grab active:cursor-grabbing relative"
                    >
                      <button
                        type="button"
                        onClick={async (event) => {
                          event.stopPropagation();
                          if (!confirm(`Delete folder "${folder.title}"?`)) return;
                          await deleteFolder.mutateAsync({ folderId: folder.id });
                        }}
                        className="absolute -right-2 -top-2 rounded-full bg-black/60 p-2 text-white/30 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100 z-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="relative w-full aspect-[1.1/1] mb-4 pointer-events-none transition-transform group-hover:scale-105">
                        <FolderIcon
                          className="w-full h-full drop-shadow-2xl filter brightness-110"
                          count={String(folder.entryCount)}
                        />
                      </div>
                      <p className="text-[13px] font-semibold px-1 leading-tight text-center pointer-events-none text-white/70 group-hover:text-white">
                        {folder.title}
                      </p>
                      <p className="text-[10px] px-1 mt-1 text-white/30 uppercase tracking-widest font-bold">
                        {folder.updatedAtLabel}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {folders.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-white/20">
                    <Search className="w-12 h-12 mb-4 opacity-10" />
                    <p className="text-sm font-medium tracking-wide">No spaces found</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white/[0.03] border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={async () => {
                    const name = prompt('Enter a name for your new mental space');
                    if (name) await createFolder.mutateAsync({ name: name.trim() });
                  }}
                  className="w-full py-4 rounded-[20px] bg-white/[0.06] border border-white/10 text-white/90 text-[13px] font-bold tracking-[0.15em] flex items-center justify-center gap-3 hover:bg-white/15 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                >
                  <Plus className="w-5 h-5 text-[#D46B4E]" />
                  CREATE SPACE
                </button>
              </div>
            </motion.div>

            {/* Main Content: Canvas / Quote Area */}
            <motion.div
              ref={dropZoneRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: 1,
                x: 0,
                borderColor: isDraggingOver
                  ? 'rgba(212,107,78, 0.4)'
                  : 'rgba(255,255,255,0.08)',
                backgroundColor: isDraggingOver
                  ? 'rgba(212,107,78, 0.03)'
                  : 'transparent',
              }}
              className="flex-[2] rounded-[28px] border shadow-2xl relative overflow-hidden flex items-center justify-center transition backdrop-blur-md bg-black/20"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_75%_80%,rgba(255,255,255,0.04),transparent_50%)]" />
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(15,15,15,0.86)' }}
              />

              <AnimatePresence>
                {droppedItems.map((item) => (
                  <motion.button
                    key={item.instanceId}
                    initial={{ scale: 0, opacity: 0, rotate: -15 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    drag
                    dragMomentum={false}
                    dragConstraints={dropZoneRef}
                    style={{ left: item.x, top: item.y, position: 'absolute' }}
                    onDoubleClick={() => router.push(`/home/canvas/${item.id}`)}
                    className="w-40 flex flex-col items-center cursor-move group z-30"
                  >
                    <FolderIcon
                      className="w-full h-auto drop-shadow-[0_24px_48px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-110"
                      count={String(item.entryCount)}
                    />
                    <p className="mt-2 text-[11px] text-center font-bold tracking-tight truncate w-full px-2 py-1 rounded-md text-white/80 bg-white/5 border border-white/5 backdrop-blur-md">
                      {item.title}
                    </p>
                  </motion.button>
                ))}
              </AnimatePresence>

              {droppedItems.length === 0 && (
                <div className="relative z-10 text-center px-6 max-w-2xl pointer-events-none">
                  <p className="text-[28px] md:text-[42px] leading-relaxed text-white/90 font-playfair italic">
                    “Your thoughts are not separate.
                    <br />
                    <span className="text-white/90">They are waiting to connect.”</span>
                  </p>

                  <div className="mt-12 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-[11px] tracking-[0.4em] uppercase text-white/40 font-bold">
                      <MousePointer2 className="w-3 h-3 stroke-[3]" />
                      DOUBLE CLICK
                    </div>
                    <p className="text-base text-white/30 font-medium">
                      Drag entries or double click to begin
                    </p>
                  </div>
                </div>
              )}

              {isDraggingOver && (
                <div
                  className="absolute inset-0 border-2 border-dashed m-4 rounded-[20px] flex items-center justify-center pointer-events-none z-50 bg-[#D46B4E]/5"
                  style={{ borderColor: 'rgba(212,107,78, 0.3)' }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Plus className="w-8 h-8 text-[#D46B4E] opacity-50" />
                    <span
                      className="text-xs font-bold tracking-[0.5em] uppercase"
                      style={{ color: 'rgba(212,107,78, 0.6)' }}
                    >
                      Drop to Explore
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
