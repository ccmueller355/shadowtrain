// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { CyberRigView } from '../components/CyberRigView';
import { getRigKeyframesForExercise, interpolateRigPose, RIG_KEYFRAMES } from '../engine/cyberRig';
import { getRigSkinForTrainer, RIG_SKINS } from '../engine/rigSkins';
import { TrainerId } from '../types';
import ExercisesScreen from '../../app/(tabs)/exercises';

describe('M17-A: 2D Cyber-Skeleton Rig & Character Skins', () => {
  it('resolves all 6 trainer rig skins with distinct head glyphs and palettes', () => {
    const ids: TrainerId[] = [
      'drone-unit-0',
      'orc-merc',
      'human-decker',
      'human-soldier',
      'elf-wraith',
      'elf-mage',
    ];
    const headShapes = new Set(ids.map((id) => getRigSkinForTrainer(id).headShape));
    expect(headShapes.size).toBe(6);
    expect(getRigSkinForTrainer('unknown-id' as TrainerId)).toEqual(RIG_SKINS['drone-unit-0']);
  });

  it('resolves exercise keyframes directly and by equipment/category fallback', () => {
    expect(
      getRigKeyframesForExercise({
        id: 'kb-swing-two-hand',
        equipment: 'kettlebell',
        category: 'hinge',
      }),
    ).toBe(RIG_KEYFRAMES['kb-swing-two-hand']);

    expect(
      getRigKeyframesForExercise({
        id: 'custom-kb-snatch',
        equipment: 'kettlebell',
        category: 'full_body',
      }),
    ).toBe(RIG_KEYFRAMES['kb-swing-two-hand']);

    expect(
      getRigKeyframesForExercise({
        id: 'custom-ring-row',
        equipment: 'rings',
        category: 'pull',
      }),
    ).toBe(RIG_KEYFRAMES['ring-dip']);

    expect(
      getRigKeyframesForExercise({
        id: 'custom-rope-sprint',
        equipment: 'jump_rope',
        category: 'conditioning',
      }),
    ).toBe(RIG_KEYFRAMES['rope-basic-bounce']);

    expect(
      getRigKeyframesForExercise({
        id: 'custom-hip-stretch',
        equipment: 'stretching',
        category: 'mobility',
      }),
    ).toBe(RIG_KEYFRAMES['stretch-90-90-hip']);

    expect(
      getRigKeyframesForExercise({
        id: 'custom-bw-lunge',
        equipment: 'bodyweight',
        category: 'squat',
      }),
    ).toBe(RIG_KEYFRAMES['bw-squat']);
  });

  it('interpolates poses smoothly and clamps t to [0, 1]', () => {
    const { start, end } = RIG_KEYFRAMES['kb-swing-two-hand'];
    const mid = interpolateRigPose(start, end, 0.5);
    expect(mid.wristL.x).toBeCloseTo((start.wristL.x + end.wristL.x) / 2, 1);
    expect(interpolateRigPose(start, end, -1).head).toEqual(start.head);
    expect(interpolateRigPose(start, end, 2).head).toEqual(end.head);
  });

  it('renders CyberRigView across all skins and props', () => {
    const trainers: TrainerId[] = [
      'drone-unit-0',
      'orc-merc',
      'human-decker',
      'human-soldier',
      'elf-wraith',
      'elf-mage',
    ];
    const poses = [
      RIG_KEYFRAMES['kb-swing-two-hand'].start,
      RIG_KEYFRAMES['ring-dip'].start,
      RIG_KEYFRAMES['rope-basic-bounce'].start,
      RIG_KEYFRAMES['stretch-couch'].start,
      RIG_KEYFRAMES['bw-push-up'].start,
      RIG_KEYFRAMES['stretch-90-90-hip'].end,
    ];
    trainers.forEach((id, idx) => {
      const { getByTestId } = render(
        <CyberRigView
          pose={poses[idx]}
          skin={getRigSkinForTrainer(id)}
          caption="TEST POSE"
          testID={`rig-${id}`}
        />,
      );
      expect(getByTestId(`rig-${id}`)).toBeTruthy();
    });
  });

  it('toggles between [STATIC] and [2D RIG] in ExercisesScreen detail modal', () => {
    const { getByTestId, queryByTestId } = render(<ExercisesScreen />);
    fireEvent.press(getByTestId('exercise-item-kb-swing-two-hand'));
    expect(getByTestId('exercise-pose-images')).toBeTruthy();
    expect(getByTestId('toggle-rig-mode')).toBeTruthy();

    fireEvent.press(getByTestId('toggle-rig-mode'));
    expect(queryByTestId('exercise-pose-images')).toBeNull();
    expect(getByTestId('exercise-rig-poses')).toBeTruthy();
    expect(getByTestId('exercise-rig-start')).toBeTruthy();
    expect(getByTestId('exercise-rig-end')).toBeTruthy();
  });
});
