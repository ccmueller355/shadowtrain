// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { Share } from 'react-native';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import SettingsScreen from '../../app/(tabs)/settings';
import { DEFAULT_SEED_EXERCISES } from '../db';
import {
  parseAndValidateBackupJson,
  serializeBackupJson,
  serializeSessionsCsv,
} from '../engine/portability';
import {
  canUnlockTrainer,
  getCoachDisplayForExercise,
  getSpecialistTrainerForExercise,
  getTrainerById,
  getTrainerCoachingCue,
  isTrainerUnlocked,
  SHADOW_TRAINERS,
  TRAINING_DRONE,
} from '../engine/trainers';
import { useExerciseStore } from '../stores/exerciseStore';
import { DEFAULT_PROFILE, useProfileStore } from '../stores/profileStore';
import { useSessionStore } from '../stores/sessionStore';
import { Session } from '../types';

const SAMPLE_SESSION: Session = {
  id: 'sess-io-1',
  name: 'KB, "Heavy" Session',
  startedAt: Date.UTC(2026, 10, 9, 10, 0, 0),
  finishedAt: Date.UTC(2026, 10, 9, 10, 45, 0),
  entries: [
    {
      id: 'entry-1',
      exerciseId: 'kb-swing-two-hand',
      position: 0,
      sets: [
        { id: 's1', reps: 15, weight: 24, completed: true, isWarmup: false },
        { id: 's2', durationSec: 60, completed: false, isWarmup: true },
      ],
    },
  ],
};

