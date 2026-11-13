// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───

export type IntervalTimerMode = 'off' | 'emom' | 'tabata' | 'rounds';
export type IntervalPhase = 'prep' | 'work' | 'rest' | 'complete';

export interface IntervalTimerConfig {
  mode: IntervalTimerMode;
  rounds: number;
  workSec: number;
  restSec: number;
  prepSec?: number;
}

export interface IntervalTimerState {
  mode: IntervalTimerMode;
  running: boolean;
  phase: IntervalPhase;
  currentRound: number;
  totalRounds: number;
  remainingSec: number;
  workSec: number;
  restSec: number;
  prepSec: number;
  totalElapsedSec: number;
}

export const INTERVAL_PRESETS: Record<string, { label: string; config: IntervalTimerConfig }> = {
  'emom-10': {
    label: 'EMOM · 10 ROUNDS (60s)',
    config: { mode: 'emom', rounds: 10, workSec: 60, restSec: 0, prepSec: 5 },
  },
  'emom-15': {
    label: 'EMOM · 15 ROUNDS (60s)',
    config: { mode: 'emom', rounds: 15, workSec: 60, restSec: 0, prepSec: 5 },
  },
  'tabata-standard': {
    label: 'TABATA · 8 ROUNDS (20s/10s)',
    config: { mode: 'tabata', rounds: 8, workSec: 20, restSec: 10, prepSec: 5 },
  },
  'hiit-40-20': {
    label: 'HIIT · 10 ROUNDS (40s/20s)',
    config: { mode: 'tabata', rounds: 10, workSec: 40, restSec: 20, prepSec: 5 },
  },
  'combat-rounds': {
    label: 'COMBAT · 5 ROUNDS (3m/1m)',
    config: { mode: 'rounds', rounds: 5, workSec: 180, restSec: 60, prepSec: 10 },
  },
};

export const INITIAL_INTERVAL_STATE: IntervalTimerState = {
  mode: 'off',
  running: false,
  phase: 'prep',
  currentRound: 1,
  totalRounds: 10,
  remainingSec: 0,
  workSec: 60,
  restSec: 0,
  prepSec: 5,
  totalElapsedSec: 0,
};

export function createIntervalTimer(config: Partial<IntervalTimerConfig>): IntervalTimerState {
  const mode = config.mode ?? 'emom';
  const rounds = Math.max(1, config.rounds ?? 10);
  const workSec = Math.max(1, config.workSec ?? 60);
  const restSec = Math.max(0, config.restSec ?? (mode === 'tabata' ? 10 : 0));
  const prepSec = Math.max(0, config.prepSec ?? 5);

  return {
    mode,
    running: false,
    phase: prepSec > 0 ? 'prep' : 'work',
    currentRound: 1,
    totalRounds: rounds,
    remainingSec: prepSec > 0 ? prepSec : workSec,
    workSec,
    restSec,
    prepSec,
    totalElapsedSec: 0,
  };
}

export interface TickResult {
  nextState: IntervalTimerState;
  didPhaseChange: boolean;
  didRoundChange: boolean;
  didComplete: boolean;
}

export function tickIntervalTimer(state: IntervalTimerState): TickResult {
  if (!state.running || state.phase === 'complete') {
    return {
      nextState: state,
      didPhaseChange: false,
      didRoundChange: false,
      didComplete: false,
    };
  }

  const nextElapsed = state.totalElapsedSec + 1;

  if (state.remainingSec > 1) {
    return {
      nextState: {
        ...state,
        remainingSec: state.remainingSec - 1,
        totalElapsedSec: nextElapsed,
      },
      didPhaseChange: false,
      didRoundChange: false,
      didComplete: false,
    };
  }

  // Phase transition triggered:
  if (state.phase === 'prep') {
    return {
      nextState: {
        ...state,
        phase: 'work',
        remainingSec: state.workSec,
        totalElapsedSec: nextElapsed,
      },
      didPhaseChange: true,
      didRoundChange: false,
      didComplete: false,
    };
  }

  if (state.phase === 'work') {
    // If there is rest time, transition to rest
    if (state.restSec > 0) {
      return {
        nextState: {
          ...state,
          phase: 'rest',
          remainingSec: state.restSec,
          totalElapsedSec: nextElapsed,
        },
        didPhaseChange: true,
        didRoundChange: false,
        didComplete: false,
      };
    }

    // No rest (e.g. pure EMOM)
    if (state.currentRound >= state.totalRounds) {
      return {
        nextState: {
          ...state,
          running: false,
          phase: 'complete',
          remainingSec: 0,
          totalElapsedSec: nextElapsed,
        },
        didPhaseChange: true,
        didRoundChange: false,
        didComplete: true,
      };
    }

    return {
      nextState: {
        ...state,
        currentRound: state.currentRound + 1,
        phase: 'work',
        remainingSec: state.workSec,
        totalElapsedSec: nextElapsed,
      },
      didPhaseChange: false,
      didRoundChange: true,
      didComplete: false,
    };
  }

  if (state.phase === 'rest') {
    if (state.currentRound >= state.totalRounds) {
      return {
        nextState: {
          ...state,
          running: false,
          phase: 'complete',
          remainingSec: 0,
          totalElapsedSec: nextElapsed,
        },
        didPhaseChange: true,
        didRoundChange: false,
        didComplete: true,
      };
    }

    return {
      nextState: {
        ...state,
        currentRound: state.currentRound + 1,
        phase: 'work',
        remainingSec: state.workSec,
        totalElapsedSec: nextElapsed,
      },
      didPhaseChange: true,
      didRoundChange: true,
      didComplete: false,
    };
  }

  return {
    nextState: state,
    didPhaseChange: false,
    didRoundChange: false,
    didComplete: false,
  };
}

export function formatIntervalTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
