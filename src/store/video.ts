import { create } from 'zustand';

interface VideoState {
  score: number;
  askedQuestionIds: string[];
  incrementScore: () => void;
  addAskedQuestion: (id: string) => void;
  reset: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  score: 0,
  askedQuestionIds: [],
  incrementScore: () => set((state) => ({ score: state.score + 1 })),
  addAskedQuestion: (id) =>
    set((state) => ({ askedQuestionIds: [...state.askedQuestionIds, id] })),
  reset: () => set({ score: 0, askedQuestionIds: [] }),
}));
