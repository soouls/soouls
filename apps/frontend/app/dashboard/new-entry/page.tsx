'use client';

import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Clock, Image as ImageIcon, ListTodo, Loader2, Mic, PenTool } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { trpc } from '../../../src/utils/trpc';

export default function NewEntryPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialId = searchParams.get('id');
  const [content, setContent] = useState('');
  const [entryId, setEntryId] = useState<string | null>(initialId);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // ─── Stable refs ──────────────────────────────────────────────────────────
  // Mutations stored in refs so they never cause useCallback to change identity
  const createMutation = trpc.private.entries.create.useMutation();
  const updateMutation = trpc.private.entries.update.useMutation();
  const createMutateRef = useRef(createMutation.mutateAsync);
  const updateMutateRef = useRef(updateMutation.mutateAsync);
  useEffect(() => {
    createMutateRef.current = createMutation.mutateAsync;
  });
  useEffect(() => {
    updateMutateRef.current = updateMutation.mutateAsync;
  });

  const contentRef = useRef('');
  const entryIdRef = useRef<string | null>(initialId);
  const isSavingRef = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef<string | undefined>(undefined);

  // Keep refs in sync with latest state
  useEffect(() => {
    contentRef.current = content;
  }, [content]);
  useEffect(() => {
    entryIdRef.current = entryId;
  }, [entryId]);
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  // Auto-dismiss "Saved" after 2.5s
  useEffect(() => {
    if (saveStatus !== 'saved') return;
    const t = setTimeout(() => setSaveStatus('idle'), 2500);
    return () => clearTimeout(t);
  }, [saveStatus]);

  // ─── Fetch existing entry (for edit mode) ─────────────────────────────────
  const { data: existingEntry } = trpc.private.entries.getOne.useQuery(
    { id: initialId ?? '' },
    { enabled: !!initialId },
  );
  useEffect(() => {
    if (existingEntry && !contentRef.current) {
      setContent(existingEntry.content || '');
      setEntryId(existingEntry.id);
    }
  }, [existingEntry]);

  // ─── Core save function (uses refs only — never changes identity) ──────────
  const performSave = useRef(async (text: string, id: string | null) => {
    if (!text.trim() || !userIdRef.current || isSavingRef.current) return;

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      if (!id) {
        const newEntry = await createMutateRef.current({ content: text, type: 'entry' });
        setEntryId(newEntry.id);
        entryIdRef.current = newEntry.id;
      } else {
        await updateMutateRef.current({ id, content: text });
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error('Auto-save failed:', err);
      setSaveStatus('idle');
    } finally {
      isSavingRef.current = false;
    }
  });

  // ─── 1-second debounce — depends only on content changes ─────────────────
  useEffect(() => {
    if (!content.trim()) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      performSave.current(contentRef.current, entryIdRef.current);
    }, 1000);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [content]); // ← ONLY content; no function references = no re-render loop

  // ─── Save on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (contentRef.current.trim() && !isSavingRef.current) {
        performSave.current(contentRef.current, entryIdRef.current);
      }
    };
  }, []); // runs once on mount/unmount only

  // ─── Save before navigating home ─────────────────────────────────────────
  const handleHomeClick = async () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (contentRef.current.trim() && !isSavingRef.current) {
      await performSave.current(contentRef.current, entryIdRef.current);
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#222222] text-white flex flex-col relative overflow-hidden items-center">
      {/* Background Text Overlay */}
      <div
        className="absolute top-[144px] left-[74px] flex justify-center pointer-events-none select-none z-0 whitespace-nowrap"
        aria-hidden="true"
      >
        <span
          className="font-editorial text-[280px] leading-[1em] text-transparent tracking-[-0.035em]"
          style={{ WebkitTextStroke: '1.85px #FFFFFF' }}
        >
          Soulcanvas
        </span>
      </div>

      {/* Header */}
      <header className="flex justify-between w-full max-w-[1401px] pt-10 px-10 relative z-10">
        <button
          type="button"
          onClick={handleHomeClick}
          className="text-[#E07A5F] text-[32px] font-urbanist leading-[1em] tracking-[-0.035em] bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity p-0 m-0"
        >
          Home/New Entry
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center justify-end min-w-[100px] h-8 relative">
            <AnimatePresence mode="wait">
              {saveStatus === 'saving' && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 text-slate-500 text-sm"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </motion.div>
              )}
              {saveStatus === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, scale: 0.5, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="Profile"
              className="w-[60px] h-[60px] rounded-[100px] object-cover shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
            />
          ) : (
            <div className="w-[60px] h-[60px] rounded-[100px] bg-slate-800 shadow-[0px_4px_4px_rgba(0,0,0,0.25)]" />
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 mt-[80px] mb-10 w-[1450px] h-[782px] bg-[rgba(15,15,15,0.5)] border border-[#222222] rounded-[16px] backdrop-blur-[60px] flex flex-col p-[40px]">

        {/* Editor Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Drop new entry..."
          className="w-full flex-1 bg-transparent border-none outline-none resize-none text-[36px] font-urbanist text-[#E6E2D6] placeholder:text-[#7A7A7A] focus:ring-0 leading-[1em] tracking-[-0.035em] p-0"
        />

        {/* Bottom Section Wrap */}
        <div className="absolute bottom-[30px] left-0 right-0 flex flex-col items-center gap-[30px] pointer-events-none">

          {/* Tooltip Float */}
          <div className="flex flex-col items-center">
            <div className="bg-[#1C1C1C] border-[0.5px] border-[#7A7A7A] rounded-[24px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] px-[25px] py-[13px] pointer-events-auto">
              <span className="text-[#A8A8A8] font-urbanist text-[24px] leading-[1em] tracking-[-0.035em]">
                Add if it helps you remember
              </span>
            </div>
            {/* Tooltip Chevron */}
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-[#7A7A7A] relative top-[-0.5px]">
              <div className="absolute top-[-16px] left-[-14px] w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[14px] border-t-[#1C1C1C]" />
            </div>
          </div>

          {/* Controls Toolbar */}
          <div className="flex flex-row items-center border border-[#7A7A7A] rounded-[60px] bg-[#222222] pointer-events-auto overflow-hidden h-[60px]">

            <button className="flex items-center gap-[10px] px-[16px] py-[32px] hover:bg-white/5 transition-colors h-full">
              <ImageIcon className="w-[24px] h-[24px] text-white" />
              <span className="font-urbanist text-[24px] leading-[1em] tracking-[-0.035em] text-[#E6E2D6]">
                Add image
              </span>
            </button>

            <div className="w-[1.5px] h-full bg-[#434343]" />

            <button className="flex items-center gap-[10px] px-[16px] py-[32px] hover:bg-white/5 transition-colors h-full">
              <Mic className="w-[24px] h-[24px] text-white" />
              <span className="font-editorial text-[24px] leading-[1em] tracking-[-0.035em] text-[#E6E2D6]">
                Voice note
              </span>
            </button>

            <div className="w-[1.5px] h-full bg-[#434343]" />

            <button className="flex items-center gap-[10px] px-[16px] py-[32px] hover:bg-white/5 transition-colors h-full">
              <PenTool className="w-[24px] h-[24px] text-white" />
              <span className="font-editorial text-[24px] leading-[1em] tracking-[-0.035em] text-[#E6E2D6]">
                Doodle
              </span>
            </button>

            <div className="w-[1.5px] h-full bg-[#434343]" />

            <button className="flex items-center gap-[10px] px-[16px] py-[32px] hover:bg-white/5 transition-colors h-full">
              <ListTodo className="w-[24px] h-[24px] text-white" />
              <span className="font-editorial text-[24px] leading-[1em] tracking-[-0.035em] text-[#E6E2D6]">
                Tasklist
              </span>
            </button>

            <div className="w-[1.5px] h-full bg-[#434343]" />

            <button className="flex items-center gap-[10px] px-[16px] py-[32px] hover:bg-white/5 transition-colors h-full">
              <Clock className="w-[24px] h-[24px] text-white" />
              <span className="font-editorial text-[24px] leading-[1em] tracking-[-0.035em] text-[#E6E2D6]">
                Set time
              </span>
            </button>

          </div>
        </div>
      </main>
    </div>
  );
}
