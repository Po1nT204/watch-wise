import { create } from 'zustand';
import ReactPlayer from 'react-player';

interface PlayerStore {
  playerRef: any | null;
  setPlayerRef: (ref: any | null) => void;
  seekTo: (seconds: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  playerRef: null,
  setPlayerRef: (ref) => set({ playerRef: ref }),
  seekTo: (seconds) => {
    const player = get().playerRef;
    if (player) {
      player.seekTo(seconds, 'seconds');
      // Опционально: можно сразу запускать видео при перемотке
    }
  },
}));
