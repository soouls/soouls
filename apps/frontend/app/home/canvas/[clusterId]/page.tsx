'use client';

import { useUser } from '@clerk/nextjs';
import type { UserEntry } from '@soouls/api/router';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Link as LinkIcon, 
  Sparkles, 
  Trash2, 
  Maximize2,
  ChevronLeft
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { clusterMatchesEntry, getEntryTitle, truncateText } from '../../../../src/utils/home';
import { trpc } from '../../../../src/utils/trpc';

type NodePosition = {
  id: string;
  x: number;
  y: number;
  entry: UserEntry;
};

export default function CanvasClusterPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams<{ clusterId: string }>();
  const clusterId = typeof params?.clusterId === 'string' ? params.clusterId : '';
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<NodePosition[]>([]);

  const { data: clusterDetail } = trpc.private.home.getClusterDetail.useQuery(
    { clusterId },
    { enabled: clusterId.length > 0 },
  );
  const { data: allEntries } = trpc.private.entries.getAll.useQuery({ limit: 150, cursor: 0 });

  const entries = useMemo(() => {
    if (!clusterDetail) return [];
    const highlightIds = new Set(clusterDetail.highlights.map((highlight) => highlight.id));

    return (allEntries?.items ?? [])
      .filter(
        (entry) => highlightIds.has(entry.id) || clusterMatchesEntry(clusterDetail.cluster, entry),
      )
      .filter((entry) => {
        const corpus = `${entry.title ?? ''} ${entry.content}`.toLowerCase();
        return corpus.includes(query.toLowerCase());
      });
  }, [allEntries?.items, clusterDetail, query]);

  // Automatic Layout Logic
  useEffect(() => {
    if (entries.length > 0 && dropZoneRef.current) {
      const rect = dropZoneRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(rect.width, rect.height) * 0.35;

      const newNodes: NodePosition[] = entries.map((entry, index) => {
        if (index === 0) {
          return { id: entry.id, x: centerX - 100, y: centerY - 60, entry };
        }
        const angle = (index / (entries.length - 1)) * 2 * Math.PI;
        return {
          id: entry.id,
          x: centerX + radius * Math.cos(angle) - 100,
          y: centerY + radius * Math.sin(angle) - 60,
          entry,
        };
      });
      setNodes(newNodes);
    }
  }, [entries]);

  const selectedEntry = useMemo(() => {
    if (!selectedEntryId) return null;
    return entries.find(e => e.id === selectedEntryId);
  }, [entries, selectedEntryId]);

  return (
    <div className="min-h-screen bg-[#1F1F1F] text-white flex flex-col relative overflow-hidden font-urbanist select-none">
      {/* Background Watermark */}
      <div className="absolute top-12 left-0 right-0 flex justify-center pointer-events-none opacity-[0.7] select-none z-0 overflow-hidden whitespace-nowrap">
        <span
          className="text-[18vw] font-urbanist font-light leading-none text-transparent tracking-widest"
          style={{ WebkitTextStroke: '1px rgba(255,255,255,0.7)' }}
        >
          Soouls
        </span>
      </div>

      <header className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center text-[22px] font-light tracking-wide">
          <button
            type="button"
            onClick={() => router.push('/home')}
            className="text-white/40 hover:text-white transition-colors"
          >
            Home
          </button>
          <span className="text-[var(--soouls-accent)] mx-3 opacity-60">/</span>
          <button
            type="button"
            onClick={() => router.push('/home/canvas')}
            className="text-white/40 hover:text-white transition-colors"
          >
            Canvas
          </button>
          <span className="text-[var(--soouls-accent)] mx-3 opacity-60">/</span>
          <span className="text-[var(--soouls-accent)]">{clusterDetail?.cluster.name ?? 'Cluster'}</span>
        </div>

        <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden">
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 flex flex-col mt-4 pb-0 items-stretch h-full">
        <div className="flex-1 rounded-t-[32px] bg-[#0F0F0F]/60 backdrop-blur-[48px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col relative border-t border-white/10 p-6 md:p-8 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 h-full">
            {/* Left Sidebar: Entries List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-[1] rounded-[28px] border border-white/5 bg-black/20 backdrop-blur-md shadow-inner flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-white/[0.06] space-y-4">
                <div className="flex items-center gap-2 text-white/80">
                  <ChevronLeft className="w-5 h-5 cursor-pointer hover:text-white" onClick={() => router.push('/home/canvas')} />
                  <h2 className="text-xl font-medium tracking-tight truncate">
                    {clusterDetail?.cluster.name ?? 'Cluster'}
                  </h2>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full focus-within:ring-1 focus-within:ring-[var(--soouls-accent)]/50 transition bg-white/5 border border-white/10">
                  <Search className="w-4 h-4 text-white/40" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="search for entries"
                    className="bg-transparent w-full focus:outline-none text-sm placeholder:text-white/40 text-white"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {selectedEntry ? (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <button 
                      onClick={() => setSelectedEntryId(null)}
                      className="text-[10px] text-[var(--soouls-accent)] uppercase tracking-widest font-bold mb-4 hover:opacity-80 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      Back to list
                    </button>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-serif leading-tight">
                        {getEntryTitle(selectedEntry)}
                      </h3>
                      <p className="text-sm text-white/60 leading-relaxed max-h-[40vh] overflow-y-auto custom-scrollbar">
                        {selectedEntry.content}
                      </p>
                      <div className="flex items-center gap-3 pt-2">
                        <button 
                          onClick={() => router.push(`/home/new-entry?id=${selectedEntry.id}`)}
                          className="px-4 py-2 rounded-lg bg-[var(--soouls-accent)] text-white text-xs font-bold hover:opacity-90 transition-colors"
                        >
                          EDIT ENTRY
                        </button>
                        <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                          <Trash2 className="w-4 h-4 text-white/40" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 px-2 font-bold">Entries</p>
                    {entries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        onClick={() => setSelectedEntryId(entry.id)}
                        className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                          selectedEntryId === entry.id 
                            ? 'bg-[var(--soouls-accent)]/10 border-[var(--soouls-accent)]/40' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-semibold text-white/90 truncate pr-4">{getEntryTitle(entry)}</h3>
                          <span className="text-[10px] text-white/30 shrink-0">
                            {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-white/50 line-clamp-2">
                          {truncateText(entry.content, 80)}
                        </p>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>

              <div className="p-4 bg-white/[0.02] border-t border-white/5">
                <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-medium flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--soouls-accent)]" />
                  Cluster Insights
                </button>
              </div>
            </motion.div>

            {/* Right Side: Visual Canvas */}
            <motion.div
              ref={dropZoneRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-[2.5] rounded-[28px] border border-white/5 relative overflow-hidden bg-black/40 backdrop-blur-xl"
            >
              {/* SVG Connections Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
                <defs>
                  <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(var(--soouls-accent-rgb), 0)" />
                    <stop offset="50%" stopColor="rgba(var(--soouls-accent-rgb), 0.4)" />
                    <stop offset="100%" stopColor="rgba(var(--soouls-accent-rgb), 0)" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {nodes.length > 1 && nodes.slice(1).map((node) => {
                  const centerNode = nodes[0];
                  if (!centerNode) return null;
                  return (
                    <motion.line
                      key={`line-${node.id}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 0.5 }}
                      x1={centerNode.x + 100}
                      y1={centerNode.y + 60}
                      x2={node.x + 100}
                      y2={node.y + 60}
                      stroke="url(#line-gradient)"
                      strokeWidth="1.5"
                      filter="url(#glow)"
                    />
                  );
                })}
              </svg>

              {/* Grid Background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(var(--soouls-accent)_1px,transparent_1px)] [background-size:40px_40px]" />

              <div className="absolute inset-0 p-8">
                <AnimatePresence>
                  {nodes.map((node, index) => (
                    <motion.div
                      key={node.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: selectedEntryId === node.id ? 1.05 : 1, 
                        opacity: 1,
                        zIndex: selectedEntryId === node.id ? 50 : 10
                      }}
                      drag
                      dragMomentum={false}
                      onDragEnd={(e, info) => {
                        const newNodes = [...nodes];
                        newNodes[index] = { ...node, x: node.x + info.delta.x, y: node.y + info.delta.y };
                        setNodes(newNodes);
                      }}
                      onClick={() => setSelectedEntryId(node.id)}
                      onDoubleClick={() => router.push(`/home/new-entry?id=${node.id}`)}
                      className={`absolute w-52 p-5 rounded-2xl border backdrop-blur-2xl cursor-move transition-shadow ${
                        selectedEntryId === node.id
                          ? 'border-[var(--soouls-accent)]/60 bg-[var(--soouls-accent)]/20 shadow-[0_0_30px_rgba(var(--soouls-accent-rgb),0.2)]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 shadow-xl'
                      }`}
                      style={{ left: node.x, top: node.y }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-[var(--soouls-accent)]' : 'bg-white/40'}`} />
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${index === 0 ? 'text-[var(--soouls-accent)]' : 'text-white/40'}`}>
                            {index === 0 ? 'Focus point' : 'Linked thought'}
                          </p>
                        </div>
                        <h3 className="text-[15px] font-serif font-semibold text-white/90 line-clamp-1">{getEntryTitle(node.entry)}</h3>
                        <p className="text-[11px] leading-relaxed text-white/60 line-clamp-3">
                          {truncateText(node.entry.content, 100)}
                        </p>
                        <div className="pt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); router.push(`/home/new-entry?id=${node.id}`); }}
                              className="p-1 hover:bg-white/10 rounded-md transition-colors"
                            >
                              <Plus className="w-3 h-3 text-white/40 hover:text-white" />
                            </button>
                            <Maximize2 className="w-3 h-3 text-white/20" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Floating Toolbar */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-2xl shadow-2xl z-50">
                <ToolbarButton icon={<Plus className="w-4 h-4" />} label="CREATE" onClick={() => router.push('/home/new-entry')} />
                <div className="w-[1px] h-6 bg-white/10 mx-1" />
                <ToolbarButton icon={<LinkIcon className="w-4 h-4" />} label="CONNECT" />
                <ToolbarButton icon={<Sparkles className="w-4 h-4" />} label="INSIGHTS" />
                <div className="w-[1px] h-6 bg-white/10 mx-1" />
                <ToolbarButton icon={<Trash2 className="w-4 h-4" />} label="CLEAR" danger onClick={() => setNodes([])} />
              </div>

              {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center px-6 max-w-xl">
                    <p className="text-[22px] md:text-[26px] leading-relaxed text-white/75 font-light italic serif">
                      “Your thoughts are not separate.
                      <br />
                      They are waiting to connect.”
                    </p>
                    <p className="mt-4 text-sm text-white/40 tracking-widest uppercase font-bold">
                      Double click anywhere to begin
                    </p>
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

function ToolbarButton({ 
  icon, 
  label, 
  onClick, 
  danger = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all group ${
        danger 
          ? 'hover:bg-red-500/20 text-red-400' 
          : 'hover:bg-white/10 text-white/70 hover:text-white'
      }`}
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[10px] font-bold tracking-[0.15em]">{label}</span>
    </button>
  );
}
