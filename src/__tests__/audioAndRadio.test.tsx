// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  configureCyberAudioMode,
  pickTrainerQuip,
  playCyberCue,
  registerRadioDuckHandler,
  resetAudioStateForTests,
  speakTrainerCue,
  TRAINER_VOICE_PROFILES,
} from '../engine/audio';
import { RADIO_PRESETS, resolvePresetStation, searchRadioStations } from '../engine/radio';
import { useRadioStore } from '../stores/radioStore';
import { RadioPlayerBar } from '../components/RadioPlayerBar';
import SettingsScreen from '../../app/(tabs)/settings';

const mockPlayer = {
  volume: 1,
  play: jest.fn(),
  pause: jest.fn(),
  replace: jest.fn(),
  remove: jest.fn(),
};

const mockSetAudioModeAsync = jest.fn().mockResolvedValue(undefined);
const mockCreateAudioPlayer = jest.fn(() => ({ ...mockPlayer }));

jest.mock('expo-audio', () => ({
  setAudioModeAsync: (...args: unknown[]) => mockSetAudioModeAsync(...args),
  createAudioPlayer: (...args: unknown[]) => mockCreateAudioPlayer(...args),
}));

const mockSpeak = jest.fn();
const mockStopSpeech = jest.fn();

jest.mock('expo-speech', () => ({
  speak: (...args: unknown[]) => mockSpeak(...args),
  stop: (...args: unknown[]) => mockStopSpeech(...args),
}));

