'use client';

import '@xyflow/react/dist/style.css';

import { useUser } from '@clerk/nextjs';
import type { EntryCanvasCard, EntryCanvasConnection, UserEntry } from '@soouls/api/router';
import {
  Background,
  type Connection,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  type Node,
  type NodeProps,
  NodeResizer,
  Position,
  ReactFlow,
  type ReactFlowInstance,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  Grid2X2,
  Link as LinkIcon,
  Loader2,
  Maximize2,
  MousePointer2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Minus,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEntryPlainText } from '../../../../src/utils/entries';
import { clusterMatchesEntry, getEntryTitle, truncateText } from '../../../../src/utils/home';
import { trpc } from '../../../../src/utils/trpc';
import { BackgroundText } from '../../../components/BackgroundText';
import { ConfirmModal } from '../../../components/ConfirmModal';

type CanvasNodeData = {
  card: EntryCanvasCard;
  onPatch: (cardId: string, patch: Partial<EntryCanvasCard>) => void;
};
type CanvasNode = Node<CanvasNodeData>;

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function ThoughtCardNode({ id, data, selected }: NodeProps<CanvasNode>) {
  const card = data.card as EntryCanvasCard;
  const onPatch = data.onPatch as CanvasNodeData['onPatch'];
  const isWarning = card.type === 'warning';

  return (
    <div
      className="group relative rounded-[24px] border p-5 shadow-[0_22px_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
      style={{
        width: card.width,
        minHeight: card.height,
        background: card.color || '#141111',
        borderColor: isWarning ? '#F5A524' : card.border_color || 'var(--soouls-accent)',
        boxShadow: selected
          ? '0 0 0 2px var(--soouls-accent), 0 0 40px rgba(var(--soouls-accent-rgb), 0.25)'
          : '0 20px 40px rgba(0,0,0,0.3)',
      }}
    >
      <NodeResizer
        color="var(--soouls-accent)"
        isVisible={selected}
        minWidth={160}
        minHeight={100}
        maxWidth={360}
        maxHeight={260}
        onResize={(_event: any, size: { width: number; height: number }) =>
          onPatch(id, { width: size.width, height: size.height })
        }
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!border-[var(--soouls-accent)] !bg-[#1C1C1C]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!border-[var(--soouls-accent)] !bg-[#1C1C1C]"
      />

      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--soouls-accent)]">
          {card.tag || card.type}
        </span>
        {isWarning ? <span className="text-[#F5A524]">!</span> : null}
      </div>
      <input
        value={card.title}
        onChange={(event) => onPatch(id, { title: event.target.value })}
        className="nodrag mb-3 w-full bg-transparent font-playfair text-[24px] leading-none text-[#EFEBDD] outline-none"
      />
      <textarea
        value={card.body}
        onChange={(event) => onPatch(id, { body: event.target.value })}
        className="nodrag min-h-[80px] w-full resize-none bg-transparent text-[14px] leading-relaxed text-white/55 outline-none"
      />
    </div>
  );
}

const nodeTypes = { thoughtCard: ThoughtCardNode };

function makeCanvasNodes(
  cards: EntryCanvasCard[],
  onPatch: CanvasNodeData['onPatch'],
): CanvasNode[] {
  return cards.map((card) => ({
    id: card.id,
    type: 'thoughtCard',
    position: { x: card.x, y: card.y },
    data: { card, onPatch },
  }));
}

function makeCanvasEdges(connections: EntryCanvasConnection[]): Edge[] {
  return connections.map((connection) => ({
    id: connection.id ?? `edge-${connection.from}-${connection.to}`,
    source: connection.from,
    target: connection.to,
    label: connection.label,
    type: 'smoothstep',
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--soouls-accent)' },
    style: { stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 },
    labelStyle: { fill: '#E6E2D6', fontSize: 11 },
  }));
}

