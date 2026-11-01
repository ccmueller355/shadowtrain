// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { ThemeName } from '../types';

export type { ThemeName };

export interface Theme {
  colors: {
    background: string;
    surface: string;
    headerBg: string;
    textPrimary: string;
    textSecondary: string;
    headerText: string;
    primary: string;
    secondary: string;
    sectionHeader: string;
    danger: string;
    border: string;
    checkedBg: string;
    shadow: string;
  };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
  borderRadius: number;
  fontFamily: 'monospace';
  label: string;
  description: string;
}

const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const borderRadius = 8;
const fontFamily = 'monospace' as const;

export const fixerTheme: Theme = {
  colors: {
    background: '#1e1a15',
    surface: '#2d2822',
    headerBg: '#15120f',
    textPrimary: '#e8dcc8',
    textSecondary: '#9e9480',
    headerText: '#e8dcc8',
    primary: '#d4824a',
    secondary: '#e0b85a',
    sectionHeader: '#e0b85a',
    danger: '#d06050',
    border: '#3d362e',
    checkedBg: '#352c24',
    shadow: 'rgba(212,130,74,0.14)',
  },
  spacing,
  borderRadius,
  fontFamily,
  label: "Fixer's Notebook",
  description: 'Warm leather tones with rust and brass',
};

export const stufferTheme: Theme = {
  colors: {
    background: '#f3ecde',
    surface: '#faf5ed',
    headerBg: '#2e241a',
    textPrimary: '#2e241a',
    textSecondary: '#6b5f50',
    headerText: '#faf5ed',
    primary: '#b8453a',
    secondary: '#2e241a',
    sectionHeader: '#2e241a',
    danger: '#b04444',
    border: '#e0d5c4',
    checkedBg: '#f0e6d6',
    shadow: 'rgba(140,58,58,0.06)',
  },
  spacing,
  borderRadius,
  fontFamily,
  label: 'Stuffer Shack',
  description: 'Aged parchment with dark ink accents',
};

export const deckerTheme: Theme = {
  colors: {
    background: '#14101c',
    surface: '#1e1a28',
    headerBg: '#0e0b14',
    textPrimary: '#e0d8ec',
    textSecondary: '#8c80a0',
    headerText: '#e0d8ec',
    primary: '#a888c0',
    secondary: '#c098d0',
    sectionHeader: '#c098d0',
    danger: '#c86060',
    border: '#2e2840',
    checkedBg: '#242030',
    shadow: 'rgba(168,136,192,0.10)',
  },
  spacing,
  borderRadius,
  fontFamily,
  label: "Decker's Den",
  description: 'Cool violet tones with soft lavender glow',
};

export const cyberTheme: Theme = {
  colors: {
    background: '#101820',
    surface: '#1a2430',
    headerBg: '#0a1018',
    textPrimary: '#d8e8f0',
    textSecondary: '#7090a8',
    headerText: '#d8e8f0',
    primary: '#64b8cc',
    secondary: '#80c8d8',
    sectionHeader: '#80c8d8',
    danger: '#cc8866',
    border: '#283848',
    checkedBg: '#202c38',
    shadow: 'rgba(100,184,204,0.10)',
  },
  spacing,
  borderRadius,
  fontFamily,
  label: 'Cyber Blue',
  description: 'Deep ocean tones with calm cyan accents',
};

export const terminalTheme: Theme = {
  colors: {
    background: '#101810',
    surface: '#1a2418',
    headerBg: '#0a100a',
    textPrimary: '#d0e8c8',
    textSecondary: '#58a058',
    headerText: '#d0e8c8',
    primary: '#60b860',
    secondary: '#80d080',
    sectionHeader: '#80d080',
    danger: '#ccaa44',
    border: '#284028',
    checkedBg: '#202c20',
    shadow: 'rgba(96,184,96,0.10)',
  },
  spacing,
  borderRadius,
  fontFamily,
  label: "Fiddler's Green",
  description: 'Eternal green fields of the Dreaming',
};

export const themes: Record<ThemeName, Theme> = {
  fixer: fixerTheme,
  stuffer: stufferTheme,
  decker: deckerTheme,
  cyber: cyberTheme,
  terminal: terminalTheme,
};
