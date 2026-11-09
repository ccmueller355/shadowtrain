// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { ImageSourcePropType } from 'react-native';
import { Profile, TrainerId } from '../types';

export interface TrainerSkills {
  strength: number;
  conditioning: number;
  mobility: number;
  calisthenics: number;
  tech: number;
}

export interface TrainerDossier {
  id: TrainerId;
  name: string;
  callsign: string;
  raceClass: string;
  unlockCost: number;
  specialty: string;
  lore: string;
  programId: string;
  programName: string;
  programFocus: string;
  signatureExerciseIds: string[];
  skills: TrainerSkills;
  portrait: ImageSourcePropType;
}

export const SHADOW_TRAINERS: TrainerDossier[] = [
  {
    id: 'orc-merc',
    name: 'Kaelen "Tusk" Vorga',
    callsign: 'TUSK',
    raceClass: 'Orc Male // Bodybuilder & Heavy Weapons Merc',
    unlockCost: 0,
    specialty: 'Heavy Iron & Raw Mass (Kettlebell Power, Barbell/Dumbbell, Grip)',
    lore: 'Former corporate heavy-weapons specialist turned underground pit boss. Chrome-plated left arm, orange ballistic visor, zero tolerance for half-reps.',
    programId: 'heavy-iron-pit',
    programName: 'PIT BOSS // HEAVY IRON & GRIP',
    programFocus: 'Ballistic KB swings, heavy overhead grinds, goblet squats & crush grip',
    signatureExerciseIds: [
      'kb-swing-two-hand',
      'kb-clean-and-press',
      'kb-goblet-squat',
      'gripper-crush-rep',
    ],
    skills: { strength: 10, conditioning: 7, mobility: 4, calisthenics: 5, tech: 6 },
    portrait: require('../../assets/trainers/orc-merc.webp') as ImageSourcePropType,
  },
  {
    id: 'human-decker',
    name: 'Valerie "Glitch" Vance',
    callsign: 'GLITCH',
    raceClass: 'Human Female // Elite Shadow-Decker',
    unlockCost: 250,
    specialty: 'High-Density Kit & Neural Conditioning (KB + Jump Rope + Core Intervals)',
    lore: '28-year-old rogue matrix architect who treats physical conditioning like overclocking a cyberdeck: high-output intervals, razor-sharp form, and zero wasted cycles.',
    programId: 'neural-overclock-hiit',
    programName: 'OVERCLOCK // KB & ROPE DENSITY',
    programFocus: 'One-arm KB swings, double-under rope intervals & hollow-body core links',
    signatureExerciseIds: [
      'kb-swing-one-arm',
      'rope-boxer-step',
      'bw-hollow-body-hold',
      'bw-diamond-push-up',
    ],
    skills: { strength: 6, conditioning: 10, mobility: 8, calisthenics: 8, tech: 10 },
    portrait: require('../../assets/trainers/human-decker.webp') as ImageSourcePropType,
  },
  {
    id: 'human-soldier',
    name: 'Marcus "Vanguard" Kade',
    callsign: 'VANGUARD',
    raceClass: 'Human Male // Cyber-Modded Universal Soldier',
    unlockCost: 500,
    specialty: 'Tactical Hybrid Split (Workout A / B — Kettlebell + Bodyweight + Barbell)',
    lore: 'Augmented black-ops operative with subdermal armor and myomer muscle lacing. Runs relentless, balanced push/pull/hinge/squat tactical splits built for field survival.',
    programId: 'tactical-vanguard-ab',
    programName: 'VANGUARD // TACTICAL SPLIT A/B',
    programFocus: 'Full-spectrum push, pull, hinge, and squat field-readiness rotation',
    signatureExerciseIds: ['kb-front-rack-squat', 'kb-row-one-arm', 'bw-push-up', 'ring-row'],
    skills: { strength: 9, conditioning: 9, mobility: 7, calisthenics: 8, tech: 8 },
    portrait: require('../../assets/trainers/human-soldier.webp') as ImageSourcePropType,
  },
  {
    id: 'elf-mage',
    name: 'Lyra "Aether" Vael',
    callsign: 'AETHER',
    raceClass: 'Elf Female // Hermetic Mage & Astral Adept',
    unlockCost: 750,
    specialty: 'Mobility Flow, Turkish Get-Ups & Isometric Control (Stretching + KB TGU)',
    lore: 'Neon-lit astral adept who channels mana through structural alignment, deep joint decompression, slow-eccentric control, and active recovery shields.',
    programId: 'aether-mobility-tgu',
    programName: 'AETHER FLOW // TGU & DECOMPRESSION',
    programFocus: 'Turkish Get-Ups, kettlebell halos, 90/90 hip flows & thoracic decompression',
    signatureExerciseIds: [
      'kb-turkish-get-up',
      'kb-halo',
      'stretch-90-90-hip',
      'stretch-cossack-squat',
    ],
    skills: { strength: 6, conditioning: 8, mobility: 10, calisthenics: 8, tech: 9 },
    portrait: require('../../assets/trainers/elf-mage.webp') as ImageSourcePropType,
  },
  {
    id: 'elf-wraith',
    name: 'Soren "Wraith" Kael',
    callsign: 'WRAITH',
    raceClass: 'Elf Male // Wraith Assassin & Calisthenics Acrobat',
    unlockCost: 1000,
    specialty: 'Convict Calisthenics & Gymnastic Rings Mastery (Rings + Bodyweight Lv1–3)',
    lore: 'High-altitude corporate infiltrator and silent assassin. Zero clanking iron — masters pure leverage (Ring L-Sits, Ring Dips, Pistol Squats) in dead silence.',
    programId: 'wraith-zero-iron-rings',
    programName: 'SILENT LEVERAGE // RINGS & CALISTHENICS',
    programFocus: 'Ring dips, ring pull-ups, ring L-sit holds & single-leg pistol squats',
    signatureExerciseIds: ['ring-dip', 'ring-pull-up', 'ring-l-sit-hold', 'bw-pistol-squat'],
    skills: { strength: 8, conditioning: 9, mobility: 9, calisthenics: 10, tech: 7 },
    portrait: require('../../assets/trainers/elf-wraith.webp') as ImageSourcePropType,
  },
];

export function getTrainerById(trainerId?: TrainerId): TrainerDossier {
  return SHADOW_TRAINERS.find((t) => t.id === trainerId) ?? SHADOW_TRAINERS[0];
}

export function isTrainerUnlocked(profile: Profile, trainerId: TrainerId): boolean {
  if (trainerId === 'orc-merc') return true;
  const unlocked = profile.unlockedTrainerIds ?? ['orc-merc'];
  return unlocked.includes(trainerId);
}

export function canUnlockTrainer(profile: Profile, trainerId: TrainerId): boolean {
  if (isTrainerUnlocked(profile, trainerId)) return true;
  const trainer = getTrainerById(trainerId);
  return (profile.creds ?? 0) >= trainer.unlockCost;
}