export default function CanvasClusterPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams<{ clusterId: string }>();
  const clusterId = typeof params?.clusterId === 'string' ? params.clusterId : '';
  const utils = trpc.useUtils();

  const [query, setQuery] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [canvasTitle, setCanvasTitle] = useState('Untitled Canvas');
  const [clusterInsight, setClusterInsight] = useState('');
  const [showInsights, setShowInsights] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<
    CanvasNode,
    Edge
  > | null>(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedRef = useRef(false);

  const { data: clusterDetail } = trpc.private.home.getClusterDetail.useQuery(
    { clusterId },
    { enabled: clusterId.length > 0 },
  );
  const { data: allEntries, isLoading: entriesLoading } = trpc.private.entries.getAll.useQuery({
    limit: 150,
    cursor: 0,
  });
  const { data: canvas, isFetching: canvasLoading } = trpc.private.home.getEntryCanvas.useQuery(
    { entryId: selectedEntryId ?? '' },
    { enabled: Boolean(selectedEntryId) },
  );

  const saveCanvas = trpc.private.home.saveEntryCanvas.useMutation();
  const regenerateCanvas = trpc.private.home.regenerateEntryCanvas.useMutation({
    onSuccess: async () => {
      await utils.private.home.getEntryCanvas.invalidate({ entryId: selectedEntryId ?? '' });
    },
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

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

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedEntryId) ?? null,
    [entries, selectedEntryId],
  );

  const patchCard = useCallback(
    (cardId: string, patch: Partial<EntryCanvasCard>) => {
      setNodes((current: CanvasNode[]) =>
        current.map((node: CanvasNode) =>
          node.id === cardId
            ? {
                ...node,
                data: {
                  ...node.data,
                  card: { ...node.data.card, ...patch },
                },
              }
            : node,
        ),
      );
    },
    [setNodes],
  );

  useEffect(() => {
    if (!canvas) return;
    hydratedRef.current = false;
    setCanvasTitle(canvas.canvasTitle);
    setClusterInsight(canvas.clusterInsight);
    setNodes(makeCanvasNodes(canvas.cards, patchCard));
    setEdges(makeCanvasEdges(canvas.connections));
    setSaveState('saved');
    requestAnimationFrame(() => {
      reactFlowInstance?.fitView({ padding: 0.18, duration: 400 });
      hydratedRef.current = true;
    });
  }, [canvas, patchCard, reactFlowInstance, setEdges, setNodes]);

  useEffect(() => {
    if (!selectedEntryId || !hydratedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveState('saving');
    saveTimerRef.current = setTimeout(async () => {
      const cards = nodes.map((node: CanvasNode) => ({
        ...node.data.card,
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
      }));
      const connections = edges.map((edge: Edge) => ({
        id: edge.id,
        from: edge.source,
        to: edge.target,
        label: typeof edge.label === 'string' ? edge.label : undefined,
      }));

      try {
        await saveCanvas.mutateAsync({
          entryId: selectedEntryId,
          canvasTitle,
          cards,
          connections,
          clusterInsight,
        });
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [canvasTitle, clusterInsight, edges, nodes, saveCanvas, selectedEntryId]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current: Edge[]) =>
        addEdge(
          {
            ...connection,
            id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--soouls-accent)' },
            style: { stroke: 'rgba(224,122,95,0.55)', strokeWidth: 1.2 },
          },
          current,
        ),
      );
    },
    [setEdges],
  );

  const addCard = () => {
    const id = `card_${Date.now()}`;
    const card: EntryCanvasCard = {
      id,
      type: 'reflection',
      title: 'New Card',
      body: '',
      x: 360,
      y: 220,
      width: 220,
      height: 140,
      color: '#171313',
      border_color: 'var(--soouls-accent)',
      tag: 'Manual',
    };
    setNodes((current: CanvasNode[]) => [...current, ...makeCanvasNodes([card], patchCard)]);
  };

  const deleteSelection = () => {
    setNodes((current: CanvasNode[]) => current.filter((node: CanvasNode) => !node.selected));
    setEdges((current: Edge[]) => current.filter((edge: Edge) => !edge.selected));
  };

  const editConnectionLabel = (_event: React.MouseEvent, edge: Edge) => {
    const nextLabel = prompt('Connection label', typeof edge.label === 'string' ? edge.label : '');
    if (nextLabel === null) return;
    setEdges((current: Edge[]) =>
      current.map((item: Edge) =>
        item.id === edge.id ? { ...item, label: nextLabel.trim() || undefined } : item,
      ),
    );
  };

  const confirmRegenerate = async () => {
    if (!selectedEntryId) return;
    await regenerateCanvas.mutateAsync({ entryId: selectedEntryId });
    setShowRegenerateConfirm(false);
  };

  const handleRegenerate = () => {
    if (!selectedEntryId) return;
    setShowRegenerateConfirm(true);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#1F1F1F] text-[#EFEBDD] font-urbanist relative">
      <BackgroundText />


      <header className="relative z-20 mx-auto flex w-full max-w-[1700px] items-center justify-between px-8 py-9">
        <div className="flex items-center text-[24px] font-light tracking-[-0.04em]">
          <button type="button" onClick={() => router.push('/home')} className="text-white/35 hover:text-white transition-colors">
            Home
          </button>
          <span className="text-white/35 mx-2">/</span>
          <button
            type="button"
            onClick={() => router.push('/home/canvas')}
            className="text-white/35 hover:text-white transition-colors"
          >
            Canvas
          </button>
          <span className="text-white/35 mx-2">/</span>
          <span className="text-[var(--soouls-accent)] font-medium">
            {clusterDetail?.cluster.name ?? 'Cluster'}
          </span>
        </div>
        <button
          type="button"
          className="h-11 w-11 overflow-hidden rounded-full border border-white/10 shadow-2xl"
        >
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </button>
      </header>

      <main className="relative z-10 mx-auto flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-118px)] w-full max-w-[1700px] gap-8 px-4 md:px-8 pb-8">
        <aside className="flex w-full lg:w-[440px] shrink-0 flex-col rounded-[40px] border border-white/[0.04] bg-[#0B0B0B]/70 p-6 md:p-8 shadow-2xl backdrop-blur-[60px]">
          <div className="mb-10 flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/home/canvas')}
              className="text-white/50 transition hover:text-white group"
            >
              <ChevronLeft className="h-10 w-10 group-hover:-translate-x-1 transition-transform" />
            </button>
            <h1 className="truncate text-[32px] font-semibold text-[#EFEBDD]">
              {clusterDetail?.cluster.name ?? 'Cluster'}
            </h1>
          </div>

          <div className="relative mb-10 group">
            <Search className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--soouls-accent)] transition-colors" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="search for entries"
              className="soouls-search h-[64px] w-full rounded-full border border-white/10 bg-[#44423F]/90 pl-16 pr-6 text-[20px] text-white outline-none placeholder:text-white/35 shadow-inner transition-all focus:ring-1 focus:ring-[var(--soouls-accent)]/20"
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.2em] text-white/20">Entries</h2>
          </div>
          
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
            {entriesLoading ? (
              <div className="flex items-center gap-3 text-white/35 p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading entries...
              </div>
            ) : entries.length === 0 ? (
              <p className="rounded-[24px] border border-white/5 bg-white/[0.02] p-6 text-sm text-white/35">
                No entries match your search.
              </p>
            ) : (
              entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedEntryId(entry.id)}
                  className={`w-full rounded-[28px] border p-6 text-left transition-all group ${
                    selectedEntryId === entry.id
                      ? 'border-[var(--soouls-accent)]/50 bg-[var(--soouls-accent)]/10 shadow-[0_0_30px_rgba(var(--soouls-accent-rgb),0.12)]'
                      : 'border-white/[0.04] bg-[#0F0F0F]/60 hover:border-white/10'
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <h3 className="font-playfair text-[24px] font-bold leading-tight text-[#EFEBDD] group-hover:text-white">
                      {getEntryTitle(entry)}
                    </h3>
                    <span className="shrink-0 font-bold text-[10px] uppercase tracking-widest text-white/20 pt-1.5">
                      {new Date(entry.createdAt)
                        .toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        })
                        .toUpperCase()
                        .replace(' ', '. ')}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[15px] leading-relaxed text-white/30 font-light">
                    {truncateText(getEntryPlainText(entry), 120)}
                  </p>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowInsights(true)}
            className="mt-8 flex items-center justify-center gap-3 rounded-full border border-[var(--soouls-accent)]/40 bg-[#1A1312] px-6 py-5 text-[18px] font-bold text-[#EFEBDD] shadow-[0_12px_32px_rgba(var(--soouls-accent-rgb),0.16)] transition-all hover:bg-[var(--soouls-accent)] hover:text-white group"
          >
            <div className="flex -space-x-1">
              <div className="w-3.5 h-3.5 rounded-full border border-current opacity-40 group-hover:opacity-100" />
              <div className="w-3.5 h-3.5 rounded-full border border-current group-hover:opacity-100" />
              <div className="w-3.5 h-3.5 rounded-full border border-current opacity-40 group-hover:opacity-100" />
            </div>
            Cluster Insights
          </button>
        </aside>

        <section className="relative min-w-0 flex-1 min-h-[500px] lg:min-h-0 overflow-hidden rounded-[40px] border border-white/[0.04] bg-[#080808]/60 shadow-2xl backdrop-blur-[60px]">
          {!selectedEntryId ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center z-10">
              <p className="font-playfair text-[54px] italic leading-[1.1] text-[#EFEBDD]">
                “Your thoughts are not separate.
                <br />
                They are waiting to connect.”
              </p>
              <div className="mt-12 space-y-4">
                <div className="flex items-center justify-center gap-4 text-white/20 font-bold tracking-[0.5em] uppercase text-[12px]">
                  <MousePointer2 className="w-5 h-5 text-[var(--soouls-accent)] opacity-50" />
                  DOUBLE CLICK
                </div>
                <p className="text-[22px] text-white/35 font-light">
                  Drag entries or double click to begin
                </p>
              </div>
            </div>
          ) : canvasLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/40 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--soouls-accent)]" />
              <span className="text-lg font-light tracking-wide">Generating canvas...</span>
            </div>
          ) : (
            <>
              <div className="absolute left-10 right-10 top-8 z-30 flex items-center justify-between gap-6 pointer-events-none">
                <div className="min-w-0 pointer-events-auto">
                  <input
                    value={canvasTitle}
                    onChange={(event) => setCanvasTitle(event.target.value)}
                    className="w-full bg-transparent font-playfair text-[36px] font-bold text-[#EFEBDD] outline-none"
                  />
                  <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[var(--soouls-accent)] font-bold opacity-70">
                    {selectedEntry ? getEntryTitle(selectedEntry as UserEntry) : 'Entry Canvas'}
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/50 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 shadow-xl backdrop-blur-md pointer-events-auto">
                  {saveState === 'saving' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--soouls-accent)]" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saveState === 'saving'
                    ? 'Saving'
                    : saveState === 'error'
                      ? 'Save failed'
                      : 'Saved'}
                </div>
              </div>

              <ReactFlow<CanvasNode, Edge>
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeDoubleClick={editConnectionLabel}
                onInit={setReactFlowInstance}
                fitView
                minZoom={0.2}
                maxZoom={1.5}
                deleteKeyCode={['Backspace', 'Delete']}
                className="bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:32px_32px]"
              >
                <Background color="rgba(255,255,255,0.03)" gap={32} size={1} />
              </ReactFlow>

              {/* CUSTOM ZOOM CONTROLS */}
              <div className="absolute right-10 bottom-32 flex flex-col gap-4 z-30">
                <button
                  type="button"
                  onClick={() => reactFlowInstance?.zoomIn()}
                  className="w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-[var(--soouls-accent)]/20 transition-all shadow-2xl backdrop-blur-md"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => reactFlowInstance?.zoomOut()}
                  className="w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-[var(--soouls-accent)]/20 transition-all shadow-2xl backdrop-blur-md"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>

              {nodes.length === 0 ? (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-8 text-center">
                  <div className="rounded-[32px] border border-white/10 bg-black/60 px-10 py-8 backdrop-blur-3xl shadow-2xl">
                    <p className="font-playfair text-[32px] italic text-[#EFEBDD]">
                      Canvas cleared.
                    </p>
                    <p className="mt-3 text-[16px] text-white/30 font-light">Add a card or regenerate to start fresh.</p>
                  </div>
                </div>
              ) : null}

              <div className="absolute bottom-10 left-1/2 z-30 flex -translate-x-1/2 items-center overflow-hidden rounded-[32px] border border-white/15 bg-[#44413D]/85 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-3xl">
                <ToolbarButton icon={<Plus />} label="Create" onClick={addCard} />
                <ToolbarDivider />
                <ToolbarButton icon={<LinkIcon />} label="Connect" active />
                <ToolbarDivider />
                <ToolbarButton
                  icon={<Grid2X2 />}
                  label="Auto-arrange"
                  onClick={() => reactFlowInstance?.fitView({ padding: 0.2, duration: 600 })}
                />
                <ToolbarDivider />
                <ToolbarButton icon={<Trash2 />} label="Clear" onClick={deleteSelection} />
                <ToolbarDivider />
                <ToolbarButton
                  icon={
                    regenerateCanvas.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <RefreshCw />
                    )
                  }
                  label="Regenerate"
                  onClick={handleRegenerate}
                />
              </div>
            </>
          )}
        </section>
      </main>

      <AnimatePresence>
        {showInsights && clusterDetail ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-5 backdrop-blur-xl"
            onClick={() => setShowInsights(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="max-h-[80vh] w-full max-w-[760px] overflow-y-auto rounded-[28px] border border-[var(--soouls-accent)]/30 bg-[#111]/95 p-8 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-[24px] font-semibold text-[var(--soouls-accent)]">
                    Cluster Insights
                  </h2>
                  <Link
                    href={`/home/clusters/${clusterId}`}
                    className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-white/50 transition hover:bg-white/10 hover:text-white"
                  >
                    View Full Page
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInsights(false)}
                  className="text-white/40"
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
              </div>
              <p className="font-playfair text-[28px] italic leading-tight text-[#EFEBDD]">
                “{clusterDetail.narrative}”
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {clusterDetail.keyIdeas.map((idea) => (
                  <div
                    key={idea.label}
                    className="rounded-[20px] border border-white/5 bg-white/[0.03] p-5"
                  >
                    <h3 className="mb-2 text-lg text-[#EFEBDD]">{idea.label}</h3>
                    <p className="text-sm leading-relaxed text-white/45">{idea.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[22px] bg-[#222] p-5">
                <p className="mb-2 text-[var(--soouls-accent)]">Next Logical Step</p>
                <p className="text-sm leading-relaxed text-white/55">{clusterDetail.nextStep}</p>
              </div>
              <div className="mt-6 rounded-[22px] border border-[var(--soouls-accent)]/30 bg-[#2A1713] p-5 text-center">
                <p className="font-playfair text-[22px] italic text-[#EFEBDD]">
                  “{clusterDetail.reflectionPrompt}”
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showRegenerateConfirm}
        onClose={() => setShowRegenerateConfirm(false)}
        onConfirm={confirmRegenerate}
        title="Regenerate canvas?"
        description={
          <>
            Are you sure you want to regenerate this canvas? <br />
            <span className="text-white">Your current manual layout will be replaced.</span>
          </>
        }
        confirmText="Regenerate"
        confirmStyle="warning"
        isPending={regenerateCanvas.isPending}
      />
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-[112px] flex-col items-center gap-1 px-5 py-3 transition hover:bg-white/10 ${active ? 'text-[var(--soouls-accent)]' : 'text-[#EFEBDD]/80 hover:text-white'}`}
    >
      <span className={`h-5 w-5 [&>svg]:h-5 [&>svg]:w-5 ${active ? 'text-[var(--soouls-accent)]' : 'text-white/40 group-hover:text-white'}`}>{icon}</span>
      <span className="text-[12px] uppercase tracking-[0.08em]">{label}</span>
    </button>
  );
}

function ToolbarDivider() {
  return <div className="h-12 w-px bg-white/20" />;
}
