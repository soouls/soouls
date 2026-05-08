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
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEntryPlainText } from '../../../../src/utils/entries';
import { clusterMatchesEntry, getEntryTitle, truncateText } from '../../../../src/utils/home';
import { trpc } from '../../../../src/utils/trpc';

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
        borderColor: isWarning ? '#F5A524' : card.border_color || '#E07A5F',
        boxShadow: selected
          ? '0 0 0 1px rgba(224,122,95,0.55), 0 0 42px rgba(224,122,95,0.22)'
          : undefined,
      }}
    >
      <NodeResizer
        color="#E07A5F"
        isVisible={selected}
        minWidth={160}
        minHeight={100}
        maxWidth={360}
        maxHeight={260}
        onResize={(_event: any, size: { width: number; height: number }) => onPatch(id, { width: size.width, height: size.height })}
      />
      <Handle type="target" position={Position.Top} className="!border-[#E07A5F] !bg-[#1C1C1C]" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!border-[#E07A5F] !bg-[#1C1C1C]"
      />

      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#E07A5F]">
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

function makeCanvasEdges(
  connections: EntryCanvasConnection[],
): Edge[] {
  return connections.map((connection) => ({
    id: connection.id ?? `edge-${connection.from}-${connection.to}`,
    source: connection.from,
    target: connection.to,
    label: connection.label,
    type: 'smoothstep',
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#E07A5F' },
    style: { stroke: 'rgba(224,122,95,0.55)', strokeWidth: 1.2 },
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
            markerEnd: { type: MarkerType.ArrowClosed, color: '#E07A5F' },
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
      border_color: '#E07A5F',
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

  const handleRegenerate = async () => {
    if (!selectedEntryId) return;
    if (!confirm('Regenerate this canvas? Your current manual layout will be replaced.')) return;
    await regenerateCanvas.mutateAsync({ entryId: selectedEntryId });
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#1F1F1F] text-[#EFEBDD] font-urbanist">
      <div className="pointer-events-none absolute left-0 right-0 top-14 z-0 flex justify-center overflow-hidden opacity-50">
        <span
          className="text-[18vw] font-light leading-none tracking-widest text-transparent"
          style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.26)' }}
        >
          Soouls in
        </span>
      </div>

      <header className="relative z-20 mx-auto flex w-full max-w-[1700px] items-center justify-between px-8 py-9">
        <div className="flex items-center text-[24px] font-light tracking-[-0.04em]">
          <button type="button" onClick={() => router.push('/home')} className="text-white/35">
            Home
          </button>
          <span className="text-white/35">/</span>
          <button
            type="button"
            onClick={() => router.push('/home/canvas')}
            className="text-white/35"
          >
            Canvas
          </button>
          <span className="text-white/35">/</span>
          <span className="text-[#E07A5F]">{clusterDetail?.cluster.name ?? 'Cluster'}</span>
        </div>
        <button
          type="button"
          className="h-11 w-11 overflow-hidden rounded-full border border-white/10"
        >
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </button>
      </header>

      <main className="relative z-10 mx-auto flex h-[calc(100vh-118px)] w-full max-w-[1700px] gap-6 px-8 pb-8">
        <aside className="flex w-[440px] shrink-0 flex-col rounded-[30px] border border-white/[0.04] bg-[#0B0B0B]/70 p-7 shadow-2xl backdrop-blur-[60px]">
          <div className="mb-8 flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/home/canvas')}
              className="text-white/50 transition hover:text-white"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <h1 className="truncate text-[30px] font-semibold">
              {clusterDetail?.cluster.name ?? 'Cluster'}
            </h1>
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="search for entries"
              className="h-[62px] w-full rounded-full border border-white/10 bg-[#44423F]/90 pl-14 pr-5 text-[21px] text-white outline-none placeholder:text-white/32 shadow-inner"
            />
          </div>

          <h2 className="mb-5 text-[22px] text-white/80">Entries</h2>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {entriesLoading ? (
              <div className="flex items-center gap-3 text-white/35">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading entries
              </div>
            ) : entries.length === 0 ? (
              <p className="rounded-[20px] border border-white/5 p-5 text-sm text-white/35">
                No entries match your search.
              </p>
            ) : (
              entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedEntryId(entry.id)}
                  className={`w-full rounded-[24px] border p-5 text-left transition ${
                    selectedEntryId === entry.id
                      ? 'border-[#E07A5F]/70 bg-[#E07A5F]/10'
                      : 'border-white/[0.04] bg-[#0F0F0F]/70 hover:border-white/10'
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <h3 className="font-playfair text-[26px] leading-none text-[#EFEBDD]">
                      {getEntryTitle(entry)}
                    </h3>
                    <span className="shrink-0 font-playfair text-[13px] uppercase text-white/30">
                      {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[15px] leading-snug text-white/48">
                    {truncateText(getEntryPlainText(entry), 120)}
                  </p>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowInsights(true)}
            className="mt-6 flex items-center justify-center gap-3 rounded-full border border-[#E07A5F]/50 bg-[#191312] px-5 py-4 text-[18px] font-semibold text-[#EFEBDD] shadow-[0_0_24px_rgba(224,122,95,0.16)]"
          >
            <Sparkles className="h-5 w-5 text-[#E07A5F]" />
            Cluster Insights
          </button>
        </aside>

        <section className="relative min-w-0 flex-1 overflow-hidden rounded-[30px] border border-white/[0.04] bg-[#080808]/68 shadow-2xl backdrop-blur-[60px]">
          {!selectedEntryId ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
              <p className="font-playfair text-[48px] italic leading-[1.08] text-[#EFEBDD]">
                “Your thoughts are not separate.
                <br />
                They are waiting to connect.”
              </p>
              <p className="mt-10 text-[22px] text-white/45">
                Drag entries or double click to begin
              </p>
            </div>
          ) : canvasLoading ? (
            <div className="absolute inset-0 flex items-center justify-center gap-3 text-white/50">
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating canvas
            </div>
          ) : (
            <>
              <div className="absolute left-8 right-8 top-6 z-20 flex items-center justify-between gap-5">
                <div className="min-w-0">
                  <input
                    value={canvasTitle}
                    onChange={(event) => setCanvasTitle(event.target.value)}
                    className="w-full bg-transparent font-playfair text-[30px] text-[#EFEBDD] outline-none"
                  />
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/25">
                    {selectedEntry ? getEntryTitle(selectedEntry as UserEntry) : 'Entry Canvas'}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-4 py-2 text-xs uppercase tracking-[0.14em] text-white/50">
                  {saveState === 'saving' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
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
                className="bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:28px_28px]"
              >
                <Background color="rgba(255,255,255,0.08)" gap={28} size={1} />
                <Controls
                  showInteractive={false}
                  className="!bottom-28 !right-8 !left-auto !bg-black/60 !backdrop-blur-xl"
                />
              </ReactFlow>

              {nodes.length === 0 ? (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-8 text-center">
                  <div className="rounded-[28px] border border-white/10 bg-black/55 px-8 py-6 backdrop-blur-2xl">
                    <p className="font-playfair text-[30px] italic text-[#EFEBDD]">
                      Canvas cleared.
                    </p>
                    <p className="mt-2 text-sm text-white/40">Add a card or regenerate.</p>
                  </div>
                </div>
              ) : null}

              <div className="absolute bottom-9 left-1/2 z-30 flex -translate-x-1/2 items-center overflow-hidden rounded-[28px] border border-white/15 bg-[#44413D]/88 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                <ToolbarButton icon={<Plus />} label="Create" onClick={addCard} />
                <ToolbarDivider />
                <ToolbarButton icon={<LinkIcon />} label="Connect" />
                <ToolbarDivider />
                <ToolbarButton
                  icon={<Grid2X2 />}
                  label="Auto-arrange"
                  onClick={() => reactFlowInstance?.fitView({ padding: 0.2, duration: 500 })}
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
              className="max-h-[80vh] w-full max-w-[760px] overflow-y-auto rounded-[28px] border border-[#E07A5F]/30 bg-[#111]/95 p-8 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-[24px] font-semibold text-[#E07A5F]">Cluster Insights</h2>
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
                <p className="mb-2 text-[#E07A5F]">Next Logical Step</p>
                <p className="text-sm leading-relaxed text-white/55">{clusterDetail.nextStep}</p>
              </div>
              <div className="mt-6 rounded-[22px] border border-[#E07A5F]/30 bg-[#2A1713] p-5 text-center">
                <p className="font-playfair text-[22px] italic text-[#EFEBDD]">
                  “{clusterDetail.reflectionPrompt}”
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-[112px] flex-col items-center gap-1 px-5 py-3 text-[#EFEBDD]/80 transition hover:bg-white/10 hover:text-white"
    >
      <span className="h-5 w-5 text-[#E07A5F] [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <span className="text-[12px] uppercase tracking-[0.08em]">{label}</span>
    </button>
  );
}

function ToolbarDivider() {
  return <div className="h-12 w-px bg-white/20" />;
}
