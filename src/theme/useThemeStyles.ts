// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { useMemo } from 'react';
import { useAppTheme } from './useTheme';

export function useThemeStyles() {
  const t = useAppTheme();
  return useMemo(
    () => ({
      bg: { backgroundColor: t.colors.background },
      surface: { backgroundColor: t.colors.surface },
      header: { backgroundColor: t.colors.headerBg },
      cardBg: { backgroundColor: t.colors.surface },
      text: { color: t.colors.textPrimary },
      textMuted: { color: t.colors.textSecondary },
      headerText: { color: t.colors.headerText },
      accent: { color: t.colors.primary },
      sectionHeader: { color: t.colors.sectionHeader },
      border: { borderColor: t.colors.border },
      primaryBorder: { borderColor: t.colors.primary },
      glow: { shadowColor: t.colors.shadow },
    }),
    [t],
  );
}
