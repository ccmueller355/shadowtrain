// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RADIO_PRESETS, RadioStation, searchRadioStations } from '../engine/radio';
import { useRadioStore } from '../stores/radioStore';
import { useAppTheme } from '../theme/useTheme';
import { useThemeStyles } from '../theme/useThemeStyles';

interface RadioPlayerBarProps {
  compact?: boolean;
}

export function RadioPlayerBar({ compact = false }: RadioPlayerBarProps) {
  const theme = useAppTheme();
  const ts = useThemeStyles();

  const activeStation = useRadioStore((s) => s.activeStation);
  const isPlaying = useRadioStore((s) => s.isPlaying);
  const isLoading = useRadioStore((s) => s.isLoading);
  const radioVolume = useRadioStore((s) => s.radioVolume);
  const favorites = useRadioStore((s) => s.favorites);
  const customStreamUrl = useRadioStore((s) => s.customStreamUrl);
  const error = useRadioStore((s) => s.error);

  const playPreset = useRadioStore((s) => s.playPreset);
  const playStation = useRadioStore((s) => s.playStation);
  const togglePlayPause = useRadioStore((s) => s.togglePlayPause);
  const stopRadio = useRadioStore((s) => s.stopRadio);
  const setRadioVolume = useRadioStore((s) => s.setRadioVolume);
  const toggleFavorite = useRadioStore((s) => s.toggleFavorite);
  const setCustomStreamUrl = useRadioStore((s) => s.setCustomStreamUrl);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RadioStation[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);

  const isFav = activeStation ? favorites.some((f) => f.id === activeStation.id) : false;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchErr(null);
    try {
      const results = await searchRadioStations({ name: searchQuery.trim(), limit: 8 });
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

      {/* Regional Presets */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
        {RADIO_PRESETS.map((preset) => {
          const isSelected = activeStation?.name.toLowerCase().includes(preset.searchName);
          return (
            <TouchableOpacity
              key={preset.id}
              testID={`radio-preset-${preset.id}`}
              onPress={() => void playPreset(preset)}
              style={[
                styles.presetChip,
                {
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: isSelected ? theme.colors.checkedBg : 'transparent',
                },
              ]}
            >
              <Text style={[styles.presetText, isSelected ? ts.accent : ts.text]}>
                [{preset.region}] {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Expandable Live Search + Favorites + Custom URL (in Settings or when toggled) */}
      {!compact ? (
        <View style={styles.searchSection}>
          <TouchableOpacity
            testID="radio-toggle-search"
            onPress={() => setShowSearch((v) => !v)}
            style={styles.searchToggleRow}
          >
            <Text style={[styles.searchToggleText, ts.accent]}>
              {showSearch
                ? '▾ HIDE LIVE SEARCH & CUSTOM URL'
                : '▸ SEARCH RADIO-BROWSER / FAVORITES / CUSTOM URL'}
            </Text>
          </TouchableOpacity>

          {showSearch ? (
            <View style={styles.searchBox}>
              <View style={styles.inputRow}>
                <TextInput
                  testID="radio-search-input"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search station (e.g. synthwave, bass, dubai)..."
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
                  <Text style={[styles.actionBtnText, ts.accent]}>
                    {searching ? '...' : 'SCAN'}
                  </Text>
                </TouchableOpacity>
              </View>

              {searchErr ? <Text style={[styles.errText, ts.textMuted]}>{searchErr}</Text> : null}

              {searchResults.map((st) => (
                <TouchableOpacity
                  key={st.id}
                  testID={`radio-result-${st.id}`}
                  onPress={() => void playStation(st)}
                  style={[styles.resultRow, { borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.resultName, ts.text]} numberOfLines={1}>
                    [{st.countryCode || 'NET'}] {st.name}
                  </Text>
                  <Text style={[styles.resultMeta, ts.accent]}>▶ PLAY</Text>
                </TouchableOpacity>
              ))}

              {favorites.length > 0 ? (
                <View style={styles.favBlock}>
                  <Text style={[styles.subLabel, ts.textMuted]}>★ FAVORITES</Text>
                  {favorites.map((fav) => (
                    <TouchableOpacity
                      key={fav.id}
                      onPress={() => void playStation(fav)}
                      style={[styles.resultRow, { borderColor: theme.colors.border }]}
                    >
                      <Text style={[styles.resultName, ts.text]} numberOfLines={1}>
                        ★ [{fav.countryCode || 'NET'}] {fav.name}
                      </Text>
                      <Text style={[styles.resultMeta, ts.accent]}>▶ PLAY</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

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
          ) : null}
        </View>
      ) : null}
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
  presetScroll: {
    flexGrow: 0,
  },
  presetChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
  },
  presetText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  searchSection: {
    gap: 6,
  },
  searchToggleRow: {
    paddingTop: 2,
  },
  searchToggleText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  searchBox: {
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
    paddingVertical: 5,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
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
  favBlock: {
    gap: 4,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
