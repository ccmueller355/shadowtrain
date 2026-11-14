// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { TrainerId } from '../types';

export type RigHeadShape = 'visor' | 'horns' | 'cyber-bob' | 'helmet' | 'hood' | 'crown';

export interface RigSkin {
  id: TrainerId;
  label: string;
  limbColor: string;
  jointColor: string;
  glowColor: string;
  accentColor: string;
  limbWidth: number;
  jointRadius: number;
  headShape: RigHeadShape;
  shoulderArmor: boolean;
}

export const RIG_SKINS: Record<TrainerId, RigSkin> = {
  'drone-unit-0': {
    id: 'drone-unit-0',
    label: 'UNIT-0 SPAR-DRONE',
    limbColor: '#38bdf8',
    jointColor: '#f8fafc',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    accentColor: '#0ea5e9',
    limbWidth: 4.5,
    jointRadius: 4.5,
    headShape: 'visor',
    shoulderArmor: true,
  },
  'orc-merc': {
    id: 'orc-merc',
    label: 'MARCUS VANCE // ORC MERC',
    limbColor: '#ef4444',
    jointColor: '#fbbf24',
    glowColor: 'rgba(239, 68, 68, 0.35)',
    accentColor: '#f97316',
    limbWidth: 6.5,
    jointRadius: 5.5,
    headShape: 'horns',
    shoulderArmor: true,
  },
  'human-decker': {
    id: 'human-decker',
    label: 'VALERIE // NETRUNNER',
    limbColor: '#00ff9c',
    jointColor: '#22d3ee',
    glowColor: 'rgba(0, 255, 156, 0.35)',
    accentColor: '#06b6d4',
    limbWidth: 4,
    jointRadius: 4,
    headShape: 'cyber-bob',
    shoulderArmor: false,
  },
  'human-soldier': {
    id: 'human-soldier',
    label: 'KAELEN // TITAN PIT',
    limbColor: '#f59e0b',
    jointColor: '#fef3c7',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    accentColor: '#d97706',
    limbWidth: 5.5,
    jointRadius: 5,
    headShape: 'helmet',
    shoulderArmor: true,
  },
  'elf-wraith': {
    id: 'elf-wraith',
    label: 'SOREN // SHADOW WRAITH',
    limbColor: '#a855f7',
    jointColor: '#e9d5ff',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    accentColor: '#c084fc',
    limbWidth: 3.5,
    jointRadius: 3.8,
    headShape: 'hood',
    shoulderArmor: false,
  },
  'elf-mage': {
    id: 'elf-mage',
    label: 'LYRA // ARCANE FLOW',
    limbColor: '#ec4899',
    jointColor: '#fbcfe8',
    glowColor: 'rgba(236, 72, 153, 0.35)',
    accentColor: '#f472b6',
    limbWidth: 3.8,
    jointRadius: 4,
    headShape: 'crown',
    shoulderArmor: false,
  },
};

/** Resolve the cyber-skeleton skin for any trainer/drone ID. */
export function getRigSkinForTrainer(trainerId: TrainerId): RigSkin {
  return RIG_SKINS[trainerId] ?? RIG_SKINS['drone-unit-0'];
}
