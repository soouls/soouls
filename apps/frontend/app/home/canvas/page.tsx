'use client';

import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  LayoutGrid,
  Maximize2,
  Minimize2,
  MousePointer2,
  Plus,
  PlusCircle,
  RefreshCw,
  Search,
  Share2,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { getEntryPlainText, getEntryTitle } from '../../../src/utils/entries';
import { trpc } from '../../../src/utils/trpc';
import { ConfirmModal } from '../../components/ConfirmModal';

type ViewState = 'folders' | 'list' | 'cluster';

const FolderIcon = ({
  className,
  count = '0',
  color = '#C55B40',
}: {
  className?: string;
  count?: string;
  color?: string | null;
}) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 100 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10 25C10 22.2386 12.2386 20 15 20H38.5C39.6935 20 40.8443 20.4261 41.745 21.2014L50.255 28.5486C51.1557 29.3239 52.3065 29.75 53.5 29.75H85C87.7614 29.75 90 31.9886 90 34.75V70C90 72.7614 87.7614 75 85 75H15C12.2386 75 10 72.7614 10 70V25Z"
      fill="#2A2220"
      stroke="rgba(255,255,255,0.03)"
      strokeWidth="0.5"
    />
    <rect x="22" y="54" width="28" height="10" rx="5" fill={color ?? '#C55B40'} />
    <text
      x="36"
      y="60.5"
      fill="white"
      fontSize="4"
      fontWeight="700"
      textAnchor="middle"
      className="font-urbanist tracking-tighter uppercase"
    >
      {count} Entries
    </text>
  </svg>
);

