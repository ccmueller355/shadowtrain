// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CyberpunkCard } from '../../src/components/CyberpunkCard';
import {
  parseAndValidateBackupJson,
  serializeBackupJson,
  serializeSessionsCsv,
} from '../../src/engine/portability';
import {
  canUnlockTrainer,
  getTrainerById,
  isTrainerUnlocked,
  SHADOW_TRAINERS,
} from '../../src/engine/trainers';
import { useExerciseStore } from '../../src/stores/exerciseStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { useSessionStore } from '../../src/stores/sessionStore';
import { ThemeName, themes } from '../../src/theme/themes';
import { useAppTheme } from '../../src/theme/useTheme';
import { useThemeStyles } from '../../src/theme/useThemeStyles';
import { Equipment, Goal, TrainerId, Units } from '../../src/types';

const THEME_KEYS = Object.keys(themes) as ThemeName[];
const GOALS: Goal[] = ['strength', 'hypertrophy', 'endurance'];
const UNITS_LIST: Units[] = ['kg', 'lb'];
const KB_WEIGHTS = [12, 16, 20, 24, 28, 32];
const ALL_EQUIPMENT: Equipment[] = [
  'kettlebell',
  'rings',
  'bodyweight',
  'hand_gripper',
  'jump_rope',
  'stretching',
  'dumbbell',
  'barbell',
  'bands',
  'cable',
  'machine',
];

