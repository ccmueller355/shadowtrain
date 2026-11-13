// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { create } from 'zustand';
import { getTrainerById, isTrainerUnlocked } from '../engine/trainers';
import { Equipment, Goal, Profile, SessionDuration, ThemeName, TrainerId, Units } from '../types';

export const DEFAULT_EQUIPMENT: Equipment[] = [
  'kettlebell',
  'rings',
  'bodyweight',
  'hand_gripper',
  'jump_rope',
  'stretching',
];

export const GOAL_REP_RANGES: Record<Goal, { min: number; max: number }> = {
  strength: { min: 3, max: 5 },
  hypertrophy: { min: 8, max: 12 },
  endurance: { min: 15, max: 20 },
};

export const DEFAULT_PROFILE: Profile = {
  goal: 'hypertrophy',
  experience: 'intermediate',
  units: 'kg',
  repRange: { min: 8, max: 12 },
  increments: {
    kettlebell: 0,
    rings: 0,
    bodyweight: 0,
    hand_gripper: 0,
    jump_rope: 0,
    stretching: 0,
    barbell: 2.5,
    dumbbell: 2,
    machine: 5,
    cable: 2.5,
  },
  availableEquipment: DEFAULT_EQUIPMENT,
  fixedKettlebellWeight: 16,
  activeTrainerId: 'orc-merc',
  unlockedTrainerIds: ['orc-merc'],
  creds: 0,
  activeProgramId: 'heavy-iron-pit',
  weeklyTargetDays: 4,
  targetDuration: 'standard',
  claimedRewardIds: [],
};

interface ProfileState {
  profile: Profile;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  setGoal: (goal: Goal) => void;
  setUnits: (units: Units) => void;
  setFixedKettlebellWeight: (weight: number) => void;
  setWeeklyTargetDays: (days: number) => void;
  setTargetDuration: (duration: SessionDuration) => void;
  toggleEquipment: (equipment: Equipment) => void;
  addCreds: (amount: number) => void;
  claimReward: (claimId: string, amount: number) => boolean;
  unlockAndSelectTrainer: (trainerId: TrainerId) => boolean;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  theme: 'fixer',
  setTheme: (theme) => set({ theme }),
  updateProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
  setGoal: (goal) =>
    set((state) => ({
      profile: {
        ...state.profile,
        goal,
        repRange: GOAL_REP_RANGES[goal],
      },
    })),
  setUnits: (units) =>
    set((state) => ({
      profile: { ...state.profile, units },
    })),
  setFixedKettlebellWeight: (weight) =>
    set((state) => ({
      profile: { ...state.profile, fixedKettlebellWeight: weight },
    })),
  setWeeklyTargetDays: (days) =>
    set((state) => ({
      profile: { ...state.profile, weeklyTargetDays: Math.min(7, Math.max(1, days)) },
    })),
  setTargetDuration: (targetDuration) =>
    set((state) => ({
      profile: { ...state.profile, targetDuration },
    })),
  toggleEquipment: (equipment) =>
    set((state) => {
      const current = state.profile.availableEquipment;
      const exists = current.includes(equipment);
      if (exists && current.length <= 1) {
        return state;
      }
      const next = exists ? current.filter((e) => e !== equipment) : [...current, equipment];
      return {
        profile: { ...state.profile, availableEquipment: next },
      };
    }),
  addCreds: (amount) =>
    set((state) => ({
      profile: {
        ...state.profile,
        creds: Math.max(0, (state.profile.creds ?? 0) + amount),
      },
    })),
  claimReward: (claimId, amount) => {
    const { profile } = get();
    const claimed = profile.claimedRewardIds ?? [];
    if (claimed.includes(claimId)) return false;
    set({
      profile: {
        ...profile,
        creds: (profile.creds ?? 0) + amount,
        claimedRewardIds: [...claimed, claimId],
      },
    });
    return true;
  },
  unlockAndSelectTrainer: (trainerId) => {
    const { profile } = get();
    const trainer = getTrainerById(trainerId);
    if (isTrainerUnlocked(profile, trainerId)) {
      set({
        profile: {
          ...profile,
          activeTrainerId: trainer.id,
          activeProgramId: trainer.programId,
        },
      });
      return true;
    }

    const currentCreds = profile.creds ?? 0;
    if (currentCreds < trainer.unlockCost) {
      return false;
    }

    const unlocked = Array.from(
      new Set([...(profile.unlockedTrainerIds ?? ['orc-merc']), trainer.id]),
    );
    set({
      profile: {
        ...profile,
        creds: currentCreds - trainer.unlockCost,
        unlockedTrainerIds: unlocked,
        activeTrainerId: trainer.id,
        activeProgramId: trainer.programId,
      },
    });
    return true;
  },
}));