export default function CanvasPage() {
  const { user } = useUser();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // Data fetching
  const { data: clusterData } = trpc.private.home.getClusters.useQuery(undefined);
  const { data: entriesData } = trpc.private.entries.getAll.useQuery({});
  const utils = trpc.useUtils();
  const recluster = trpc.private.home.recluster.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.private.home.getClusters.invalidate(),
        utils.private.home.getInsights.invalidate(),
      ]);
    },
  });

  type ClusterItem = NonNullable<NonNullable<typeof clusterData>['items']>[number];
  type EntryItem = NonNullable<NonNullable<typeof entriesData>['items']>[number] & {
    folderId?: string | null;
  };
  type ClusterNode = EntryItem & { x: number; y: number };

  // State
  const [view, setView] = useState<ViewState>('folders');
  const [selectedCluster, setSelectedCluster] = useState<ClusterItem | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<EntryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clusterNodes, setClusterNodes] = useState<ClusterNode[]>([]);
  const [showReclusterConfirm, setShowReclusterConfirm] = useState(false);

  const clusters: ClusterItem[] = clusterData?.items ?? [];
  const entries: EntryItem[] = entriesData?.items ?? [];

  // Filtered lists
  const filteredClusters = clusters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const clusterEntries = useMemo(() => {
    if (!selectedCluster) return [];
    return entries
      .filter((e) => e.clusterId === selectedCluster.id || e.folderId === selectedCluster.id)
      .filter(
        (e) =>
          e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.content?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
  }, [selectedCluster, entries, searchQuery]);

  // Highlight keywords in text
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part: string, i: number) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="text-[var(--soouls-accent)]">
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  // Sync cluster nodes
  useEffect(() => {
    if (view === 'cluster' && clusterEntries.length > 0) {
      setClusterNodes(
        clusterEntries.map((e) => ({
          ...e,
          x: 500 + (Math.random() - 0.5) * 600,
          y: 350 + (Math.random() - 0.5) * 400,
        })),
      );
    }
  }, [clusterEntries, view]);

  const handleFolderDoubleClick = (cluster: ClusterItem) => {
    router.push(`/home/canvas/${cluster.id}`);
  };

  const confirmRecluster = async () => {
    await recluster.mutateAsync();
    setShowReclusterConfirm(false);
  };

  const handleRecluster = () => {
    setShowReclusterConfirm(true);
  };

  const handleEntryClick = (entry: EntryItem) => {
    setSelectedEntry(entry);
    setView('cluster');
  };

  const handleBack = () => {
    if (view === 'cluster') setView('list');
    else if (view === 'list') {
      setView('folders');
      setSelectedCluster(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] text-[#EFEDDD] flex flex-col relative overflow-hidden font-urbanist select-none">
      {/* Playfair Display Import */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
      `}</style>

      {/* BACKGROUND WATERMARK */}
      <div className="absolute top-24 left-0 right-0 flex justify-center pointer-events-none opacity-[0.4] select-none z-0 overflow-hidden whitespace-nowrap">
        <span
          className="text-[14vw] font-urbanist font-light leading-none text-transparent tracking-widest uppercase"
          style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}
        >
          Soouls in
        </span>
      </div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 p-10 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-1 text-[22px] font-medium tracking-tight">
          <button
            type="button"
            onClick={() => router.push('/home')}
            className="text-white/30 hover:text-white/60 transition-all"
          >
            Home
          </button>
          <span className="text-white/30">/</span>
          <button
            type="button"
            onClick={() => {
              setView('folders');
              setSelectedCluster(null);
            }}
            className={`${!selectedCluster ? 'text-[var(--soouls-accent)]' : 'text-white/30'} hover:opacity-80 transition-all`}
          >
            Canvas
          </button>
          {selectedCluster && (
            <>
              <span className="text-white/30">/</span>
              <span className="text-[var(--soouls-accent)]">{selectedCluster.name}</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full border border-white/10 overflow-hidden shadow-2xl"
        >
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          )}
        </button>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 flex flex-col pt-32 pb-8 h-full">
        <div className="flex-1 rounded-[40px] bg-[#0A0A0A]/40 backdrop-blur-[64px] border border-white/5 flex overflow-hidden">
          {/* SIDEBAR */}
          <div className="w-[420px] border-r border-white/5 flex flex-col bg-black/20">
            <div className="p-10 space-y-10">
              {view !== 'folders' && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                >
                  <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
              )}

              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[var(--soouls-accent)] transition-colors" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search for entries"
                  className="w-full bg-[#1A1A1A] border border-white/5 rounded-full py-4 pl-14 pr-8 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[var(--soouls-accent)]/20 shadow-inner transition-all"
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between gap-3 px-2">
                  <h3 className="text-white/20 text-[12px] font-bold uppercase tracking-[0.2em]">
                    {view === 'folders' ? 'Clusters' : 'Entries'}
                  </h3>
                  {view === 'folders' ? (
                    <button
                      type="button"
                      onClick={handleRecluster}
                      disabled={recluster.isPending || entries.length === 0}
                      className="flex items-center gap-2 rounded-full border border-[var(--soouls-accent)]/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--soouls-accent)] disabled:opacity-40"
                    >
                      <RefreshCw
                        className={`h-3 w-3 ${recluster.isPending ? 'animate-spin' : ''}`}
                      />
                      Re-cluster
                    </button>
                  ) : null}
                </div>

                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 space-y-6">
                  {view === 'folders' ? (
                    filteredClusters.length === 0 ? (
                      <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.03] p-6 text-sm leading-relaxed text-white/35">
                        {entries.length === 0
                          ? 'No entries yet. Start writing to create your first cluster.'
                          : 'Smart clustering unavailable - showing by date soon.'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                        {filteredClusters.map((cluster) => (
                          <motion.div
                            key={cluster.id}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleFolderDoubleClick(cluster)}
                            className="flex flex-col gap-4 cursor-pointer group"
                          >
                            <FolderIcon
                              className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                              count={String(cluster.entryCount)}
                              color={cluster.color}
                            />
                            <span className="text-[16px] font-semibold text-white/80 group-hover:text-white px-1 truncate transition-colors">
                              {cluster.name}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="space-y-4">
                      {clusterEntries.map((entry) => (
                        <motion.div
                          key={entry.id}
                          layoutId={entry.id}
                          onClick={() => handleEntryClick(entry)}
                          className={`p-6 rounded-[24px] border transition-all cursor-pointer group ${selectedEntry?.id === entry.id ? 'bg-[var(--soouls-accent)]/10 border-[var(--soouls-accent)]/40 shadow-[0_0_30px_rgba(var(--soouls-accent-rgb),0.15)]' : 'bg-[#111111]/40 border-white/[0.03] hover:border-white/10'}`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-[18px] font-playfair font-bold text-white/90 group-hover:text-white">
                              {getEntryTitle(entry)}
                            </h4>
                            <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">
                              {new Date(entry.createdAt)
                                .toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: '2-digit',
                                  year: 'numeric',
                                })
                                .replace(/(\d+)/, '$1,')}
                            </span>
                          </div>
                          <p className="text-[14px] text-white/30 line-clamp-2 leading-relaxed font-light">
                            {highlightText(getEntryPlainText(entry), searchQuery)}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {view === 'cluster' && (
                <button
                  type="button"
                  className="w-full py-5 rounded-full bg-[#1A1817] border border-[var(--soouls-accent)]/30 text-[var(--soouls-accent)] font-bold text-[14px] flex items-center justify-center gap-3 hover:bg-[var(--soouls-accent)] hover:text-white transition-all shadow-[0_10px_20px_rgba(0,0,0,0.3)] group"
                >
                  <div className="flex -space-x-1">
                    <div className="w-3.5 h-3.5 rounded-full border border-current opacity-40" />
                    <div className="w-3.5 h-3.5 rounded-full border border-current" />
                    <div className="w-3.5 h-3.5 rounded-full border border-current opacity-40" />
                  </div>
                  Cluster Insights
                </button>
              )}
            </div>
          </div>

          {/* MAIN CANVAS */}
          <div className="flex-1 relative overflow-hidden bg-[#050505]/40">
            {/* Background Rings */}
            <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full border border-white/[0.02] pointer-events-none" />
            <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] rounded-full border border-white/[0.01] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full border border-white/[0.02] pointer-events-none" />

            <AnimatePresence mode="wait">
              {view !== 'cluster' ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="space-y-12 max-w-3xl relative z-10">
                    <h2 className="text-[54px] font-playfair italic text-white/95 leading-tight tracking-tight">
                      “Your thoughts are not separate.
                      <br />
                      They are waiting to connect.”
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-4 text-white/20 font-bold tracking-[0.5em] uppercase text-[10px]">
                        <MousePointer2 className="w-4 h-4 text-[var(--soouls-accent)] opacity-50" />
                        DOUBLE CLICK
                      </div>
                      <p className="text-white/30 text-xl font-light">
                        Drag entries or double click to begin
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="canvas"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0"
                >
                  {/* NODES AND LINES */}
                  <div className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing">
                    <svg
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                      {clusterNodes.map((node, i) =>
                        clusterNodes.slice(i + 1).map((other) => {
                          const dist = Math.sqrt((node.x - other.x) ** 2 + (node.y - other.y) ** 2);
                          if (dist < 500) {
                            return (
                              <line
                                key={`${node.id}-${other.id}`}
                                x1={node.x}
                                y1={node.y}
                                x2={other.x}
                                y2={other.y}
                                stroke="rgba(255, 255, 255, 0.05)"
                                strokeWidth="0.5"
                              />
                            );
                          }
                          return null;
                        }),
                      )}
                    </svg>

                    {clusterNodes.map((node) => (
                      <motion.div
                        key={node.id}
                        drag
                        dragMomentum={false}
                        onDrag={(_, info) => {
                          setClusterNodes((prev) =>
                            prev.map((n) =>
                              n.id === node.id
                                ? { ...n, x: n.x + info.delta.x, y: n.y + info.delta.y }
                                : n,
                            ),
                          );
                        }}
                        style={{ x: node.x - 150, y: node.y - 100, position: 'absolute' }}
                        className={`w-[300px] p-8 rounded-[32px] backdrop-blur-3xl border transition-all ${selectedEntry?.id === node.id ? 'bg-[#1A1A1A] border-[var(--soouls-accent)]/40 z-30 shadow-[0_0_40px_rgba(var(--soouls-accent-rgb),0.2)]' : 'bg-[#0D0D0D]/90 border-white/5 hover:border-white/10 z-10'}`}
                      >
                        <div className="text-[9px] text-white/20 font-bold uppercase tracking-widest mb-3">
                          {new Date(node.createdAt).toLocaleDateString()}
                        </div>
                        <h5 className="text-[20px] font-playfair font-bold text-white mb-3 truncate">
                          {getEntryTitle(node)}
                        </h5>
                        <p className="text-[14px] text-white/40 line-clamp-4 leading-relaxed font-light">
                          {getEntryPlainText(node)}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* FLOATING TOOLBAR */}
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 p-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <button
                      type="button"
                      className="flex items-center gap-3 px-8 py-3 text-[11px] font-bold text-white/40 hover:text-white transition-all uppercase tracking-widest"
                    >
                      <Plus className="w-4 h-4" />
                      CREATE
                    </button>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <button
                      type="button"
                      className="flex items-center gap-3 px-8 py-3 text-[11px] font-bold text-[var(--soouls-accent)] uppercase tracking-widest"
                    >
                      <Share2 className="w-4 h-4" />
                      CONNECT
                    </button>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <button
                      type="button"
                      className="flex items-center gap-3 px-8 py-3 text-[11px] font-bold text-white/40 hover:text-white transition-all uppercase tracking-widest"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      AUTO - ARRANGE
                    </button>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <button
                      type="button"
                      className="flex items-center gap-3 px-8 py-3 text-[11px] font-bold text-white/40 hover:text-white transition-all uppercase tracking-widest"
                    >
                      <Trash2 className="w-4 h-4" />
                      CLEAR
                    </button>
                  </div>

                  {/* ZOOM CONTROLS */}
                  <div className="absolute right-12 bottom-12 flex flex-col gap-6">
                    <button
                      type="button"
                      className="w-14 h-14 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-[var(--soouls-accent)]/20 transition-all shadow-2xl backdrop-blur-md"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                    <div className="w-14 h-[1px] bg-white/5" />
                    <button
                      type="button"
                      className="w-14 h-14 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-[var(--soouls-accent)]/20 transition-all shadow-2xl backdrop-blur-md"
                    >
                      <div className="w-6 h-[2px] bg-current" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={showReclusterConfirm}
        onClose={() => setShowReclusterConfirm(false)}
        onConfirm={confirmRecluster}
        title="Re-cluster folders?"
        description={
          <>
            Are you sure you want to re-cluster? <br />
            <span className="text-white">This will regroup all your folders based on your latest entries.</span>
          </>
        }
        confirmText="Re-cluster"
        confirmStyle="warning"
        isPending={recluster.isPending}
      />
    </div>
  );
}
