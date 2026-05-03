'use client';

import { useUser } from '@clerk/nextjs';
import type { UserEntry } from '@soouls/api/router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  Link as LinkIcon,
  Maximize2,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getEntryPlainText } from '../../../../src/utils/entries';
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
  const [connections, setConnections] = useState<Array<{ from: string; to: string }>>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSourceId, setConnectionSourceId] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);

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
        const corpus = `${entry.title ?? ''} ${getEntryPlainText(entry)}`.toLowerCase();
        return corpus.includes(query.toLowerCase());
      });
  }, [allEntries?.items, clusterDetail, query]);

  const selectedEntry = useMemo(() => {
    return entries.find((e) => e.id === selectedEntryId);
  }, [entries, selectedEntryId]);

  // Automatic Layout Logic
  const autoArrangeNodes = () => {
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
      
      const centerNode = newNodes[0];
      // Auto-create initial connections to center
      if (newNodes.length > 1 && centerNode) {
        const initialConnections = newNodes.slice(1).map(node => ({
          from: centerNode.id,
          to: node.id
        }));
        setConnections(initialConnections);
      }
    }
  };

  useEffect(() => {
    if (nodes.length === 0 && entries.length > 0) {
      autoArrangeNodes();
    }
  }, [entries]);

  const handleNodeClick = (nodeId: string) => {
    if (isConnecting) {
      if (connectionSourceId && connectionSourceId !== nodeId) {
        // Create connection
        setConnections(prev => [...prev, { from: connectionSourceId, to: nodeId }]);
        setIsConnecting(false);
        setConnectionSourceId(null);
      } else {
        setConnectionSourceId(nodeId);
      }
    } else {
      setSelectedEntryId(nodeId);
    }
  };

  const highlightSentiment = (text: string, sentiment?: string | null) => {
    if (!sentiment || !text) return text;
    const words = sentiment.toLowerCase().split(/[^a-z]+/g).filter(w => w.length > 2);
    if (words.length === 0) return text;

    let highlighted = text;
    for (const word of words) {
      const regex = new RegExp(`\\b(${word})\\b`, 'gi');
      highlighted = highlighted.replace(regex, '<span class="text-[#D46B4E] font-medium">$1</span>');
    }
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] text-white flex flex-col relative overflow-hidden font-urbanist select-none">
      {/* Background Watermark */}
      <div className="absolute top-12 left-0 right-0 flex justify-center pointer-events-none opacity-[0.4] select-none z-0 overflow-hidden whitespace-nowrap">
        <span
          className="text-[18vw] font-urbanist font-light leading-none text-transparent tracking-widest"
          style={{ WebkitTextStroke: '1px rgba(255,255,255,0.7)' }}
        >
          Soouls
        </span>
      </div>

      <header className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center text-[20px] font-light tracking-wide">
          <button
            type="button"
            onClick={() => router.push('/home')}
            className="text-white/60 hover:text-white transition-colors"
          >
            Home
          </button>
          <span className="text-[#D46B4E] mx-3 opacity-60">/</span>
          <button
            type="button"
            onClick={() => router.push('/home/canvas')}
            className="text-white/60 hover:text-white transition-colors"
          >
            Canvas
          </button>
          <span className="text-[#D46B4E] mx-3 opacity-60">/</span>
          <span className="text-[#D46B4E]">{clusterDetail?.cluster.name ?? 'Cluster'}</span>
        </div>

        <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden cursor-pointer shadow-lg hover:border-white/30 transition-all">
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 flex flex-col mt-4 pb-0 items-stretch h-full overflow-hidden">
        <div className="flex-1 rounded-t-[32px] bg-[#0F0F0F]/80 backdrop-blur-[64px] shadow-[0_-20px_60px_rgba(0,0,0,0.6)] flex flex-col relative border-t border-white/10 p-6 md:p-8 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 h-full">
            {/* Left Sidebar: Entries List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-[1] min-w-[340px] max-w-[400px] rounded-[28px] border border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-white/[0.06] space-y-6">
                <div className="flex items-center gap-4 text-white/90">
                  <ChevronLeft
                    className="w-6 h-6 cursor-pointer hover:text-white transition-transform hover:-translate-x-1"
                    onClick={() => router.push('/home/canvas')}
                  />
                  <h2 className="text-[26px] font-semibold tracking-tight truncate font-urbanist">
                    {clusterDetail?.cluster.name ?? 'Cluster'}
                  </h2>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full focus-within:ring-1 focus-within:ring-[#D46B4E]/50 transition bg-white/5 border border-white/10">
                  <Search className="w-4 h-4 text-white/40" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="search for entries"
                    className="bg-transparent w-full focus:outline-none text-sm placeholder:text-white/20 text-white font-medium"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {selectedEntry ? (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <button 
                      onClick={() => setSelectedEntryId(null)}
                      className="text-[10px] text-[#D46B4E] uppercase tracking-widest font-bold mb-4 hover:opacity-80 flex items-center gap-1"
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
                          className="px-4 py-2 rounded-lg bg-[#D46B4E] text-white text-xs font-bold hover:bg-[#c05a3d] transition-colors"
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
                            ? 'bg-[#D46B4E]/10 border-[#D46B4E]/40' 
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
                  <Sparkles className="w-3.5 h-3.5 text-[#D46B4E]" />
                  Cluster Insights
                </button>
              </div>

              {/* Insights Overlay */}
              <AnimatePresence>
                {showInsights && clusterDetail && (
                  <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="absolute inset-0 bg-[#0F0F0F] z-50 flex flex-col p-8 overflow-y-auto custom-scrollbar"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-[20px] font-bold tracking-tight text-[#D46B4E]">Cluster Insights</h3>
                      <button
                        onClick={() => setShowInsights(false)}
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-8">
                      <section>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/20 font-black mb-4">Narrative</p>
                        <p className="text-[15px] leading-relaxed text-white/80 font-light italic serif font-serif">
                          "{clusterDetail.narrative}"
                        </p>
                      </section>

                      <section>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/20 font-black mb-4">Observation</p>
                        <p className="text-[14px] leading-relaxed text-white/60">
                          {clusterDetail.observation}
                        </p>
                      </section>

                      <section>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/20 font-black mb-4">Key Ideas</p>
                        <div className="space-y-4">
                          {clusterDetail.keyIdeas.map((idea, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                              <p className="text-[14px] font-bold text-white/90 mb-1">{idea.label}</p>
                              <p className="text-[12px] text-white/40 leading-snug">{idea.description}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="pt-4 border-t border-white/10">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-[#D46B4E]/60 font-black mb-4">Reflection Prompt</p>
                        <div className="p-6 rounded-[24px] bg-[#D46B4E]/10 border border-[#D46B4E]/20 shadow-2xl">
                          <p className="text-[16px] leading-relaxed text-[#D46B4E] font-medium font-serif italic">
                            {clusterDetail.reflectionPrompt}
                          </p>
                        </div>
                      </section>
                    </div>

                    <button
                      onClick={() => setShowInsights(false)}
                      className="mt-12 w-full py-4 rounded-[20px] border border-white/10 text-white/40 text-[12px] font-bold tracking-[0.2em] hover:text-white hover:border-white/20 transition-all"
                    >
                      DISMISS
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right Side: Visual Canvas */}
            <motion.div
              ref={dropZoneRef}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 rounded-[28px] border border-white/5 relative overflow-hidden bg-black/40 backdrop-blur-2xl shadow-inner"
            >
              {/* SVG Connections Layer */}
              <svg
                aria-hidden="true"
                className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0"
              >
                <defs>
                  <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(212,107,78, 0)" />
                    <stop offset="50%" stopColor="rgba(212,107,78, 0.4)" />
                    <stop offset="100%" stopColor="rgba(212,107,78, 0)" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {connections.map((conn, idx) => {
                  const fromNode = nodes.find(n => n.id === conn.from);
                  const toNode = nodes.find(n => n.id === conn.to);
                  if (!fromNode || !toNode) return null;
                  
                  return (
                    <motion.line
                      key={`conn-${idx}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      x1={fromNode.x + 112}
                      y1={fromNode.y + 70}
                      x2={toNode.x + 112}
                      y2={toNode.y + 70}
                      stroke="url(#line-gradient)"
                      strokeWidth="2"
                      filter="url(#glow)"
                      className="opacity-60"
                    />
                  );
                })}
              </svg>

              {/* Grid Background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#D46B4E_1px,transparent_1px)] [background-size:40px_40px]" />

              <div className="absolute inset-0 p-8 overflow-hidden">
                <AnimatePresence>
                  {nodes.map((node, index) => (
                    <motion.div
                      key={node.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: selectedEntryId === node.id || connectionSourceId === node.id ? 1.05 : 1,
                        opacity: 1,
                        zIndex: selectedEntryId === node.id ? 50 : 10,
                      }}
                      drag
                      dragMomentum={false}
                      onDragEnd={(_event, info) => {
                        const newNodes = [...nodes];
                        const idx = newNodes.findIndex(n => n.id === node.id);
                        newNodes[idx] = {
                          ...node,
                          x: node.x + info.offset.x,
                          y: node.y + info.offset.y,
                        };
                        setNodes(newNodes);
                      }}
                      onClick={() => handleNodeClick(node.id)}
                      className={`absolute w-64 p-6 rounded-[28px] border backdrop-blur-3xl cursor-move transition-all duration-500 shadow-2xl ${
                        selectedEntryId === node.id
                          ? 'border-[#D46B4E]/60 bg-[#D46B4E]/20 shadow-[0_0_30px_rgba(212,107,78,0.2)]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 shadow-xl'
                      }`}
                      style={{ left: node.x, top: node.y }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-[#D46B4E]' : 'bg-white/40'}`} />
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${index === 0 ? 'text-[#D46B4E]' : 'text-white/40'}`}>
                            {index === 0 ? 'Focus point' : 'Linked thought'}
                          </p>
                        </div>
                        <h3 className="text-[18px] font-serif font-semibold text-white/95 line-clamp-1 leading-tight tracking-tight">
                          {getEntryTitle(node.entry)}
                        </h3>
                        <p className="text-[13px] leading-relaxed text-white/50 line-clamp-3 font-light">
                          {truncateText(getEntryPlainText(node.entry), 120)}
                        </p>
                        <div className="pt-4 flex items-center justify-between border-t border-white/[0.06]">
                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/home/new-entry?id=${node.id}`);
                              }}
                              className="p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-110"
                            >
                              <Plus className="w-4 h-4 text-white/30 hover:text-white" />
                            </button>
                            <Maximize2 className="w-4 h-4 text-white/15 hover:text-[#D46B4E] cursor-pointer transition-colors" />
                          </div>
                          <span className="text-[10px] text-white/10 font-bold uppercase tracking-widest">
                            {new Date(node.entry.createdAt).getFullYear()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Floating Toolbar */}
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 p-3 rounded-[32px] bg-black/80 border border-white/10 backdrop-blur-3xl shadow-[0_32px_64px_rgba(0,0,0,0.8)] z-50">
                <ToolbarButton
                  icon={<Plus className="w-6 h-6" />}
                  label="CREATE"
                  onClick={() => router.push('/home/new-entry')}
                />
                <div className="w-[1px] h-10 bg-white/10 mx-2" />
                <ToolbarButton 
                  icon={<LinkIcon className="w-6 h-6" />} 
                  label="CONNECT" 
                  active={isConnecting}
                  onClick={() => setIsConnecting(!isConnecting)}
                />
                <ToolbarButton 
                  icon={<Sparkles className="w-6 h-6" />} 
                  label="AUTO - ARRANGE" 
                  onClick={autoArrangeNodes}
                />
                <div className="w-[1px] h-10 bg-white/10 mx-2" />
                <ToolbarButton
                  icon={<Trash2 className="w-6 h-6" />}
                  label="CLEAR"
                  danger
                  onClick={() => {
                    setNodes([]);
                    setConnections([]);
                  }}
                />
              </div>

              {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center px-12 max-w-3xl">
                    <p className="text-[42px] md:text-[56px] leading-[1.1] text-white/80 font-serif italic tracking-tight">
                      “Your thoughts are not separate.
                      <br />
                      <span className="text-white/90">They are waiting to connect.”</span>
                    </p>
                    <div className="mt-12 flex flex-col items-center gap-6">
                      <div className="flex items-center gap-4 text-[13px] tracking-[0.5em] uppercase text-white/30 font-black">
                        <Maximize2 className="w-5 h-5 opacity-50" />
                        DOUBLE CLICK TO BEGIN
                      </div>
                      <p className="text-white/20 text-sm font-medium tracking-wide">
                        Drag entries or double click to begin
                      </p>
                    </div>
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
  active = false,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col md:flex-row items-center gap-3 px-6 py-4 rounded-[20px] transition-all group relative overflow-hidden ${
        danger
          ? 'hover:bg-red-500/20 text-red-400 border border-transparent hover:border-red-500/30'
          : active
            ? 'bg-[#D46B4E] text-white shadow-[0_0_30px_rgba(212,107,78,0.5)] border border-[#D46B4E]/50'
            : 'hover:bg-white/10 text-white/60 hover:text-white border border-transparent hover:border-white/10'
      }`}
    >
      <div className={`${!active && 'group-hover:scale-110 group-hover:rotate-6'} transition-all duration-500`}>
        {icon}
      </div>
      <span className="text-[12px] font-black tracking-[0.25em]">{label}</span>
      {active && (
        <motion.div
          layoutId="toolbar-active"
          className="absolute inset-0 bg-white/10"
          initial={false}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
}