export default function SettingsScreen() {
  const theme = useAppTheme();
  const ts = useThemeStyles();

  const activeTheme = useProfileStore((s) => s.theme);
  const setTheme = useProfileStore((s) => s.setTheme);
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const setGoal = useProfileStore((s) => s.setGoal);
  const setUnits = useProfileStore((s) => s.setUnits);
  const setFixedKettlebellWeight = useProfileStore((s) => s.setFixedKettlebellWeight);
  const toggleEquipment = useProfileStore((s) => s.toggleEquipment);
  const unlockAndSelectTrainer = useProfileStore((s) => s.unlockAndSelectTrainer);

  const recentSessions = useSessionStore((s) => s.recentSessions);
  const activeSession = useSessionStore((s) => s.activeSession);
  const restoreSessionsFromBackup = useSessionStore((s) => s.restoreSessionsFromBackup);
  const exercises = useExerciseStore((s) => s.exercises);

  const [selectedTrainerId, setSelectedTrainerId] = useState<TrainerId>(
    profile.activeTrainerId ?? 'orc-merc',
  );
  const [payloadText, setPayloadText] = useState('');
  const [portabilityStatus, setPortabilityStatus] = useState<string | null>(null);

  const selectedTrainer = getTrainerById(selectedTrainerId);
  const selectedUnlocked = isTrainerUnlocked(profile, selectedTrainer.id);
  const selectedActive = (profile.activeTrainerId ?? 'orc-merc') === selectedTrainer.id;
  const selectedAffordable = canUnlockTrainer(profile, selectedTrainer.id);

  const allSessions = activeSession ? [activeSession, ...recentSessions] : recentSessions;

  const handleTrainerAction = () => {
    const ok = unlockAndSelectTrainer(selectedTrainer.id);
    if (!ok) {
      setPortabilityStatus(
        `INSUFFICIENT CREDS: NEED ${selectedTrainer.unlockCost} ¥ TO UNLOCK ${selectedTrainer.callsign}`,
      );
    } else {
      setPortabilityStatus(`ACTIVE TRAINER LOCKED: ${selectedTrainer.name.toUpperCase()}`);
    }
  };

  const handleExportJson = () => {
    const json = serializeBackupJson({
      profile,
      theme: activeTheme,
      sessions: allSessions,
    });
    setPayloadText(json);
    setPortabilityStatus(`EXPORTED V1 BACKUP (${allSessions.length} SESSIONS)`);
    try {
      void Share.share({ message: json, title: 'shadowtrain-backup.json' });
    } catch {
      // Share sheet optional in headless/test runtime
    }
  };

  const handleExportCsv = () => {
    const csv = serializeSessionsCsv(allSessions, exercises);
    setPayloadText(csv);
    setPortabilityStatus(`EXPORTED CSV SESSION LOG (${allSessions.length} SESSIONS)`);
    try {
      void Share.share({ message: csv, title: 'shadowtrain-sessions.csv' });
    } catch {
      // Share sheet optional in headless/test runtime
    }
  };

  const handleImportJson = () => {
    try {
      const envelope = parseAndValidateBackupJson(payloadText);
      updateProfile(envelope.profile);
      if (envelope.theme) {
        setTheme(envelope.theme);
      }
      restoreSessionsFromBackup(envelope.sessions);
      setPortabilityStatus(`RESTORED V1 BACKUP (${envelope.sessions.length} SESSIONS)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid backup';
      setPortabilityStatus(`IMPORT ERROR: ${message}`);
    }
  };

  const skillEntries: { label: string; value: number }[] = [
    { label: 'STR', value: selectedTrainer.skills.strength },
    { label: 'CND', value: selectedTrainer.skills.conditioning },
    { label: 'MOB', value: selectedTrainer.skills.mobility },
    { label: 'CAL', value: selectedTrainer.skills.calisthenics },
    { label: 'TCH', value: selectedTrainer.skills.tech },
  ];

  return (
    <ScrollView style={[styles.container, ts.bg]} testID="screen-settings">
      <View style={styles.headerRow}>
        <Text style={[styles.title, ts.accent]}>DECK SETTINGS</Text>
        <View
          style={[styles.credsBadge, { borderColor: theme.colors.primary }]}
          testID="creds-balance-badge"
        >
          <Text style={[styles.credsBadgeText, ts.accent]}>CREDS: {profile.creds ?? 0} ¥</Text>
        </View>
      </View>

      <Text style={[styles.section, ts.sectionHeader]}>SHADOW TRAINER ROSTER (5 DOSSIERS)</Text>
      <View style={styles.trainerRosterRow}>
        {SHADOW_TRAINERS.map((trainer) => {
          const isSelected = trainer.id === selectedTrainer.id;
          const isActive = (profile.activeTrainerId ?? 'orc-merc') === trainer.id;
          const unlocked = isTrainerUnlocked(profile, trainer.id);

          return (
            <TouchableOpacity
              key={trainer.id}
              testID={`trainer-card-${trainer.id}`}
              style={[
                styles.trainerChip,
                ts.surface,
                {
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => setSelectedTrainerId(trainer.id)}
            >
              <Image source={trainer.portrait} style={styles.trainerThumb} />
              <Text style={[styles.trainerCallsign, isSelected ? ts.accent : ts.text]}>
                {trainer.callsign}
              </Text>
              <Text style={[styles.trainerStatus, ts.textMuted]}>
                {isActive ? 'ACTIVE' : unlocked ? 'READY' : `${trainer.unlockCost} ¥`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <CyberpunkCard style={styles.dossierCard}>
        <View testID="trainer-dossier-card">
          <View style={styles.dossierHeader}>
            <Image
              source={selectedTrainer.portrait}
              style={[styles.dossierPortrait, { borderColor: theme.colors.primary }]}
              testID="trainer-dossier-image"
            />
            <View style={styles.dossierTitleCol}>
              <Text style={[styles.dossierName, ts.accent]} testID="trainer-dossier-name">
                {selectedTrainer.name}
              </Text>
              <Text style={[styles.dossierRace, ts.text]}>{selectedTrainer.raceClass}</Text>
              <Text style={[styles.dossierCost, ts.textMuted]}>
                {selectedUnlocked
                  ? 'STATUS: UNLOCKED'
                  : `UNLOCK COST: ${selectedTrainer.unlockCost} ¥ CREDS`}
              </Text>
            </View>
          </View>

          <Text style={[styles.dossierSpecialty, ts.text]}>
            SPECIALTY // {selectedTrainer.specialty}
          </Text>
          <Text style={[styles.dossierLore, ts.textMuted]}>{selectedTrainer.lore}</Text>

          <View style={styles.skillsContainer}>
            {skillEntries.map((sk) => (
              <View key={sk.label} style={styles.skillRow}>
                <Text style={[styles.skillLabel, ts.textMuted]}>{sk.label}</Text>
                <View style={[styles.skillTrack, { backgroundColor: theme.colors.border }]}>
                  <View
                    style={[
                      styles.skillFill,
                      {
                        width: `${sk.value * 10}%`,
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.skillVal, ts.text]}>{sk.value}/10</Text>
              </View>
            ))}
          </View>

          <View style={[styles.splitBox, { borderColor: theme.colors.border }]}>
            <Text style={[styles.splitTitle, ts.accent]}>
              SIGNATURE PROGRAM // {selectedTrainer.programName}
            </Text>
            <Text style={[styles.splitFocus, ts.textMuted]}>{selectedTrainer.programFocus}</Text>
          </View>

          <TouchableOpacity
            testID={`trainer-action-btn-${selectedTrainer.id}`}
            disabled={selectedActive}
            style={[
              styles.trainerActionBtn,
              {
                backgroundColor: selectedActive
                  ? theme.colors.surface
                  : selectedAffordable
                    ? theme.colors.primary
                    : theme.colors.surface,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={handleTrainerAction}
          >
            <Text
              style={[
                styles.trainerActionText,
                {
                  color:
                    !selectedActive && selectedAffordable
                      ? theme.colors.headerBg
                      : theme.colors.primary,
                },
              ]}
            >
              {selectedActive
                ? 'ACTIVE TRAINER // DEPLOYED'
                : selectedUnlocked
                  ? `DEPLOY ${selectedTrainer.callsign} AS ACTIVE TRAINER`
                  : `UNLOCK ${selectedTrainer.callsign} (${selectedTrainer.unlockCost} ¥)`}
            </Text>
          </TouchableOpacity>
        </View>
      </CyberpunkCard>

      <Text style={[styles.section, ts.sectionHeader]}>OPERATOR PROFILE</Text>
      <CyberpunkCard style={styles.profileCard}>
        <Text style={[styles.meta, ts.text]}>
          GOAL: {profile.goal.toUpperCase()} ({profile.repRange.min}–{profile.repRange.max} REPS)
        </Text>
        <Text style={[styles.meta, ts.textMuted]}>
          UNITS: {profile.units.toUpperCase()} // FIXED KB: {profile.fixedKettlebellWeight ?? 16}{' '}
          {profile.units}
        </Text>

        <Text style={[styles.subLabel, ts.textMuted]}>TRAINING GOAL</Text>
        <View style={styles.chipRow}>
          {GOALS.map((g) => {
            const active = profile.goal === g;
            return (
              <TouchableOpacity
                key={g}
                testID={`goal-btn-${g}`}
                style={[
                  styles.smallChip,
                  ts.surface,
                  { borderColor: active ? theme.colors.primary : theme.colors.border },
                ]}
                onPress={() => setGoal(g)}
              >
                <Text style={[styles.chipText, active ? ts.accent : ts.text]}>
                  {g.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.subLabel, ts.textMuted]}>WEIGHT UNITS & FIXED KETTLEBELL</Text>
        <View style={styles.chipRow}>
          {UNITS_LIST.map((u) => {
            const active = profile.units === u;
            return (
              <TouchableOpacity
                key={u}
                testID={`units-btn-${u}`}
                style={[
                  styles.smallChip,
                  ts.surface,
                  { borderColor: active ? theme.colors.primary : theme.colors.border },
                ]}
                onPress={() => setUnits(u)}
              >
                <Text style={[styles.chipText, active ? ts.accent : ts.text]}>
                  {u.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
          {KB_WEIGHTS.map((w) => {
            const active = (profile.fixedKettlebellWeight ?? 16) === w;
            return (
              <TouchableOpacity
                key={w}
                testID={`kb-weight-btn-${w}`}
                style={[
                  styles.smallChip,
                  ts.surface,
                  { borderColor: active ? theme.colors.primary : theme.colors.border },
                ]}
                onPress={() => setFixedKettlebellWeight(w)}
              >
                <Text style={[styles.chipText, active ? ts.accent : ts.text]}>
                  {w}
                  {profile.units}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.subLabel, ts.textMuted]}>AVAILABLE EQUIPMENT KIT</Text>
        <View style={styles.chipRow}>
          {ALL_EQUIPMENT.map((eq) => {
            const active = profile.availableEquipment.includes(eq);
            return (
              <TouchableOpacity
                key={eq}
                testID={`eq-toggle-${eq}`}
                style={[
                  styles.smallChip,
                  ts.surface,
                  { borderColor: active ? theme.colors.primary : theme.colors.border },
                ]}
                onPress={() => toggleEquipment(eq)}
              >
                <Text style={[styles.chipText, active ? ts.accent : ts.textMuted]}>
                  {eq.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </CyberpunkCard>

      <Text style={[styles.section, ts.sectionHeader]}>VISUAL THEME</Text>
      <View style={styles.themeRow}>
        {THEME_KEYS.map((key) => {
          const selected = key === activeTheme;
          return (
            <TouchableOpacity
              key={key}
              testID={`theme-btn-${key}`}
              style={[
                styles.themeChip,
                ts.surface,
                { borderColor: selected ? theme.colors.primary : theme.colors.border },
              ]}
              onPress={() => setTheme(key)}
            >
              <Text style={[styles.chipText, selected ? ts.accent : ts.text]}>
                {themes[key].label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.section, ts.sectionHeader]}>DATA PORTABILITY (BACKUP & CSV)</Text>
      <CyberpunkCard style={styles.portabilityCard}>
        <View style={styles.portabilityBtnRow}>
          <TouchableOpacity
            testID="export-json-btn"
            style={[styles.ioBtn, { borderColor: theme.colors.primary }]}
            onPress={handleExportJson}
          >
            <Text style={[styles.ioBtnText, ts.accent]}>EXPORT .JSON</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="import-json-btn"
            style={[styles.ioBtn, { borderColor: theme.colors.primary }]}
            onPress={handleImportJson}
          >
            <Text style={[styles.ioBtnText, ts.accent]}>IMPORT .JSON</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="export-csv-btn"
            style={[styles.ioBtn, { borderColor: theme.colors.primary }]}
            onPress={handleExportCsv}
          >
            <Text style={[styles.ioBtnText, ts.accent]}>EXPORT .CSV</Text>
          </TouchableOpacity>
        </View>

        {portabilityStatus && (
          <Text style={[styles.statusText, ts.accent]} testID="portability-status">
            {portabilityStatus}
          </Text>
        )}

        <TextInput
          testID="portability-payload-input"
          style={[
            styles.payloadInput,
            ts.text,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.background },
          ]}
          multiline
          placeholder="Exported JSON/CSV payload or paste shadowtrain-backup JSON here to restore..."
          placeholderTextColor={theme.colors.textSecondary}
          value={payloadText}
          onChangeText={setPayloadText}
        />
      </CyberpunkCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' },
  credsBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  credsBadgeText: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
  section: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 8 },
  trainerRosterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  trainerChip: {
    width: '18%',
    minWidth: 62,
    borderWidth: 1,
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
  },
  trainerThumb: { width: 44, height: 44, borderRadius: 6, marginBottom: 4 },
  trainerCallsign: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  trainerStatus: { fontSize: 9, fontFamily: 'monospace', marginTop: 2 },
  dossierCard: { marginBottom: 20, padding: 12 },
  dossierHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dossierPortrait: {
    width: 84,
    height: 84,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
  },
  dossierTitleCol: { flex: 1 },
  dossierName: { fontSize: 15, fontWeight: 'bold', fontFamily: 'monospace' },
  dossierRace: { fontSize: 11, fontFamily: 'monospace', marginTop: 2 },
  dossierCost: { fontSize: 10, fontFamily: 'monospace', marginTop: 4 },
  dossierSpecialty: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 4 },
  dossierLore: { fontSize: 11, fontFamily: 'monospace', lineHeight: 16, marginBottom: 10 },
  skillsContainer: { marginBottom: 10 },
  skillRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  skillLabel: { width: 34, fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  skillTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden', marginHorizontal: 8 },
  skillFill: { height: '100%', borderRadius: 3 },
  skillVal: { width: 32, fontSize: 10, fontFamily: 'monospace', textAlign: 'right' },
  splitBox: { borderWidth: 1, borderRadius: 6, padding: 8, marginBottom: 10 },
  splitTitle: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  splitFocus: { fontSize: 10, fontFamily: 'monospace', marginTop: 2 },
  trainerActionBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  trainerActionText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  profileCard: { marginBottom: 20, padding: 12 },
  meta: { fontSize: 13, fontFamily: 'monospace', marginBottom: 4 },
  subLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 10,
    marginBottom: 6,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  smallChip: { borderWidth: 1, borderRadius: 5, paddingVertical: 6, paddingHorizontal: 10 },
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  themeChip: { borderWidth: 1, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12 },
  chipText: { fontSize: 11, fontFamily: 'monospace' },
  portabilityCard: { marginBottom: 32, padding: 12 },
  portabilityBtnRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  ioBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  ioBtnText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  statusText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 8 },
  payloadInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    minHeight: 80,
    fontSize: 10,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
  },
});
