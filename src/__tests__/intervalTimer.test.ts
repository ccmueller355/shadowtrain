// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import {
  createIntervalTimer,
  formatIntervalTime,
  INTERVAL_PRESETS,
  tickIntervalTimer,
} from '../engine/intervalTimer';

describe('Round-Based & Interval Timer Engine (M12)', () => {
  it('formats seconds into MM:SS display cleanly', () => {
    expect(formatIntervalTime(0)).toBe('00:00');
    expect(formatIntervalTime(5)).toBe('00:05');
    expect(formatIntervalTime(65)).toBe('01:05');
    expect(formatIntervalTime(180)).toBe('03:00');
  });

  it('creates an EMOM timer with default prep and work phases', () => {
    const timer = createIntervalTimer({ mode: 'emom', rounds: 10, workSec: 60, prepSec: 5 });
    expect(timer.mode).toBe('emom');
    expect(timer.currentRound).toBe(1);
    expect(timer.totalRounds).toBe(10);
    expect(timer.phase).toBe('prep');
    expect(timer.remainingSec).toBe(5);
    expect(timer.running).toBe(false);
  });

  it('transitions from prep to work phase when prep counts down', () => {
    let state = createIntervalTimer({ mode: 'emom', rounds: 5, workSec: 60, prepSec: 2 });
    state = { ...state, running: true };

    const tick1 = tickIntervalTimer(state);
    expect(tick1.nextState.phase).toBe('prep');
    expect(tick1.nextState.remainingSec).toBe(1);
    expect(tick1.didPhaseChange).toBe(false);

    const tick2 = tickIntervalTimer(tick1.nextState);
    expect(tick2.nextState.phase).toBe('work');
    expect(tick2.nextState.remainingSec).toBe(60);
    expect(tick2.didPhaseChange).toBe(true);
  });

  it('advances rounds on EMOM work completion when restSec is 0', () => {
    let state = createIntervalTimer({
      mode: 'emom',
      rounds: 3,
      workSec: 1,
      restSec: 0,
      prepSec: 0,
    });
    state = { ...state, running: true, phase: 'work', remainingSec: 1, currentRound: 1 };

    const tick = tickIntervalTimer(state);
    expect(tick.didRoundChange).toBe(true);
    expect(tick.nextState.currentRound).toBe(2);
    expect(tick.nextState.phase).toBe('work');
    expect(tick.nextState.remainingSec).toBe(1);
  });

  it('transitions work -> rest -> next round in Tabata intervals', () => {
    let state = createIntervalTimer({
      mode: 'tabata',
      rounds: 8,
      workSec: 1,
      restSec: 1,
      prepSec: 0,
    });
    state = { ...state, running: true, phase: 'work', remainingSec: 1, currentRound: 1 };

    // 1. Work ends -> switches to rest
    const toRest = tickIntervalTimer(state);
    expect(toRest.didPhaseChange).toBe(true);
    expect(toRest.nextState.phase).toBe('rest');
    expect(toRest.nextState.remainingSec).toBe(1);
    expect(toRest.nextState.currentRound).toBe(1);

    // 2. Rest ends -> switches to work of round 2
    const toWorkRound2 = tickIntervalTimer(toRest.nextState);
    expect(toWorkRound2.didPhaseChange).toBe(true);
    expect(toWorkRound2.didRoundChange).toBe(true);
    expect(toWorkRound2.nextState.phase).toBe('work');
    expect(toWorkRound2.nextState.currentRound).toBe(2);
  });

  it('completes timer when last round finishes', () => {
    let state = createIntervalTimer({
      mode: 'emom',
      rounds: 2,
      workSec: 1,
      restSec: 0,
      prepSec: 0,
    });
    state = { ...state, running: true, phase: 'work', remainingSec: 1, currentRound: 2 };

    const tick = tickIntervalTimer(state);
    expect(tick.didComplete).toBe(true);
    expect(tick.nextState.phase).toBe('complete');
    expect(tick.nextState.running).toBe(false);
  });

  it('loads presets correctly', () => {
    const tabata = INTERVAL_PRESETS['tabata-standard'];
    expect(tabata).toBeDefined();
    expect(tabata.config.workSec).toBe(20);
    expect(tabata.config.restSec).toBe(10);
    expect(tabata.config.rounds).toBe(8);

    const timer = createIntervalTimer(tabata.config);
    expect(timer.totalRounds).toBe(8);
    expect(timer.workSec).toBe(20);
    expect(timer.restSec).toBe(10);
  });
});
