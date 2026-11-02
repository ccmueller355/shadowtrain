// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../theme/useTheme';

interface Props {
  children: ReactNode;
  style?: ViewStyle;
  glow?: boolean;
}

export function CyberpunkCard({ children, style, glow = true }: Props) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
        glow && { shadowColor: theme.colors.primary },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
});
