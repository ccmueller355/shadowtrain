// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { create } from 'zustand';
import { Equipment, Profile, ThemeName } from '../types';

export const DEFAULT_EQUIPMENT: Equipment[] = [
  'kettlebell',
  'rings',
  'bodyweight',
  'hand_gripper',
  'jump_rope',
  'stretching',
];

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
};

interface ProfileState {
  profile: Profile;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  updateProfile: (patch: Partial<Profile>) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: DEFAULT_PROFILE,
  theme: 'fixer',
  setTheme: (theme) => set({ theme }),
  updateProfile: (patch) =>
    set((state) => ({ profile: { ...state.profile, ...patch } })),
}));
