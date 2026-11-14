// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { configureCyberAudioMode, registerRadioDuckHandler } from '../engine/audio';
import { RadioPreset, RadioStation, resolvePresetStation } from '../engine/radio';

interface StreamPlayer {
  volume: number;
  play: () => void;
  pause: () => void;
  remove?: () => void;
}

interface RadioState {
  soundEnabled: boolean;
  voiceEnabled: boolean;
  radioEnabled: boolean;
  radioVolume: number;
  favorites: RadioStation[];
  resolvedPresetCache: Record<string, RadioStation>;
  customStreamUrl: string;
  activeStation: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  toggleSound: () => void;
  toggleVoice: () => void;
  toggleRadio: () => void;
  setRadioVolume: (vol: number) => void;
  setCustomStreamUrl: (url: string) => void;
  toggleFavorite: (station: RadioStation) => void;
  playStation: (station: RadioStation) => Promise<void>;
  playPreset: (preset: RadioPreset) => Promise<void>;
  togglePlayPause: () => void;
  stopRadio: () => void;
}

const memoryFallback = new Map<string, string>();

const safeStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const mod = require('@react-native-async-storage/async-storage');
      const s = (mod?.default ?? mod) as StateStorage | undefined;
      if (s && typeof s.getItem === 'function') return await s.getItem(name);
    } catch {
      // Fallback below
    }
    return memoryFallback.get(name) ?? null;
  },
  setItem: async (name, value) => {
    try {
      const mod = require('@react-native-async-storage/async-storage');
      const s = (mod?.default ?? mod) as StateStorage | undefined;
      if (s && typeof s.setItem === 'function') {
        await s.setItem(name, value);
        return;
      }
    } catch {
      // Fallback below
    }
    memoryFallback.set(name, value);
  },
  removeItem: async (name) => {
    try {
      const mod = require('@react-native-async-storage/async-storage');
      const s = (mod?.default ?? mod) as StateStorage | undefined;
      if (s && typeof s.removeItem === 'function') {
        await s.removeItem(name);
        return;
      }
    } catch {
      // Fallback below
    }
    memoryFallback.delete(name);
  },
};

let streamPlayer: StreamPlayer | null = null;
let isDucked = false;

function getExpoAudio(): typeof import('expo-audio') | null {
  try {
    return require('expo-audio');
  } catch {
    return null;
  }
}

function applyEffectiveVolume(baseVolume: number): void {
  if (!streamPlayer) return;
  streamPlayer.volume = isDucked ? Math.min(baseVolume, 0.2) : baseVolume;
}

function teardownStreamPlayer(): void {
  if (streamPlayer) {
    try {
      streamPlayer.pause();
      streamPlayer.remove?.();
    } catch {
      // Ignore cleanup errors
    }
    streamPlayer = null;
  }
}

export const useRadioStore = create<RadioState>()(
  persist(
    (set, get) => {
      registerRadioDuckHandler((ducked) => {
        isDucked = ducked;
        applyEffectiveVolume(get().radioVolume);
      });

      return {
        soundEnabled: true,
        voiceEnabled: true,
        radioEnabled: false,
        radioVolume: 0.7,
        favorites: [],
        resolvedPresetCache: {},
        customStreamUrl: '',
        activeStation: null,
        isPlaying: false,
        isLoading: false,
        error: null,

        toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
        toggleVoice: () => set((s) => ({ voiceEnabled: !s.voiceEnabled })),
        toggleRadio: () => {
          const next = !get().radioEnabled;
          if (!next) {
            teardownStreamPlayer();
            set({ radioEnabled: false, isPlaying: false, isLoading: false, error: null });
          } else {
            set({ radioEnabled: true });
          }
        },

        setRadioVolume: (vol) => {
          const clamped = Math.max(0.1, Math.min(1, Number(vol.toFixed(2))));
          set({ radioVolume: clamped });
          applyEffectiveVolume(clamped);
        },

        setCustomStreamUrl: (customStreamUrl) => set({ customStreamUrl }),

        toggleFavorite: (station) =>
          set((s) => {
            const exists = s.favorites.some((f) => f.id === station.id);
            return {
              favorites: exists
                ? s.favorites.filter((f) => f.id !== station.id)
                : [station, ...s.favorites],
            };
          }),

        playStation: async (station) => {
          set({
            radioEnabled: true,
            activeStation: station,
            isLoading: true,
            error: null,
          });
          await configureCyberAudioMode();
          teardownStreamPlayer();

          const expoAudio = getExpoAudio();
          if (!expoAudio?.createAudioPlayer) {
            set({ isLoading: false, isPlaying: false, error: 'Audio player unavailable' });
            return;
          }

          try {
            const player = expoAudio.createAudioPlayer({ uri: station.streamUrl }) as StreamPlayer;
            streamPlayer = player;
            applyEffectiveVolume(get().radioVolume);
            player.play();
            set({ isPlaying: true, isLoading: false, error: null });
          } catch (err) {
            set({
              isPlaying: false,
              isLoading: false,
              error: err instanceof Error ? err.message : 'Stream failed',
            });
          }
        },

        playPreset: async (preset) => {
          const cached = get().resolvedPresetCache[preset.id];
          if (cached) {
            await get().playStation(cached);
            return;
          }
          set({ radioEnabled: true, isLoading: true, error: null });
          try {
            const resolved = await resolvePresetStation(preset);
            if (!resolved) {
              set({ isLoading: false, error: `No live stream found for ${preset.label}` });
              return;
            }
            set((s) => ({
              resolvedPresetCache: { ...s.resolvedPresetCache, [preset.id]: resolved },
            }));
            await get().playStation(resolved);
          } catch (err) {
            set({
              isLoading: false,
              error: err instanceof Error ? err.message : 'Radio lookup failed',
            });
          }
        },

        togglePlayPause: () => {
          const { isPlaying, activeStation } = get();
          if (!activeStation) return;
          if (!streamPlayer) {
            void get().playStation(activeStation);
            return;
          }
          if (isPlaying) {
            streamPlayer.pause();
            set({ isPlaying: false });
          } else {
            applyEffectiveVolume(get().radioVolume);
            streamPlayer.play();
            set({ isPlaying: true });
          }
        },

        stopRadio: () => {
          teardownStreamPlayer();
          set({ isPlaying: false, isLoading: false, error: null });
        },
      };
    },
    {
      name: 'shadowtrain-radio-v1',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        voiceEnabled: state.voiceEnabled,
        radioEnabled: state.radioEnabled,
        radioVolume: state.radioVolume,
        favorites: state.favorites,
        resolvedPresetCache: state.resolvedPresetCache,
        customStreamUrl: state.customStreamUrl,
      }),
    },
  ),
);
