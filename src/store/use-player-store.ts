import { create } from 'zustand';

interface PlayerStore {
  seekToTime: number | null;
  seekNonce: number; // Счётчик для повторных кликов по одному таймкоду
  seekTo: (seconds: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  seekToTime: null,
  seekNonce: 0,
  seekTo: (seconds) =>
    set((state) => ({
      seekToTime: seconds,
      seekNonce: state.seekNonce + 1,
    })),
}));
