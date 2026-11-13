// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { ImageSourcePropType } from 'react-native';

export interface ExerciseShowcase {
  start?: ImageSourcePropType;
  end?: ImageSourcePropType;
}

// Static requires (Metro needs literal paths). Missing poses fall back to the themed card.
export const EXERCISE_SHOWCASES: Record<string, ExerciseShowcase> = {
  'bw-hollow-body-hold': {
    start: require('../../assets/exercises/bw-hollow-body-hold/start.webp') as ImageSourcePropType,
  },
  'bw-pistol-squat': {
    start: require('../../assets/exercises/bw-pistol-squat/start.webp') as ImageSourcePropType,
    end: require('../../assets/exercises/bw-pistol-squat/end.webp') as ImageSourcePropType,
  },
  'bw-push-up': {
    start: require('../../assets/exercises/bw-push-up/start.webp') as ImageSourcePropType,
    end: require('../../assets/exercises/bw-push-up/end.webp') as ImageSourcePropType,
  },
  'bw-squat': {
    start: require('../../assets/exercises/bw-squat/start.webp') as ImageSourcePropType,
    end: require('../../assets/exercises/bw-squat/end.webp') as ImageSourcePropType,
  },
  'kb-clean-and-press': {
    start: require('../../assets/exercises/kb-clean-and-press/start.webp') as ImageSourcePropType,
    end: require('../../assets/exercises/kb-clean-and-press/end.webp') as ImageSourcePropType,
  },
  'kb-goblet-squat': {
    start: require('../../assets/exercises/kb-goblet-squat/start.webp') as ImageSourcePropType,
    end: require('../../assets/exercises/kb-goblet-squat/end.webp') as ImageSourcePropType,
  },
  'kb-halo': {
    start: require('../../assets/exercises/kb-halo/start.webp') as ImageSourcePropType,
    end: require('../../assets/exercises/kb-halo/end.webp') as ImageSourcePropType,
  },
  'kb-swing-two-hand': {
    start: require('../../assets/exercises/kb-swing-two-hand/start.webp') as ImageSourcePropType,
    end: require('../../assets/exercises/kb-swing-two-hand/end.webp') as ImageSourcePropType,
  },
  'kb-turkish-get-up': {
    start: require('../../assets/exercises/kb-turkish-get-up/start.webp') as ImageSourcePropType,
    end: require('../../assets/exercises/kb-turkish-get-up/end.webp') as ImageSourcePropType,
  },
  'ring-dip': {
    start: require('../../assets/exercises/ring-dip/start.webp') as ImageSourcePropType,
    end: require('../../assets/exercises/ring-dip/end.webp') as ImageSourcePropType,
  },
  'ring-l-sit-hold': {
    start: require('../../assets/exercises/ring-l-sit-hold/start.webp') as ImageSourcePropType,
    end: require('../../assets/exercises/ring-l-sit-hold/end.webp') as ImageSourcePropType,
  },
  'rope-basic-bounce': {
    start: require('../../assets/exercises/rope-basic-bounce/start.webp') as ImageSourcePropType,
    end: require('../../assets/exercises/rope-basic-bounce/end.webp') as ImageSourcePropType,
  },
  'stretch-90-90-hip': {
    start: require('../../assets/exercises/stretch-90-90-hip/start.webp') as ImageSourcePropType,
  },
  'stretch-couch': {
    start: require('../../assets/exercises/stretch-couch/start.webp') as ImageSourcePropType,
    end: require('../../assets/exercises/stretch-couch/end.webp') as ImageSourcePropType,
  },
};

export function getExerciseShowcase(exerciseId: string): ExerciseShowcase | undefined {
  return EXERCISE_SHOWCASES[exerciseId];
}
