// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
export type ThemeName = 'fixer' | 'stuffer' | 'decker' | 'cyber' | 'terminal';
export type Goal = 'strength' | 'hypertrophy' | 'endurance';
export type Experience = 'novice' | 'intermediate' | 'advanced';
export type Units = 'kg' | 'lb';
export type TrackingType = 'reps' | 'duration';
export type DifficultyTier = 'beginner' | 'mid' | 'advanced';
export type SessionDuration = 'express' | 'standard' | 'beast';
export type TrainerId =
  'orc-merc' | 'human-decker' | 'human-soldier' | 'elf-mage' | 'elf-wraith' | 'drone-unit-0';

export type Equipment =
  | 'kettlebell'
  | 'rings'
  | 'bodyweight'
  | 'hand_gripper'
  | 'jump_rope'
  | 'stretching'
  | 'dumbbell'
  | 'barbell'
  | 'bands'
  | 'cable'
  | 'machine';

export interface Profile {
  goal: Goal;
  experience: Experience;
  units: Units;
  repRange: { min: number; max: number };
  increments: Record<string, number>;
  availableEquipment: Equipment[];
  fixedKettlebellWeight?: number;
  activeTrainerId?: TrainerId;
  unlockedTrainerIds?: TrainerId[];
  creds?: number;
  activeProgramId?: string;
  weeklyTargetDays?: number;
  targetDuration?: SessionDuration;
  claimedRewardIds?: string[];
}

export interface Exercise {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment: Equipment;
  category?: string;
  trackingType: TrackingType;
  tier?: DifficultyTier;
  nextProgressionId?: string;
  imageStart?: string;
  imageEnd?: string;
  instructions?: string[];
}

export interface Session {
  id: string;
  startedAt: number;
  finishedAt?: number;
  name?: string;
  notes?: string;
  entries: Entry[];
}

export interface Entry {
  id: string;
  exerciseId: string;
  position: number;
  sets: SetRecord[];
  notes?: string;
}

export interface SetRecord {
  id: string;
  reps?: number;
  weight?: number;
  durationSec?: number;
  rpe?: number;
  completed: boolean;
  isWarmup: boolean;
}
