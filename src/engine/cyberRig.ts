// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { Exercise } from '../types';

export interface Vec2 {
  x: number;
  y: number;
}

export type RigProp = 'kettlebell' | 'rings' | 'rope' | 'wall' | 'floor' | 'none';

export interface RigPose {
  head: Vec2;
  neck: Vec2;
  shoulderL: Vec2;
  shoulderR: Vec2;
  elbowL: Vec2;
  elbowR: Vec2;
  wristL: Vec2;
  wristR: Vec2;
  hip: Vec2;
  kneeL: Vec2;
  kneeR: Vec2;
  ankleL: Vec2;
  ankleR: Vec2;
  prop?: RigProp;
  propPos?: Vec2;
}

export interface ExerciseRigKeyframes {
  start: RigPose;
  end: RigPose;
}

const STAND_BASE: RigPose = {
  head: { x: 100, y: 30 },
  neck: { x: 100, y: 46 },
  shoulderL: { x: 82, y: 54 },
  shoulderR: { x: 118, y: 54 },
  elbowL: { x: 74, y: 82 },
  elbowR: { x: 126, y: 82 },
  wristL: { x: 76, y: 108 },
  wristR: { x: 124, y: 108 },
  hip: { x: 100, y: 104 },
  kneeL: { x: 86, y: 142 },
  kneeR: { x: 114, y: 142 },
  ankleL: { x: 84, y: 178 },
  ankleR: { x: 116, y: 178 },
  prop: 'floor',
};

