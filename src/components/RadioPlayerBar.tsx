// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RADIO_PRESETS, RadioStation, searchRadioStations } from '../engine/radio';
import { useRadioStore } from '../stores/radioStore';
import { useAppTheme } from '../theme/useTheme';
import { useThemeStyles } from '../theme/useThemeStyles';

interface RadioPlayerBarProps {
  compact?: boolean;
}

export function RadioPlayerBar(_props: RadioPlayerBarProps) {
  const theme = useAppTheme();
  const ts = useThemeStyles();

  const activeStation = useRadioStore((s) => s.activeStation);
  const isPlaying = useRadioStore((s) => s.isPlaying);
  const isLoading = useRadioStore((s) => s.isLoading);
  const radioVolume = useRadioStore((s) => s.radioVolume);
  const favorites = useRadioStore((s) => s.favorites);
  const resolvedPresetCache = useRadioStore((s) => s.resolvedPresetCache);
  const customStreamUrl = useRadioStore((s) => s.customStreamUrl);
  const error = useRadioStore((s) => s.error);

  const playPreset = useRadioStore((s) => s.playPreset);
  const playStation = useRadioStore((s) => s.playStation);
  const togglePlayPause = useRadioStore((s) => s.togglePlayPause);
  const stopRadio = useRadioStore((s) => s.stopRadio);
  const setRadioVolume = useRadioStore((s) => s.setRadioVolume);
  const toggleFavorite = useRadioStore((s) => s.toggleFavorite);
  const togglePresetFavorite = useRadioStore((s) => s.togglePresetFavorite);
  const setCustomStreamUrl = useRadioStore((s) => s.setCustomStreamUrl);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RadioStation[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);

  const isFav = activeStation ? favorites.some((f) => f.id === activeStation.id) : false;

  const filteredPresets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return RADIO_PRESETS;
    return RADIO_PRESETS.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.countryCode.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchErr(null);
    try {
      const results = await searchRadioStations({ name: searchQuery.trim(), limit: 12 });
      setSearchResults(results);
      if (results.length === 0) setSearchErr('No live stations found.');
    } catch (err) {
      setSearchErr(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handlePlayCustom = () => {
    const uri = customStreamUrl.trim();
    if (!uri) return;
    setPickerOpen(false);
    void playStation({
      id: `custom-${uri}`,
      name: 'Custom Stream',
      countryCode: 'NET',
      tags: 'custom',
      streamUrl: uri,
    });
  };

  return (
    <View
      testID="radio-player-bar"
      style={[
        styles.container,
        { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
      ]}
    >
      {/* Top Status & Transport Row */}
      <View style={styles.transportRow}>
        <View style={styles.stationInfo}>
          <Text style={[styles.stationTitle, ts.accent]} numberOfLines={1}>
            {isLoading
              ? 'TUNING STREAM...'
              : activeStation
                ? `${isPlaying ? '🔊' : '⏸'} ${activeStation.name}`
                : 'WORKOUT RADIO // STANDBY'}
          </Text>
          {activeStation ? (
            <Text style={[styles.stationMeta, ts.textMuted]} numberOfLines={1}>
              {activeStation.countryCode || 'NET'}
              {activeStation.bitrate ? ` • ${activeStation.bitrate}kbps` : ''}
            </Text>
          ) : null}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            testID="radio-vol-down"
            onPress={() => setRadioVolume(radioVolume - 0.15)}
            style={[styles.ctrlBtn, { borderColor: theme.colors.border }]}
          >
            <Text style={[styles.ctrlText, ts.textMuted]}>-</Text>
          </TouchableOpacity>
          <Text style={[styles.volText, ts.textMuted]}>{Math.round(radioVolume * 100)}%</Text>
          <TouchableOpacity
            testID="radio-vol-up"
            onPress={() => setRadioVolume(radioVolume + 0.15)}
            style={[styles.ctrlBtn, { borderColor: theme.colors.border }]}
          >
            <Text style={[styles.ctrlText, ts.textMuted]}>+</Text>
          </TouchableOpacity>

          {activeStation ? (
            <>
              <TouchableOpacity
                testID="radio-fav-btn"
                onPress={() => toggleFavorite(activeStation)}
                style={[styles.ctrlBtn, { borderColor: theme.colors.border }]}
              >
                <Text
                  style={[
                    styles.ctrlText,
                    { color: isFav ? theme.colors.primary : theme.colors.textSecondary },
                  ]}
                >
                  {isFav ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="radio-play-pause-btn"
                onPress={togglePlayPause}
                style={[styles.ctrlBtn, { borderColor: theme.colors.primary }]}
              >
                <Text style={[styles.ctrlText, ts.accent]}>{isPlaying ? '⏸' : '▶'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="radio-stop-btn"
                onPress={stopRadio}
                style={[styles.ctrlBtn, { borderColor: theme.colors.danger }]}
              >
                <Text style={[styles.ctrlText, { color: theme.colors.danger }]}>■</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>

      {error ? <Text style={[styles.errText, { color: theme.colors.danger }]}>{error}</Text> : null}

      {/* Station Picker Trigger */}
      <TouchableOpacity
        testID="radio-open-picker"
        onPress={() => setPickerOpen(true)}
        style={[
          styles.pickerBtn,
          { borderColor: theme.colors.primary, backgroundColor: theme.colors.checkedBg },
        ]}
      >
        <Text style={[styles.pickerBtnText, ts.accent]}>
          📻 STATIONS ({RADIO_PRESETS.length}) // SEARCH
        </Text>
      </TouchableOpacity>

      {/* Full-Screen Station Picker Modal */}
      <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <View style={[styles.modalRoot, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, ts.accent]}>WORKOUT RADIO // STATIONS</Text>
            <TouchableOpacity
              testID="radio-close-picker"
              onPress={() => setPickerOpen(false)}
              style={[styles.ctrlBtn, { borderColor: theme.colors.border }]}
            >
              <Text style={[styles.ctrlText, ts.textMuted]}>✕ CLOSE</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Filter / Live Search Bar */}
            <View style={styles.inputRow}>
              <TextInput
                testID="radio-search-input"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Filter presets or scan radio-browser..."
                placeholderTextColor={theme.colors.textSecondary}
                style={[
                  styles.input,
                  { color: theme.colors.textPrimary, borderColor: theme.colors.border },
                ]}
                onSubmitEditing={() => void handleSearch()}
              />
              <TouchableOpacity
                testID="radio-search-submit"
                onPress={() => void handleSearch()}
                style={[styles.actionBtn, { borderColor: theme.colors.primary }]}
              >
                <Text style={[styles.actionBtnText, ts.accent]}>{searching ? '...' : 'SCAN'}</Text>
              </TouchableOpacity>
            </View>

            {searchErr ? <Text style={[styles.errText, ts.textMuted]}>{searchErr}</Text> : null}

            <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent}>
              {searchResults.length > 0 ? (
                <View style={styles.sectionBlock}>
                  <Text style={[styles.subLabel, ts.accent]}>LIVE SCAN RESULTS</Text>
                  {searchResults.map((st) => {
                    const stFav = favorites.some((f) => f.id === st.id);
                    return (
                      <View
                        key={st.id}
                        style={[styles.resultRow, { borderColor: theme.colors.primary }]}
                      >
                        <TouchableOpacity
                          testID={`radio-result-fav-${st.id}`}
                          onPress={() => toggleFavorite(st)}
                          style={styles.rowStarBtn}
                        >
                          <Text
                            style={[
                              styles.ctrlText,
                              { color: stFav ? theme.colors.primary : theme.colors.textSecondary },
                            ]}
                          >
                            {stFav ? '★' : '☆'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          testID={`radio-result-${st.id}`}
                          onPress={() => {
                            setPickerOpen(false);
                            void playStation(st);
                          }}
                          style={styles.rowPlayArea}
                        >
                          <Text style={[styles.resultName, ts.text]} numberOfLines={1}>
                            [{st.countryCode || 'NET'}] {st.name}
                          </Text>
                          <Text style={[styles.resultMeta, ts.accent]}>▶ PLAY</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {favorites.length > 0 ? (
                <View style={styles.sectionBlock}>
                  <Text style={[styles.subLabel, ts.textMuted]}>★ FAVORITES</Text>
                  {favorites.map((fav) => (
                    <View
                      key={fav.id}
                      style={[styles.resultRow, { borderColor: theme.colors.border }]}
                    >
                      <TouchableOpacity
                        testID={`radio-fav-toggle-${fav.id}`}
                        onPress={() => toggleFavorite(fav)}
                        style={styles.rowStarBtn}
                      >
                        <Text style={[styles.ctrlText, { color: theme.colors.primary }]}>★</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        testID={`radio-fav-${fav.id}`}
                        onPress={() => {
                          setPickerOpen(false);
                          void playStation(fav);
                        }}
                        style={styles.rowPlayArea}
                      >
                        <Text style={[styles.resultName, ts.text]} numberOfLines={1}>
                          [{fav.countryCode || 'NET'}] {fav.name}
                        </Text>
                        <Text style={[styles.resultMeta, ts.accent]}>▶ PLAY</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.sectionBlock}>
                <Text style={[styles.subLabel, ts.textMuted]}>
                  REGIONAL WORKOUT &amp; ELECTRONIC PRESETS
                </Text>
                {filteredPresets.map((preset) => {
                  const cachedStation = resolvedPresetCache[preset.id];
                  const isSelected = !!cachedStation && activeStation?.id === cachedStation.id;
                  const isPresetFav =
                    !!cachedStation && favorites.some((f) => f.id === cachedStation.id);
                  return (
                    <View
                      key={preset.id}
                      style={[
                        styles.resultRow,
                        {
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                          backgroundColor: isSelected ? theme.colors.checkedBg : 'transparent',
                        },
                      ]}
                    >
                      <TouchableOpacity
                        testID={`radio-preset-fav-${preset.id}`}
                        onPress={() => void togglePresetFavorite(preset)}
                        style={styles.rowStarBtn}
                      >
                        <Text
                          style={[
                            styles.ctrlText,
                            {
                              color: isPresetFav
                                ? theme.colors.primary
                                : theme.colors.textSecondary,
                            },
                          ]}
                        >
                          {isPresetFav ? '★' : '☆'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        testID={`radio-preset-${preset.id}`}
                        onPress={() => {
                          setPickerOpen(false);
                          void playPreset(preset);
                        }}
                        style={styles.rowPlayArea}
                      >
                        <Text style={[styles.resultName, isSelected ? ts.accent : ts.text]}>
                          [{preset.region}] {preset.label}
                        </Text>
                        <Text style={[styles.resultMeta, ts.accent]}>▶ TUNE</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              <View style={styles.sectionBlock}>
                <Text style={[styles.subLabel, ts.textMuted]}>CUSTOM STREAM URL</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    testID="radio-custom-url-input"
                    value={customStreamUrl}
                    onChangeText={setCustomStreamUrl}
                    placeholder="Custom HTTPS stream URL..."
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[
                      styles.input,
                      { color: theme.colors.textPrimary, borderColor: theme.colors.border },
                    ]}
                  />
                  <TouchableOpacity
                    testID="radio-custom-url-play"
                    onPress={handlePlayCustom}
                    style={[styles.actionBtn, { borderColor: theme.colors.border }]}
                  >
                    <Text style={[styles.actionBtnText, ts.text]}>STREAM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stationInfo: {
    flex: 1,
    minWidth: 0,
  },
  stationTitle: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  stationMeta: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctrlBtn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  ctrlText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  volText: {
    fontSize: 10,
    fontFamily: 'monospace',
    minWidth: 30,
    textAlign: 'center',
  },
  errText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  pickerBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  pickerBtnText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  rowStarBtn: {
    paddingRight: 8,
    paddingVertical: 2,
  },
  rowPlayArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalRoot: {
    flex: 1,
    paddingTop: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  modalBody: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    gap: 14,
    paddingBottom: 24,
  },
  sectionBlock: {
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  actionBtnText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  resultName: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'monospace',
    marginRight: 8,
  },
  resultMeta: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
