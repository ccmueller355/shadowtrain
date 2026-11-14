// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { TrainerId } from '../types';

export type CyberCueId =
  'countdown_pip' | 'set_complete' | 'rest_complete' | 'interval_work' | 'interval_rest';

export type VoiceEvent = 'rest_done' | 'interval_work' | 'interval_rest' | 'session_finish';

export interface TrainerVoiceProfile {
  pitch: number;
  rate: number;
  quips: Record<VoiceEvent, string[]>;
}

const CUE_ASSETS: Record<CyberCueId, number> = {
  countdown_pip: require('../../assets/audio/countdown_pip.wav'),
  set_complete: require('../../assets/audio/set_complete.wav'),
  rest_complete: require('../../assets/audio/rest_complete.wav'),
  interval_work: require('../../assets/audio/interval_work.wav'),
  interval_rest: require('../../assets/audio/interval_rest.wav'),
};

export const TRAINER_VOICE_PROFILES: Record<TrainerId, TrainerVoiceProfile> = {
  'drone-unit-0': {
    pitch: 0.85,
    rate: 1.05,
    quips: {
      rest_done: ['Rest cycle complete. Engage next set.', 'Biometrics nominal. Resume output.'],
      interval_work: ['Work phase initiated. Execute.', 'Maximum output window active.'],
      interval_rest: ['Recovery window open. Stand by.', 'Cool-down cycle active.'],
      session_finish: ['Telemetry logged. Session complete.', 'Unit zero calibration complete.'],
    },
  },
  'orc-merc': {
    pitch: 0.72,
    rate: 0.92,
    quips: {
      rest_done: ['Time is up, chummer. Back on the iron.', 'Rest over. Move that steel.'],
      interval_work: ['Push it! Leave nothing in the tank.', 'Work window! Hit it hard!'],
      interval_rest: ['Breathe. Shake it out.', 'Catch your breath, next round comes fast.'],
      session_finish: ['Solid run, merc. Iron respects the work.', 'Clean kill. Log your creds.'],
    },
  },
  'human-decker': {
    pitch: 1.12,
    rate: 1.08,
    quips: {
      rest_done: ['Timer zeroed. Jack back in, partner.', 'Green light on the deck. Next set.'],
      interval_work: ['Link hot! Run the sequence!', 'Execute now, stay sharp.'],
      interval_rest: ['Ice cool. Reset your buffer.', 'Drop the load, breathe steady.'],
      session_finish: [
        'Clean run, zero static. Nice work.',
        'Payload delivered. Stay frosty, chummer.',
      ],
    },
  },
  'human-soldier': {
    pitch: 0.88,
    rate: 1.0,
    quips: {
      rest_done: ['Rest expired. Back on station.', 'Clock hit zero. Next set, move.'],
      interval_work: ['Go! Maintain form under load.', 'Engage! Crisp reps only.'],
      interval_rest: ['Hold and recover. Eyes up.', 'Stand down. Control your breathing.'],
      session_finish: [
        'Mission accomplished. Good discipline.',
        'Debrief logged. Solid execution.',
      ],
    },
  },
  'elf-wraith': {
    pitch: 1.02,
    rate: 1.02,
    quips: {
      rest_done: ['Silence ends. Strike the next set.', 'The clock is zero. Flow again.'],
      interval_work: ['Move like smoke. Precision first.', 'Strike now. Zero wasted motion.'],
      interval_rest: ['Stillness. Reset your center.', 'Fade back. Breathe quiet.'],
      session_finish: ['Ghost protocol complete.', 'Sharp and unseen. Well done.'],
    },
  },
  'elf-mage': {
    pitch: 1.15,
    rate: 0.96,
    quips: {
      rest_done: ['Mana recharged. Channel the next set.', 'The weave is ready. Begin.'],
      interval_work: ['Surge! Hold the tension.', 'Channel full power now.'],
      interval_rest: ['Release the current. Breathe deep.', 'Calm the circuit.'],
      session_finish: ['Resonance complete. Brilliant form.', 'Your aura is locked in.'],
    },
  },
};

type DuckHandler = (ducked: boolean) => void;
let duckHandler: DuckHandler | null = null;
let audioModeConfigured = false;
let activeCuePlayer: { remove?: () => void } | null = null;

export function registerRadioDuckHandler(handler: DuckHandler | null): void {
  duckHandler = handler;
}

function getExpoAudio(): typeof import('expo-audio') | null {
  try {
    return require('expo-audio');
  } catch {
    return null;
  }
}

function getExpoSpeech(): typeof import('expo-speech') | null {
  try {
    return require('expo-speech');
  } catch {
    return null;
  }
}

/**
 * Configure cross-platform audio mode so cues play in silent mode and duck
 * external music apps (Spotify, Amazon Music, YouTube Music).
 */
export async function configureCyberAudioMode(): Promise<void> {
  if (audioModeConfigured) return;
  const expoAudio = getExpoAudio();
  if (!expoAudio?.setAudioModeAsync) return;
  try {
    await expoAudio.setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      allowsRecording: false,
      interruptionMode: 'duckOthers',
    });
    audioModeConfigured = true;
  } catch {
    // Non-fatal in headless/web/test environments
  }
}

/** Play a bundled synthesized cyberpunk WAV cue and briefly duck built-in radio. */
export async function playCyberCue(
  cue: CyberCueId,
  options?: { enabled?: boolean },
): Promise<void> {
  if (options?.enabled === false) return;
  await configureCyberAudioMode();
  const expoAudio = getExpoAudio();
  if (!expoAudio?.createAudioPlayer) return;

  try {
    if (activeCuePlayer?.remove) {
      activeCuePlayer.remove();
      activeCuePlayer = null;
    }
    duckHandler?.(true);
    const player = expoAudio.createAudioPlayer(CUE_ASSETS[cue]);
    activeCuePlayer = player;
    player.play();
    setTimeout(() => {
      duckHandler?.(false);
    }, 350);
  } catch {
    duckHandler?.(false);
  }
}

/** Pick a deterministic or rotating trainer quip for a given voice event. */
export function pickTrainerQuip(trainerId: TrainerId, event: VoiceEvent, seed = 0): string {
  const profile = TRAINER_VOICE_PROFILES[trainerId] ?? TRAINER_VOICE_PROFILES['drone-unit-0'];
  const lines = profile.quips[event];
  return lines[Math.abs(seed) % lines.length];
}

/** Speak a trainer voice cue via OS TTS (`expo-speech`), ducking built-in radio. */
export function speakTrainerCue(
  trainerId: TrainerId,
  event: VoiceEvent,
  options?: { enabled?: boolean; seed?: number },
): void {
  if (options?.enabled === false) return;
  const speech = getExpoSpeech();
  if (!speech?.speak) return;

  const profile = TRAINER_VOICE_PROFILES[trainerId] ?? TRAINER_VOICE_PROFILES['drone-unit-0'];
  const text = pickTrainerQuip(trainerId, event, options?.seed ?? Date.now());

  try {
    duckHandler?.(true);
    speech.stop?.();
    speech.speak(text, {
      pitch: profile.pitch,
      rate: profile.rate,
      onDone: () => duckHandler?.(false),
      onStopped: () => duckHandler?.(false),
      onError: () => duckHandler?.(false),
    });
  } catch {
    duckHandler?.(false);
  }
}

export function resetAudioStateForTests(): void {
  audioModeConfigured = false;
  duckHandler = null;
  activeCuePlayer = null;
}
