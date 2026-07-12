import { create } from 'zustand';

interface EntryStore {
  activeBlockId: string | null;
  setActiveBlockId: (id: string | null) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
}

export const useEntryStore = create<EntryStore>((set) => ({
  activeBlockId: null,
  setActiveBlockId: (id) => set({ activeBlockId: id }),
  isRecording: false,
  setIsRecording: (isRecording) => set({ isRecording }),
}));