export const RIG_KEYFRAMES: Record<string, ExerciseRigKeyframes> = {
  'kb-swing-two-hand': {
    start: {
      ...STAND_BASE,
      head: { x: 114, y: 56 },
      neck: { x: 104, y: 70 },
      shoulderL: { x: 92, y: 76 },
      shoulderR: { x: 114, y: 76 },
      elbowL: { x: 96, y: 102 },
      elbowR: { x: 112, y: 102 },
      wristL: { x: 94, y: 128 },
      wristR: { x: 108, y: 128 },
      hip: { x: 76, y: 112 },
      kneeL: { x: 88, y: 146 },
      kneeR: { x: 106, y: 146 },
      prop: 'kettlebell',
      propPos: { x: 101, y: 138 },
    },
    end: {
      ...STAND_BASE,
      elbowL: { x: 110, y: 66 },
      elbowR: { x: 120, y: 66 },
      wristL: { x: 138, y: 68 },
      wristR: { x: 144, y: 68 },
      prop: 'kettlebell',
      propPos: { x: 152, y: 70 },
    },
  },
  'kb-goblet-squat': {
    start: {
      ...STAND_BASE,
      elbowL: { x: 80, y: 78 },
      elbowR: { x: 120, y: 78 },
      wristL: { x: 94, y: 68 },
      wristR: { x: 106, y: 68 },
      prop: 'kettlebell',
      propPos: { x: 100, y: 72 },
    },
    end: {
      ...STAND_BASE,
      head: { x: 100, y: 66 },
      neck: { x: 100, y: 82 },
      shoulderL: { x: 82, y: 88 },
      shoulderR: { x: 118, y: 88 },
      elbowL: { x: 80, y: 112 },
      elbowR: { x: 120, y: 112 },
      wristL: { x: 94, y: 102 },
      wristR: { x: 106, y: 102 },
      hip: { x: 100, y: 138 },
      kneeL: { x: 70, y: 138 },
      kneeR: { x: 130, y: 138 },
      ankleL: { x: 78, y: 178 },
      ankleR: { x: 122, y: 178 },
      prop: 'kettlebell',
      propPos: { x: 100, y: 106 },
    },
  },
  'kb-clean-and-press': {
    start: {
      ...STAND_BASE,
      elbowL: { x: 72, y: 82 },
      elbowR: { x: 124, y: 78 },
      wristL: { x: 74, y: 106 },
      wristR: { x: 110, y: 64 },
      prop: 'kettlebell',
      propPos: { x: 112, y: 60 },
    },
    end: {
      ...STAND_BASE,
      elbowL: { x: 72, y: 82 },
      elbowR: { x: 122, y: 36 },
      wristL: { x: 74, y: 106 },
      wristR: { x: 120, y: 18 },
      prop: 'kettlebell',
      propPos: { x: 120, y: 14 },
    },
  },
  'kb-halo': {
    start: {
      ...STAND_BASE,
      elbowL: { x: 82, y: 74 },
      elbowR: { x: 118, y: 74 },
      wristL: { x: 94, y: 64 },
      wristR: { x: 106, y: 64 },
      prop: 'kettlebell',
      propPos: { x: 100, y: 64 },
    },
    end: {
      ...STAND_BASE,
      elbowL: { x: 76, y: 36 },
      elbowR: { x: 124, y: 36 },
      wristL: { x: 92, y: 24 },
      wristR: { x: 108, y: 24 },
      prop: 'kettlebell',
      propPos: { x: 100, y: 22 },
    },
  },
  'kb-turkish-get-up': {
    start: {
      ...STAND_BASE,
      head: { x: 54, y: 156 },
      neck: { x: 68, y: 162 },
      shoulderL: { x: 68, y: 152 },
      shoulderR: { x: 76, y: 168 },
      elbowL: { x: 72, y: 124 },
      elbowR: { x: 86, y: 176 },
      wristL: { x: 74, y: 98 },
      wristR: { x: 98, y: 176 },
      hip: { x: 112, y: 166 },
      kneeL: { x: 136, y: 142 },
      kneeR: { x: 142, y: 172 },
      ankleL: { x: 148, y: 176 },
      ankleR: { x: 172, y: 176 },
      prop: 'kettlebell',
      propPos: { x: 74, y: 92 },
    },
    end: {
      ...STAND_BASE,
      elbowL: { x: 80, y: 34 },
      wristL: { x: 82, y: 18 },
      prop: 'kettlebell',
      propPos: { x: 82, y: 14 },
    },
  },
  'stretch-90-90-hip': {
    start: {
      ...STAND_BASE,
      head: { x: 100, y: 92 },
      neck: { x: 100, y: 108 },
      shoulderL: { x: 84, y: 114 },
      shoulderR: { x: 116, y: 114 },
      elbowL: { x: 76, y: 142 },
      elbowR: { x: 124, y: 142 },
      wristL: { x: 74, y: 172 },
      wristR: { x: 126, y: 172 },
      hip: { x: 100, y: 162 },
      kneeL: { x: 66, y: 168 },
      kneeR: { x: 134, y: 168 },
      ankleL: { x: 52, y: 178 },
      ankleR: { x: 148, y: 178 },
    },
    end: {
      ...STAND_BASE,
      head: { x: 112, y: 116 },
      neck: { x: 106, y: 128 },
      shoulderL: { x: 92, y: 132 },
      shoulderR: { x: 120, y: 132 },
      elbowL: { x: 90, y: 154 },
      elbowR: { x: 126, y: 154 },
      wristL: { x: 98, y: 174 },
      wristR: { x: 134, y: 174 },
      hip: { x: 96, y: 162 },
      kneeL: { x: 64, y: 168 },
      kneeR: { x: 134, y: 168 },
      ankleL: { x: 52, y: 178 },
      ankleR: { x: 148, y: 178 },
    },
  },
  'stretch-couch': {
    start: {
      ...STAND_BASE,
      head: { x: 88, y: 66 },
      neck: { x: 88, y: 82 },
      shoulderL: { x: 76, y: 88 },
      shoulderR: { x: 100, y: 88 },
      elbowL: { x: 76, y: 112 },
      elbowR: { x: 102, y: 112 },
      wristL: { x: 84, y: 130 },
      wristR: { x: 108, y: 130 },
      hip: { x: 92, y: 132 },
      kneeL: { x: 124, y: 136 },
      kneeR: { x: 74, y: 174 },
      ankleL: { x: 126, y: 178 },
      ankleR: { x: 46, y: 148 },
      prop: 'wall',
    },
    end: {
      ...STAND_BASE,
      head: { x: 76, y: 58 },
      neck: { x: 76, y: 74 },
      shoulderL: { x: 64, y: 80 },
      shoulderR: { x: 88, y: 80 },
      elbowL: { x: 66, y: 104 },
      elbowR: { x: 92, y: 104 },
      wristL: { x: 78, y: 122 },
      wristR: { x: 102, y: 122 },
      hip: { x: 80, y: 124 },
      kneeL: { x: 124, y: 136 },
      kneeR: { x: 64, y: 174 },
      ankleL: { x: 126, y: 178 },
      ankleR: { x: 42, y: 136 },
      prop: 'wall',
    },
  },
  'stretch-thoracic-open': {
    start: {
      ...STAND_BASE,
      head: { x: 72, y: 152 },
      neck: { x: 86, y: 156 },
      shoulderL: { x: 86, y: 148 },
      shoulderR: { x: 90, y: 162 },
      elbowL: { x: 112, y: 146 },
      elbowR: { x: 114, y: 162 },
      wristL: { x: 136, y: 148 },
      wristR: { x: 138, y: 162 },
      hip: { x: 114, y: 164 },
      kneeL: { x: 138, y: 144 },
      kneeR: { x: 142, y: 168 },
      ankleL: { x: 128, y: 176 },
      ankleR: { x: 156, y: 176 },
    },
    end: {
      ...STAND_BASE,
      head: { x: 72, y: 150 },
      neck: { x: 86, y: 156 },
      shoulderL: { x: 82, y: 142 },
      shoulderR: { x: 92, y: 164 },
      elbowL: { x: 64, y: 124 },
      elbowR: { x: 114, y: 162 },
      wristL: { x: 46, y: 110 },
      wristR: { x: 138, y: 162 },
      hip: { x: 114, y: 164 },
      kneeL: { x: 138, y: 144 },
      kneeR: { x: 142, y: 168 },
      ankleL: { x: 128, y: 176 },
      ankleR: { x: 156, y: 176 },
    },
  },
  'stretch-pec-doorway': {
    start: {
      ...STAND_BASE,
      elbowL: { x: 56, y: 54 },
      elbowR: { x: 144, y: 54 },
      wristL: { x: 56, y: 28 },
      wristR: { x: 144, y: 28 },
      prop: 'wall',
    },
    end: {
      ...STAND_BASE,
      head: { x: 100, y: 36 },
      neck: { x: 100, y: 52 },
      elbowL: { x: 52, y: 58 },
      elbowR: { x: 148, y: 58 },
      wristL: { x: 52, y: 32 },
      wristR: { x: 148, y: 32 },
      prop: 'wall',
    },
  },
  'stretch-world-greatest': {
    start: {
      ...STAND_BASE,
      head: { x: 122, y: 92 },
      neck: { x: 112, y: 106 },
      shoulderL: { x: 104, y: 112 },
      shoulderR: { x: 118, y: 112 },
      elbowL: { x: 104, y: 142 },
      elbowR: { x: 120, y: 142 },
      wristL: { x: 104, y: 176 },
      wristR: { x: 120, y: 176 },
      hip: { x: 84, y: 134 },
      kneeL: { x: 122, y: 140 },
      kneeR: { x: 64, y: 162 },
      ankleL: { x: 126, y: 178 },
      ankleR: { x: 42, y: 178 },
    },
    end: {
      ...STAND_BASE,
      head: { x: 122, y: 90 },
      neck: { x: 112, y: 104 },
      shoulderL: { x: 104, y: 108 },
      shoulderR: { x: 118, y: 108 },
      elbowL: { x: 104, y: 142 },
      elbowR: { x: 126, y: 74 },
      wristL: { x: 104, y: 176 },
      wristR: { x: 134, y: 42 },
      hip: { x: 84, y: 134 },
      kneeL: { x: 122, y: 140 },
      kneeR: { x: 64, y: 162 },
      ankleL: { x: 126, y: 178 },
      ankleR: { x: 42, y: 178 },
    },
  },
  'bw-push-up': {
    start: {
      ...STAND_BASE,
      head: { x: 146, y: 106 },
      neck: { x: 134, y: 116 },
      shoulderL: { x: 128, y: 116 },
      shoulderR: { x: 138, y: 122 },
      elbowL: { x: 128, y: 146 },
      elbowR: { x: 138, y: 148 },
      wristL: { x: 128, y: 176 },
      wristR: { x: 138, y: 176 },
      hip: { x: 92, y: 142 },
      kneeL: { x: 64, y: 158 },
      kneeR: { x: 66, y: 162 },
      ankleL: { x: 40, y: 176 },
      ankleR: { x: 42, y: 176 },
    },
    end: {
      ...STAND_BASE,
      head: { x: 148, y: 148 },
      neck: { x: 136, y: 154 },
      shoulderL: { x: 130, y: 154 },
      shoulderR: { x: 138, y: 158 },
      elbowL: { x: 116, y: 160 },
      elbowR: { x: 122, y: 164 },
      wristL: { x: 128, y: 176 },
      wristR: { x: 138, y: 176 },
      hip: { x: 92, y: 164 },
      kneeL: { x: 64, y: 170 },
      kneeR: { x: 66, y: 172 },
      ankleL: { x: 40, y: 176 },
      ankleR: { x: 42, y: 176 },
    },
  },
  'bw-squat': {
    start: STAND_BASE,
    end: {
      ...STAND_BASE,
      head: { x: 100, y: 66 },
      neck: { x: 100, y: 82 },
      shoulderL: { x: 82, y: 88 },
      shoulderR: { x: 118, y: 88 },
      elbowL: { x: 102, y: 92 },
      elbowR: { x: 132, y: 92 },
      wristL: { x: 124, y: 90 },
      wristR: { x: 150, y: 90 },
      hip: { x: 92, y: 138 },
      kneeL: { x: 74, y: 138 },
      kneeR: { x: 126, y: 138 },
      ankleL: { x: 82, y: 178 },
      ankleR: { x: 118, y: 178 },
    },
  },
  'ring-dip': {
    start: {
      ...STAND_BASE,
      elbowL: { x: 76, y: 78 },
      elbowR: { x: 124, y: 78 },
      wristL: { x: 76, y: 102 },
      wristR: { x: 124, y: 102 },
      prop: 'rings',
      propPos: { x: 100, y: 102 },
    },
    end: {
      ...STAND_BASE,
      head: { x: 100, y: 64 },
      neck: { x: 100, y: 80 },
      shoulderL: { x: 82, y: 88 },
      shoulderR: { x: 118, y: 88 },
      elbowL: { x: 64, y: 84 },
      elbowR: { x: 136, y: 84 },
      wristL: { x: 76, y: 102 },
      wristR: { x: 124, y: 102 },
      hip: { x: 100, y: 134 },
      kneeL: { x: 88, y: 162 },
      kneeR: { x: 112, y: 162 },
      ankleL: { x: 86, y: 176 },
      ankleR: { x: 114, y: 176 },
      prop: 'rings',
      propPos: { x: 100, y: 102 },
    },
  },
  'rope-basic-bounce': {
    start: {
      ...STAND_BASE,
      elbowL: { x: 68, y: 84 },
      elbowR: { x: 132, y: 84 },
      wristL: { x: 58, y: 98 },
      wristR: { x: 142, y: 98 },
      prop: 'rope',
    },
    end: {
      ...STAND_BASE,
      head: { x: 100, y: 20 },
      neck: { x: 100, y: 36 },
      shoulderL: { x: 82, y: 44 },
      shoulderR: { x: 118, y: 44 },
      elbowL: { x: 68, y: 74 },
      elbowR: { x: 132, y: 74 },
      wristL: { x: 58, y: 88 },
      wristR: { x: 142, y: 88 },
      hip: { x: 100, y: 92 },
      kneeL: { x: 86, y: 130 },
      kneeR: { x: 114, y: 130 },
      ankleL: { x: 84, y: 164 },
      ankleR: { x: 116, y: 164 },
      prop: 'rope',
    },
  },
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpVec(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

/** Smoothly interpolate between start and end poses for `t` in `[0, 1]`. */
export function interpolateRigPose(start: RigPose, end: RigPose, t: number): RigPose {
  const clamped = Math.min(1, Math.max(0, t));
  const eased = clamped * clamped * (3 - 2 * clamped);
  return {
    head: lerpVec(start.head, end.head, eased),
    neck: lerpVec(start.neck, end.neck, eased),
    shoulderL: lerpVec(start.shoulderL, end.shoulderL, eased),
    shoulderR: lerpVec(start.shoulderR, end.shoulderR, eased),
    elbowL: lerpVec(start.elbowL, end.elbowL, eased),
    elbowR: lerpVec(start.elbowR, end.elbowR, eased),
    wristL: lerpVec(start.wristL, end.wristL, eased),
    wristR: lerpVec(start.wristR, end.wristR, eased),
    hip: lerpVec(start.hip, end.hip, eased),
    kneeL: lerpVec(start.kneeL, end.kneeL, eased),
    kneeR: lerpVec(start.kneeR, end.kneeR, eased),
    ankleL: lerpVec(start.ankleL, end.ankleL, eased),
    ankleR: lerpVec(start.ankleR, end.ankleR, eased),
    prop: end.prop ?? start.prop,
    propPos:
      start.propPos && end.propPos
        ? lerpVec(start.propPos, end.propPos, eased)
        : (end.propPos ?? start.propPos),
  };
}

/** Resolve keyframe poses for any exercise, falling back cleanly by equipment/category. */
export function getRigKeyframesForExercise(
  exercise: Pick<Exercise, 'id' | 'equipment' | 'category'>,
): ExerciseRigKeyframes {
  if (RIG_KEYFRAMES[exercise.id]) {
    return RIG_KEYFRAMES[exercise.id];
  }
  if (exercise.equipment === 'kettlebell') return RIG_KEYFRAMES['kb-swing-two-hand'];
  if (exercise.equipment === 'rings') return RIG_KEYFRAMES['ring-dip'];
  if (exercise.equipment === 'jump_rope') return RIG_KEYFRAMES['rope-basic-bounce'];
  if (exercise.equipment === 'stretching' || exercise.category === 'mobility') {
    return RIG_KEYFRAMES['stretch-90-90-hip'];
  }
  return RIG_KEYFRAMES['bw-squat'];
}