describe('M7 Settings, 5 Shadow Trainers Dossier, Creds & Data Portability', () => {
  beforeEach(() => {
    useProfileStore.setState({
      profile: DEFAULT_PROFILE,
      theme: 'fixer',
    });
    useExerciseStore.setState({
      exercises: [...DEFAULT_SEED_EXERCISES],
      hydrated: true,
    });
    useSessionStore.getState().resetSessionStore();
  });

  describe('SHADOW_TRAINERS & Trainer Helpers', () => {
    it('provides all 5 Shadow Trainers and evaluates unlock status & affordability', () => {
      expect(SHADOW_TRAINERS).toHaveLength(5);
      expect(getTrainerById('human-decker').callsign).toBe('GLITCH');
      expect(getTrainerById(undefined).id).toBe('orc-merc');

      expect(isTrainerUnlocked(DEFAULT_PROFILE, 'orc-merc')).toBe(true);
      expect(isTrainerUnlocked(DEFAULT_PROFILE, 'human-decker')).toBe(false);
      expect(canUnlockTrainer(DEFAULT_PROFILE, 'orc-merc')).toBe(true);
      expect(canUnlockTrainer(DEFAULT_PROFILE, 'human-decker')).toBe(false);
      expect(canUnlockTrainer({ ...DEFAULT_PROFILE, creds: 300 }, 'human-decker')).toBe(true);
    });
  });

  describe('Data Portability — JSON Backup v1 & CSV Session Log', () => {
    it('serializes and validates v1 JSON backups and rejects malformed payloads', () => {
      const json = serializeBackupJson({
        profile: DEFAULT_PROFILE,
        theme: 'decker',
        sessions: [SAMPLE_SESSION],
        exportedAt: '2026-11-09T12:00:00.000Z',
      });

      const parsed = parseAndValidateBackupJson(json);
      expect(parsed.meta.format).toBe('shadowtrain-backup');
      expect(parsed.meta.version).toBe(1);
      expect(parsed.theme).toBe('decker');
      expect(parsed.sessions).toHaveLength(1);

      expect(() => parseAndValidateBackupJson('{not-json')).toThrow('Invalid JSON payload');
      expect(() => parseAndValidateBackupJson('null')).toThrow(
        'Backup payload must be a JSON object',
      );
      expect(() => parseAndValidateBackupJson(JSON.stringify({ meta: { format: 'bad' } }))).toThrow(
        'Unsupported backup format',
      );
      expect(() =>
        parseAndValidateBackupJson(
          JSON.stringify({ meta: { format: 'shadowtrain-backup', version: 99 } }),
        ),
      ).toThrow('Unsupported backup version: 99');
      expect(() =>
        parseAndValidateBackupJson(
          JSON.stringify({ meta: { format: 'shadowtrain-backup', version: 1 } }),
        ),
      ).toThrow('Backup payload is missing profile object');
      expect(() =>
        parseAndValidateBackupJson(
          JSON.stringify({
            meta: { format: 'shadowtrain-backup', version: 1 },
            profile: DEFAULT_PROFILE,
          }),
        ),
      ).toThrow('Backup payload is missing sessions array');
    });

    it('serializes sessions to CSV and escapes commas/quotes', () => {
      const csv = serializeSessionsCsv([SAMPLE_SESSION], DEFAULT_SEED_EXERCISES);
      const lines = csv.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toContain('session_id,session_name,started_at');
      expect(lines[1]).toContain('"KB, ""Heavy"" Session"');
      expect(lines[1]).toContain('Two-Hand Kettlebell Swing');
    });
  });

  describe('Profile Store Trainer Unlock & Equipment Guard', () => {
    it('prevents removing the last piece of available equipment', () => {
      useProfileStore.getState().updateProfile({ availableEquipment: ['kettlebell'] });
      useProfileStore.getState().toggleEquipment('kettlebell');
      expect(useProfileStore.getState().profile.availableEquipment).toEqual(['kettlebell']);
    });
  });

  describe('SettingsScreen Interactive Flows', () => {
    it('switches trainers, unlocks with Creds, edits profile/kit, and exports/imports JSON & CSV', () => {
      const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
      useSessionStore.setState({ recentSessions: [SAMPLE_SESSION] });

      render(<SettingsScreen />);

      expect(screen.getByTestId('screen-settings')).toBeTruthy();
      expect(screen.getByTestId('creds-balance-badge')).toBeTruthy();
      expect(screen.getByTestId('trainer-dossier-name').props.children).toBe('Kaelen "Tusk" Vorga');

      // Select Valerie (human-decker, 250 Creds)
      fireEvent.press(screen.getByTestId('trainer-card-human-decker'));
      expect(screen.getByTestId('trainer-dossier-name').props.children).toBe(
        'Valerie "Glitch" Vance',
      );

      // Try to unlock with 0 Creds -> shows insufficient creds message
      fireEvent.press(screen.getByTestId('trainer-action-btn-human-decker'));
      expect(screen.getByTestId('portability-status').props.children).toContain(
        'INSUFFICIENT CREDS',
      );

      // Award 300 Creds and unlock Valerie
      act(() => {
        useProfileStore.getState().addCreds(300);
      });
      fireEvent.press(screen.getByTestId('trainer-action-btn-human-decker'));
      expect(useProfileStore.getState().profile.activeTrainerId).toBe('human-decker');
      expect(useProfileStore.getState().profile.creds).toBe(50);

      // Switch back to Tusk (already unlocked) and deploy
      fireEvent.press(screen.getByTestId('trainer-card-orc-merc'));
      fireEvent.press(screen.getByTestId('trainer-action-btn-orc-merc'));
      expect(useProfileStore.getState().profile.activeTrainerId).toBe('orc-merc');

      // Update goal, units, fixed KB weight, and equipment toggle
      fireEvent.press(screen.getByTestId('goal-btn-strength'));
      expect(useProfileStore.getState().profile.goal).toBe('strength');
      expect(useProfileStore.getState().profile.repRange).toEqual({ min: 3, max: 5 });

      fireEvent.press(screen.getByTestId('units-btn-lb'));
      expect(useProfileStore.getState().profile.units).toBe('lb');

      fireEvent.press(screen.getByTestId('kb-weight-btn-24'));
      expect(useProfileStore.getState().profile.fixedKettlebellWeight).toBe(24);

      fireEvent.press(screen.getByTestId('eq-toggle-barbell'));
      expect(useProfileStore.getState().profile.availableEquipment).toContain('barbell');
      fireEvent.press(screen.getByTestId('eq-toggle-barbell'));
      expect(useProfileStore.getState().profile.availableEquipment).not.toContain('barbell');

      // Export CSV
      fireEvent.press(screen.getByTestId('export-csv-btn'));
      expect(screen.getByTestId('portability-status').props.children).toContain(
        'EXPORTED CSV SESSION LOG',
      );

      // Export JSON Backup, then import it back
      fireEvent.press(screen.getByTestId('export-json-btn'));
      expect(screen.getByTestId('portability-status').props.children).toContain(
        'EXPORTED V1 BACKUP',
      );

      fireEvent.press(screen.getByTestId('import-json-btn'));
      expect(screen.getByTestId('portability-status').props.children).toContain(
        'RESTORED V1 BACKUP',
      );

      // Test invalid JSON import error handling
      fireEvent.changeText(screen.getByTestId('portability-payload-input'), 'bad-json');
      fireEvent.press(screen.getByTestId('import-json-btn'));
      expect(screen.getByTestId('portability-status').props.children).toContain(
        'IMPORT ERROR: Invalid JSON payload',
      );

      shareSpy.mockRestore();
    });
  });

  describe('M8 getSpecialistTrainerForExercise', () => {
    const pick = (id: string, equipment: string) =>
      getSpecialistTrainerForExercise({ id, equipment }).id;

    it('prefers signature exercise matches', () => {
      expect(pick('ring-dip', 'rings')).toBe('elf-wraith');
      expect(pick('kb-front-rack-squat', 'kettlebell')).toBe('human-soldier');
    });

    it('maps equipment domains to specialists', () => {
      expect(pick('x-ring', 'rings')).toBe('elf-wraith');
      expect(pick('x-rope', 'jump_rope')).toBe('human-decker');
      expect(pick('x-stretch', 'stretching')).toBe('elf-mage');
      expect(pick('x-grip', 'hand_gripper')).toBe('orc-merc');
      expect(pick('x-bar', 'barbell')).toBe('orc-merc');
    });

    it('maps kettlebell and bodyweight sub-patterns', () => {
      expect(pick('kb-turkish-x', 'kettlebell')).toBe('elf-mage');
      expect(pick('kb-halo-x', 'kettlebell')).toBe('elf-mage');
      expect(pick('kb-one-arm-x', 'kettlebell')).toBe('human-decker');
      expect(pick('kb-other', 'kettlebell')).toBe('orc-merc');
      expect(pick('bw-hollow-x', 'bodyweight')).toBe('human-decker');
      expect(pick('bw-pike-x', 'bodyweight')).toBe('elf-wraith');
      expect(pick('bw-other', 'bodyweight')).toBe('human-soldier');
    });

    it('falls back to Vanguard for unknown equipment', () => {
      expect(pick('x-cable', 'cable')).toBe('human-soldier');
    });
  });

  describe('M11 Training Drone & Dynamic Specialist Skin Display', () => {
    it('retrieves UNIT-0 Training Drone by id', () => {
      const drone = getTrainerById('drone-unit-0');
      expect(drone.id).toBe('drone-unit-0');
      expect(drone.callsign).toBe('UNIT-0');
      expect(drone.portrait).toBe(TRAINING_DRONE.portrait);
      expect(isTrainerUnlocked(DEFAULT_PROFILE, 'drone-unit-0')).toBe(true);
    });

    it('returns stock Training Drone when specialist coach is locked', () => {
      const lockedProfile = { ...DEFAULT_PROFILE, unlockedTrainerIds: ['orc-merc'] as const };
      const display = getCoachDisplayForExercise(
        { id: 'ring-dip', equipment: 'rings' },
        lockedProfile,
      );

      expect(display.isSpecialist).toBe(false);
      expect(display.isUnlocked).toBe(false);
      expect(display.coach.id).toBe('drone-unit-0');
      expect(display.specialist.id).toBe('elf-wraith');
      expect(display.coachingCue).toContain('NEUTRAL SPINE');
    });

    it('returns Specialist Coach with custom coaching cue when unlocked', () => {
      const unlockedProfile = {
        ...DEFAULT_PROFILE,
        unlockedTrainerIds: ['orc-merc', 'elf-wraith'] as any,
      };
      const display = getCoachDisplayForExercise(
        { id: 'ring-dip', equipment: 'rings' },
        unlockedProfile,
      );

      expect(display.isSpecialist).toBe(true);
      expect(display.isUnlocked).toBe(true);
      expect(display.coach.id).toBe('elf-wraith');
      expect(display.specialist.id).toBe('elf-wraith');
      expect(display.coachingCue).toContain('LEVERAGE OVER RAW MASS');
    });

    it('provides distinct coaching cues for all trainers', () => {
      expect(getTrainerCoachingCue('orc-merc')).toContain('TUSK');
      expect(getTrainerCoachingCue('human-decker')).toContain('VALERIE');
      expect(getTrainerCoachingCue('human-soldier')).toContain('VANGUARD');
      expect(getTrainerCoachingCue('elf-mage')).toContain('LYRA');
      expect(getTrainerCoachingCue('elf-wraith')).toContain('WRAITH');
      expect(getTrainerCoachingCue('drone-unit-0')).toContain('UNIT-0');
    });

    it('updates weekly frequency and session duration from settings controls (M12)', () => {
      render(<SettingsScreen />);

      // Frequency selection
      fireEvent.press(screen.getByTestId('frequency-btn-5'));
      expect(useProfileStore.getState().profile.weeklyTargetDays).toBe(5);

      fireEvent.press(screen.getByTestId('frequency-btn-2'));
      expect(useProfileStore.getState().profile.weeklyTargetDays).toBe(2);

      // Duration selection
      fireEvent.press(screen.getByTestId('duration-btn-express'));
      expect(useProfileStore.getState().profile.targetDuration).toBe('express');

      fireEvent.press(screen.getByTestId('duration-btn-beast'));
      expect(useProfileStore.getState().profile.targetDuration).toBe('beast');
    });
  });
});
