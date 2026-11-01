// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import App from '../../App';
import { useProfileStore, DEFAULT_PROFILE } from '../stores/profileStore';
import { cyberpunkTheme } from '../theme/cyberpunkTheme';
import { themes } from '../theme/themes';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('M0 Scaffold — ShadowTrain Shell, Routes & Theme', () => {
  beforeEach(() => {
    useProfileStore.setState({
      profile: DEFAULT_PROFILE,
      theme: 'fixer',
    });
  });

  it('exports cyberpunkTheme and all 5 shadow themes', () => {
    expect(cyberpunkTheme.label).toBe("Fixer's Notebook");
    expect(Object.keys(themes)).toEqual(['fixer', 'stuffer', 'decker', 'cyber', 'terminal']);
  });

  it('renders Home tab by default and navigates across Exercises, Progress, and Settings tabs', () => {
    render(<App />);

    expect(screen.getByTestId('screen-home')).toBeTruthy();
    expect(screen.getByText('SHADOW TRAIN')).toBeTruthy();

    fireEvent.press(screen.getByTestId('tab-exercises'));
    expect(screen.getByTestId('screen-exercises')).toBeTruthy();
    expect(screen.getByText('EXERCISE ARMORY')).toBeTruthy();

    fireEvent.press(screen.getByTestId('tab-progress'));
    expect(screen.getByTestId('screen-progress')).toBeTruthy();
    expect(screen.getByText('TELEMETRY & PRs')).toBeTruthy();

    fireEvent.press(screen.getByTestId('tab-settings'));
    expect(screen.getByTestId('screen-settings')).toBeTruthy();
    expect(screen.getByText('DECK SETTINGS')).toBeTruthy();
  });

  it('switches themes via Settings screen and updates profile store', () => {
    render(<App />);

    fireEvent.press(screen.getByTestId('tab-settings'));
    fireEvent.press(screen.getByTestId('theme-btn-decker'));
    expect(useProfileStore.getState().theme).toBe('decker');

    act(() => {
      useProfileStore.getState().updateProfile({ fixedKettlebellWeight: 24 });
    });
    expect(useProfileStore.getState().profile.fixedKettlebellWeight).toBe(24);
  });

  it('opens Session Logger from Home and returns on Finish', () => {
    render(<App />);

    fireEvent.press(screen.getByTestId('start-session-btn'));
    expect(screen.getByTestId('screen-session-logger')).toBeTruthy();
    expect(screen.getByText(/SESSION LOGGER \/\/ session-new/)).toBeTruthy();

    fireEvent.press(screen.getByTestId('finish-session-btn'));
    expect(screen.getByTestId('screen-home')).toBeTruthy();
  });
});
