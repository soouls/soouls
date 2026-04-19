'use client';

import { Clock, Image as ImageIcon, ListTodo, Mic, PenTool, StopCircle } from 'lucide-react';
import type { ReactNode } from 'react';

function ToolButton({
  icon,
  label,
  count,
  onClick,
  active,
}: {
  icon: ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 flex-1 items-center justify-center gap-2 px-5 py-4 text-sm whitespace-nowrap transition-colors ${
        active ? 'bg-red-500/[0.08] text-red-400' : 'text-slate-300 hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
      {!!count && count > 0 && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5C35] text-[9px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}

export function EntryActionRail({
  imageCount,
  voiceCount,
  doodleCount,
  tasklistCount,
  goalCount,
  recording,
  elapsed,
  onAddImage,
  onToggleRecording,
  onAddDoodle,
  onAddTasklist,
  onAddGoal,
}: {
  imageCount: number;
  voiceCount: number;
  doodleCount: number;
  tasklistCount: number;
  goalCount: number;
  recording: boolean;
  elapsed: number;
  onAddImage: () => void;
  onToggleRecording: () => void;
  onAddDoodle: () => void;
  onAddTasklist: () => void;
  onAddGoal: () => void;
}) {
  const recordingLabel = recording
    ? `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`
    : 'Voice note';

  return (
    <div className="border-t border-white/[0.06] flex items-stretch divide-x divide-white/[0.06]">
      <ToolButton
        icon={<ImageIcon className="h-4 w-4 text-[#FF5C35]" />}
        label="Add image"
        count={imageCount}
        onClick={onAddImage}
      />
      <ToolButton
        icon={
          recording ? (
            <StopCircle className="h-4 w-4 animate-pulse text-red-400" />
          ) : (
            <Mic className="h-4 w-4 text-[#FF5C35]" />
          )
        }
        label={recordingLabel}
        count={!recording ? voiceCount : 0}
        onClick={onToggleRecording}
        active={recording}
      />
      <ToolButton
        icon={<PenTool className="h-4 w-4 text-[#FF5C35]" />}
        label="Doodle"
        count={doodleCount}
        onClick={onAddDoodle}
      />
      <ToolButton
        icon={<ListTodo className="h-4 w-4 text-[#FF5C35]" />}
        label="Tasklist"
        count={tasklistCount}
        onClick={onAddTasklist}
      />
      <ToolButton
        icon={<Clock className="h-4 w-4 text-[#FF5C35]" />}
        label="Set time"
        count={goalCount}
        onClick={onAddGoal}
      />
    </div>
  );
}