describe('M14: Cyber-Audio Sound Pack & Workout Radio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAudioStateForTests();
    useRadioStore.setState({
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
    });
  });

  describe('audio engine', () => {
    it('configures expo-audio mode with duckOthers and plays synthesized cues', async () => {
      const duckSpy = jest.fn();
      registerRadioDuckHandler(duckSpy);

      await configureCyberAudioMode();
      expect(mockSetAudioModeAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
        }),
      );

      await playCyberCue('rest_complete', { enabled: true });
      expect(mockCreateAudioPlayer).toHaveBeenCalledTimes(1);
      expect(duckSpy).toHaveBeenCalledWith(true);

      await playCyberCue('countdown_pip', { enabled: false });
      expect(mockCreateAudioPlayer).toHaveBeenCalledTimes(1);
    });

    it('speaks trainer-specific quips with distinct pitch/rate and handles ducking callbacks', () => {
      const duckSpy = jest.fn();
      registerRadioDuckHandler(duckSpy);

      const line = pickTrainerQuip('human-decker', 'rest_done', 0);
      expect(line).toBe(TRAINER_VOICE_PROFILES['human-decker'].quips.rest_done[0]);

      speakTrainerCue('human-decker', 'rest_done', { enabled: true, seed: 0 });
      expect(mockStopSpeech).toHaveBeenCalledTimes(1);
      expect(mockSpeak).toHaveBeenCalledWith(
        line,
        expect.objectContaining({
          pitch: TRAINER_VOICE_PROFILES['human-decker'].pitch,
          rate: TRAINER_VOICE_PROFILES['human-decker'].rate,
        }),
      );
      expect(duckSpy).toHaveBeenCalledWith(true);

      const opts = mockSpeak.mock.calls[0][1] as { onDone: () => void };
      opts.onDone();
      expect(duckSpy).toHaveBeenCalledWith(false);

      speakTrainerCue('orc-merc', 'session_finish', { enabled: false });
      expect(mockSpeak).toHaveBeenCalledTimes(1);
    });
  });

  describe('radio discovery & presets', () => {
    it('includes regional workout presets for DACH, Europe, UK, US, JP, CN, ME, IN', () => {
      const regions = new Set(RADIO_PRESETS.map((p) => p.region));
      for (const r of [
        'DE',
        'EU',
        'UK',
        'FR',
        'ES',
        'NL',
        'AT',
        'CH',
        'IT',
        'PL',
        'BE',
        'SE',
        'NO',
        'DK',
        'FI',
        'PT',
        'IE',
        'CZ',
        'GR',
        'HU',
        'RO',
        'US',
        'JP',
        'CN',
        'ME',
        'IN',
      ]) {
        expect(regions.has(r)).toBe(true);
      }
      expect(RADIO_PRESETS.some((p) => p.label === 'Sunshine Live')).toBe(true);
      expect(RADIO_PRESETS.some((p) => p.label === 'Sunshine Live Workout')).toBe(true);
      expect(RADIO_PRESETS.some((p) => p.label === 'ENERGY Live')).toBe(true);
      expect(RADIO_PRESETS.some((p) => p.label === 'DASDING')).toBe(true);
    });

    it('searches radio-browser mirrors, prioritizes HTTPS streams, and falls back on mirror error', async () => {
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 503 })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            {
              stationuuid: 's-http',
              name: 'HTTP Station',
              countrycode: 'de',
              tags: 'electronic',
              url_resolved: 'http://stream.example.com/live.mp3',
              bitrate: 128,
            },
            {
              stationuuid: 's-https',
              name: 'Sunshine Live',
              countrycode: 'de',
              tags: 'techno,trance',
              url_resolved: 'https://stream.example.com/sunshine.mp3',
              bitrate: 192,
            },
          ],
        });
      global.fetch = fetchMock as unknown as typeof fetch;

      const results = await searchRadioStations({ name: 'sunshine', countryCode: 'DE' });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(results[0].id).toBe('s-https');
      expect(results[1].id).toBe('s-http');
    });

    it('falls back to tag search when preset name search returns empty', async () => {
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => [] })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            {
              stationuuid: 'tag-1',
              name: 'Tokyo Electro',
              countrycode: 'JP',
              tags: 'electronic',
              url_resolved: 'https://stream.jp/electro.mp3',
            },
          ],
        });
      global.fetch = fetchMock as unknown as typeof fetch;

      const jpPreset = RADIO_PRESETS.find((p) => p.region === 'JP')!;
      const resolved = await resolvePresetStation(jpPreset);
      expect(resolved?.id).toBe('tag-1');
    });
  });

  describe('radioStore & RadioPlayerBar', () => {
    it('manages toggles, volume clamping, favorites, preset caching, and playback controls', async () => {
      useRadioStore.getState().toggleSound();
      useRadioStore.getState().toggleVoice();
      useRadioStore.getState().setRadioVolume(1.5);
      expect(useRadioStore.getState().soundEnabled).toBe(false);
      expect(useRadioStore.getState().voiceEnabled).toBe(false);
      expect(useRadioStore.getState().radioVolume).toBe(1);

      const station = {
        id: 'sunshine-1',
        name: 'Sunshine Live',
        countryCode: 'DE',
        tags: 'electronic',
        streamUrl: 'https://stream.sunshine-live.de/live/mp3-192',
      };
      useRadioStore.getState().toggleFavorite(station);
      expect(useRadioStore.getState().favorites).toHaveLength(1);
      useRadioStore.getState().toggleFavorite(station);
      expect(useRadioStore.getState().favorites).toHaveLength(0);

      await useRadioStore.getState().playStation(station);
      expect(useRadioStore.getState().isPlaying).toBe(true);
      expect(useRadioStore.getState().activeStation?.id).toBe('sunshine-1');

      useRadioStore.getState().togglePlayPause();
      expect(useRadioStore.getState().isPlaying).toBe(false);
      useRadioStore.getState().togglePlayPause();
      expect(useRadioStore.getState().isPlaying).toBe(true);

      useRadioStore.getState().stopRadio();
      expect(useRadioStore.getState().isPlaying).toBe(false);

      // toggleRadio on/off
      useRadioStore.getState().toggleRadio();
      expect(useRadioStore.getState().radioEnabled).toBe(false);
      useRadioStore.getState().toggleRadio();
      expect(useRadioStore.getState().radioEnabled).toBe(true);

      // playPreset resolves, caches, and replays from cache
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            stationuuid: 'sun-live',
            name: 'Sunshine Live',
            countrycode: 'DE',
            tags: 'techno',
            url_resolved: 'https://stream.sunshine-live.de/live/mp3-192',
          },
        ],
      }) as unknown as typeof fetch;

      await useRadioStore.getState().playPreset(RADIO_PRESETS[0]);
      expect(useRadioStore.getState().resolvedPresetCache[RADIO_PRESETS[0].id]?.id).toBe(
        'sun-live',
      );
      expect(useRadioStore.getState().isPlaying).toBe(true);

      // Second call uses cache (no fetch)
      (global.fetch as jest.Mock).mockClear();
      await useRadioStore.getState().playPreset(RADIO_PRESETS[0]);
      expect(global.fetch).not.toHaveBeenCalled();

      // playPreset handles no-station & fetch errors
      global.fetch = jest
        .fn()
        .mockResolvedValue({ ok: true, json: async () => [] }) as unknown as typeof fetch;
      await useRadioStore.getState().playPreset(RADIO_PRESETS[1]);
      expect(useRadioStore.getState().error).toContain('No live stream found');

      // Overlapping playPreset calls: only the latest request wins
      let resolveFirst!: (val: unknown) => void;
      const firstPromise = new Promise((r) => {
        resolveFirst = r;
      });
      global.fetch = jest
        .fn()
        .mockReturnValueOnce(firstPromise)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            {
              stationuuid: 'winner-2',
              name: 'Winner Stream',
              countrycode: 'DE',
              tags: 'dance',
              url_resolved: 'https://stream.example.com/winner.mp3',
            },
          ],
        }) as unknown as typeof fetch;

      const p1 = useRadioStore.getState().playPreset(RADIO_PRESETS[2]);
      const p2 = useRadioStore.getState().playPreset(RADIO_PRESETS[3]);
      await p2;
      resolveFirst({
        ok: true,
        json: async () => [
          {
            stationuuid: 'stale-1',
            name: 'Stale Stream',
            countrycode: 'DE',
            tags: 'dance',
            url_resolved: 'https://stream.example.com/stale.mp3',
          },
        ],
      });
      await p1;
      expect(useRadioStore.getState().activeStation?.id).toBe('winner-2');
    });

    it('renders RadioPlayerBar, opens station modal, searches stations, and plays custom URL', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            stationuuid: 'res-1',
            name: 'Nightwave Plaza',
            countrycode: 'US',
            tags: 'synthwave',
            url_resolved: 'https://plaza.one/mp3',
            bitrate: 128,
          },
        ],
      }) as unknown as typeof fetch;

      const { getByTestId, getByText } = render(<RadioPlayerBar />);
      fireEvent.press(getByTestId('radio-vol-down'));
      fireEvent.press(getByTestId('radio-vol-up'));

      // Open full-screen station picker modal
      fireEvent.press(getByTestId('radio-open-picker'));
      expect(getByText('[DE] Sunshine Live Workout')).toBeTruthy();

      fireEvent.press(getByTestId(`radio-preset-${RADIO_PRESETS[0].id}`));

      await waitFor(() => {
        expect(getByTestId('radio-fav-btn')).toBeTruthy();
      });

      fireEvent.press(getByTestId('radio-fav-btn'));
      expect(useRadioStore.getState().favorites).toHaveLength(1);
      fireEvent.press(getByTestId('radio-play-pause-btn'));
      fireEvent.press(getByTestId('radio-stop-btn'));

      fireEvent.press(getByTestId('radio-open-picker'));
      fireEvent.press(getByTestId(`radio-preset-fav-${RADIO_PRESETS[0].id}`));
      expect(useRadioStore.getState().favorites).toHaveLength(0);

      fireEvent.changeText(getByTestId('radio-search-input'), 'synthwave');
      fireEvent.press(getByTestId('radio-search-submit'));

      await waitFor(() => {
        expect(getByTestId('radio-result-res-1')).toBeTruthy();
      });

      fireEvent.press(getByTestId('radio-result-fav-res-1'));
      expect(useRadioStore.getState().favorites).toHaveLength(1);
      fireEvent.press(getByTestId('radio-fav-toggle-res-1'));
      expect(useRadioStore.getState().favorites).toHaveLength(0);
      fireEvent.press(getByTestId('radio-result-res-1'));
      await waitFor(() => {
        expect(useRadioStore.getState().activeStation?.id).toBe('res-1');
      });

      fireEvent.press(getByTestId('radio-open-picker'));
      fireEvent.changeText(getByTestId('radio-custom-url-input'), 'https://my.stream/live.mp3');
      fireEvent.press(getByTestId('radio-custom-url-play'));
      await waitFor(() => {
        expect(useRadioStore.getState().activeStation?.name).toBe('Custom Stream');
      });
    });

    it('throws when all radio-browser mirrors fail and handles Settings audio/radio toggles', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValue(new Error('Network down')) as unknown as typeof fetch;
      await expect(searchRadioStations({ name: 'test' })).rejects.toThrow('Network down');

      const { getByTestId, queryByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('toggle-sound-cues'));
      fireEvent.press(getByTestId('toggle-sound-cues'));
      fireEvent.press(getByTestId('toggle-voice-cues'));
      fireEvent.press(getByTestId('toggle-voice-cues'));
      expect(queryByTestId('radio-player-bar')).toBeNull();
      fireEvent.press(getByTestId('toggle-workout-radio'));
      expect(getByTestId('radio-player-bar')).toBeTruthy();
    });
  });
});
