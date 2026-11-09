// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { CyberpunkCard } from '../components/CyberpunkCard';
import HomeScreen from '../../app/(tabs)/index';
import ExercisesScreen from '../../app/(tabs)/exercises';
import ProgressScreen from '../../app/(tabs)/progress';
import SettingsScreen from '../../app/(tabs)/settings';
import SessionLoggerScreen from '../../app/session/[id]';
import { useProfileStore, DEFAULT_PROFILE } from '../stores/profileStore';
import { themes } from '../theme/themes';

describe('Component Tests (CT) — UI Surfaces & Screens', () => {
  beforeEach(() => {
    useProfileStore.setState({
      profile: DEFAULT_PROFILE,
      theme: 'fixer',
    });
  });

  describe('CyberpunkCard', () => {
    it('renders children and applies active theme surface and border colors', () => {
      const { toJSON } = render(
        <CyberpunkCard glow={true} style={{ marginTop: 12 }}>
          <Text>Deck Payload</Text>
        </CyberpunkCard>,
      );

      expect(screen.getByText('Deck Payload')).toBeTruthy();
      const tree = toJSON() as { props: { style: unknown } };
      const flattened = StyleSheet.flatten(tree.props.style);
      expect(flattened.backgroundColor).toBe(themes.fixer.colors.surface);
      expect(flattened.borderColor).toBe(themes.fixer.colors.primary);
      expect(flattened.shadowColor).toBe(themes.fixer.colors.primary);
      expect(flattened.marginTop).toBe(12);
    });

    it('omits glow shadowColor when glow={false}', () => {
      const { toJSON } = render(
        <CyberpunkCard glow={false}>
          <Text>Stealth Mode</Text>
        </CyberpunkCard>,
      );

      const tree = toJSON() as { props: { style: unknown } };
      const flattened = StyleSheet.flatten(tree.props.style);
      expect(flattened.shadowColor).toBeUndefined();
    });
  });

  describe('HomeScreen', () => {
    it('renders header, recent sessions card, and triggers onStartSession callback', () => {
      const onStartSession = jest.fn();
      render(<HomeScreen onStartSession={onStartSession} />);

      expect(screen.getByText('SHADOW TRAIN')).toBeTruthy();
      expect(screen.getByText('RECENT SESSIONS')).toBeTruthy();
      expect(screen.getByText(/No sessions logged yet/i)).toBeTruthy();

      fireEvent.press(screen.getByTestId('start-session-btn'));
      expect(onStartSession).toHaveBeenCalledTimes(1);
      expect(onStartSession).toHaveBeenCalledWith('session-new');
    });
  });

  describe('ExercisesScreen', () => {
    it('renders default personal equipment kit and updates when store changes', () => {
      render(<ExercisesScreen />);

      expect(screen.getByText('EXERCISE ARMORY')).toBeTruthy();
      expect(
        screen.getByText(
          'ACTIVE KIT: KETTLEBELL · RINGS · BODYWEIGHT · HAND_GRIPPER · JUMP_ROPE · STRETCHING',
        ),
      ).toBeTruthy();

      act(() => {
        useProfileStore.getState().updateProfile({
          availableEquipment: ['kettlebell', 'rings'],
        });
      });

      expect(screen.getByText('ACTIVE KIT: KETTLEBELL · RINGS')).toBeTruthy();
    });
  });

  describe('ProgressScreen', () => {
    it('renders telemetry header, window selector chips, and PR board', () => {
      render(<ProgressScreen />);

      expect(screen.getByText('TELEMETRY & PRs')).toBeTruthy();
      expect(
        screen.getByText('VOLUME ANALYTICS // INTENSITY HEATMAP // PERSONAL RECORDS'),
      ).toBeTruthy();
      expect(screen.getByTestId('window-btn-week')).toBeTruthy();
      expect(screen.getByTestId('pr-board-empty')).toBeTruthy();
    });
  });

  describe('SettingsScreen', () => {
    it('renders all 5 shadow themes, switches theme on press, and displays operator profile', () => {
      render(<SettingsScreen />);

      expect(screen.getByText('DECK SETTINGS')).toBeTruthy();
      expect(screen.getByText('GOAL: HYPERTROPHY (8–12 REPS)')).toBeTruthy();
      expect(screen.getByText(/UNITS: KG \/\/ FIXED KB: 16 kg/i)).toBeTruthy();

      // Switch through all 5 themes
      (['fixer', 'stuffer', 'decker', 'cyber', 'terminal'] as const).forEach((key) => {
        const btn = screen.getByTestId(`theme-btn-${key}`);
        expect(btn).toBeTruthy();
        fireEvent.press(btn);
        expect(useProfileStore.getState().theme).toBe(key);
      });
    });
  });

  describe('SessionLoggerScreen', () => {
    it('renders custom sessionId and triggers onFinishSession on press', () => {
      const onFinish = jest.fn();
      render(<SessionLoggerScreen sessionId="session-kb-rings-01" onFinishSession={onFinish} />);

      expect(screen.getByText('SESSION LOGGER // session-kb-rings-01')).toBeTruthy();
      fireEvent.press(screen.getByTestId('finish-session-btn'));
      expect(onFinish).toHaveBeenCalledTimes(1);
    });
  });
});
