// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { useProfileStore } from '../stores/profileStore';
import { themes } from './themes';

export function useAppTheme() {
  const themeName = useProfileStore((s) => s.theme);
  return themes[themeName] || themes.fixer;
}
