// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───

export interface RadioStation {
  id: string;
  name: string;
  countryCode: string;
  tags: string;
  streamUrl: string;
  codec?: string;
  bitrate?: number;
}

export interface RadioPreset {
  id: string;
  label: string;
  region: string;
  countryCode: string;
  searchName: string;
  fallbackTag: string;
}

export interface RadioSearchParams {
  name?: string;
  countryCode?: string;
  tag?: string;
  limit?: number;
}

const RADIO_BROWSER_MIRRORS = [
  'https://de1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://at1.api.radio-browser.info',
];

const USER_AGENT = 'Shadowtrain/0.1.1';

/** Curated regional workout & electronic presets (resolved live via Radio Browser API). */
export const RADIO_PRESETS: RadioPreset[] = [
  {
    id: 'de-sunshine-workout',
    label: 'Sunshine Live Workout',
    region: 'DE',
    countryCode: 'DE',
    searchName: 'Sunshine Live - Workout',
    fallbackTag: 'workout',
  },
  {
    id: 'de-sunshine-live',
    label: 'Sunshine Live',
    region: 'DE',
    countryCode: 'DE',
    searchName: 'sunshine live',
    fallbackTag: 'electronic',
  },
  {
    id: 'de-energy-live',
    label: 'ENERGY Live',
    region: 'DE',
    countryCode: 'DE',
    searchName: 'energy',
    fallbackTag: 'dance',
  },
  {
    id: 'de-dasding',
    label: 'DASDING',
    region: 'DE',
    countryCode: 'DE',
    searchName: 'dasding',
    fallbackTag: 'pop',
  },
  {
    id: 'eu-iloveworkout',
    label: 'I ♥ Workout',
    region: 'EU',
    countryCode: 'DE',
    searchName: 'workout',
    fallbackTag: 'workout',
  },
  {
    id: 'uk-kiss',
    label: 'KISS FM UK',
    region: 'UK',
    countryCode: 'GB',
    searchName: 'kiss',
    fallbackTag: 'dance',
  },
  {
    id: 'fr-nrj-fitness',
    label: 'NRJ Fitness',
    region: 'FR',
    countryCode: 'FR',
    searchName: 'nrj',
    fallbackTag: 'dance',
  },
  {
    id: 'es-los40',
    label: 'LOS40 Dance',
    region: 'ES',
    countryCode: 'ES',
    searchName: 'los40',
    fallbackTag: 'dance',
  },
  {
    id: 'nl-slam',
    label: 'SLAM!',
    region: 'NL',
    countryCode: 'NL',
    searchName: 'slam',
    fallbackTag: 'dance',
  },
  {
    id: 'at-kronehit',
    label: 'Kronehit',
    region: 'AT',
    countryCode: 'AT',
    searchName: 'kronehit',
    fallbackTag: 'dance',
  },
  {
    id: 'ch-energy',
    label: 'ENERGY CH',
    region: 'CH',
    countryCode: 'CH',
    searchName: 'energy',
    fallbackTag: 'dance',
  },
  {
    id: 'it-m2o',
    label: 'm2o Dance',
    region: 'IT',
    countryCode: 'IT',
    searchName: 'm2o',
    fallbackTag: 'electronic',
  },
  {
    id: 'pl-eska',
    label: 'Radio ESKA',
    region: 'PL',
    countryCode: 'PL',
    searchName: 'eska',
    fallbackTag: 'dance',
  },
  {
    id: 'be-mnm',
    label: 'MNM Hits',
    region: 'BE',
    countryCode: 'BE',
    searchName: 'mnm',
    fallbackTag: 'pop',
  },
  {
    id: 'se-nrj',
    label: 'NRJ Sweden',
    region: 'SE',
    countryCode: 'SE',
    searchName: 'nrj',
    fallbackTag: 'dance',
  },
  {
    id: 'no-nrj',
    label: 'NRJ Norway',
    region: 'NO',
    countryCode: 'NO',
    searchName: 'nrj',
    fallbackTag: 'dance',
  },
  {
    id: 'dk-nova',
    label: 'NOVA',
    region: 'DK',
    countryCode: 'DK',
    searchName: 'nova',
    fallbackTag: 'pop',
  },
  {
    id: 'fi-nrj',
    label: 'NRJ Finland',
    region: 'FI',
    countryCode: 'FI',
    searchName: 'nrj',
    fallbackTag: 'dance',
  },
  {
    id: 'pt-megahits',
    label: 'Mega Hits',
    region: 'PT',
    countryCode: 'PT',
    searchName: 'mega hits',
    fallbackTag: 'pop',
  },
  {
    id: 'ie-spin',
    label: 'SPIN 1038',
    region: 'IE',
    countryCode: 'IE',
    searchName: 'spin',
    fallbackTag: 'pop',
  },
  {
    id: 'cz-evropa2',
    label: 'Evropa 2',
    region: 'CZ',
    countryCode: 'CZ',
    searchName: 'evropa 2',
    fallbackTag: 'dance',
  },
  {
    id: 'gr-deejay',
    label: 'Athens DeeJay',
    region: 'GR',
    countryCode: 'GR',
    searchName: 'deejay',
    fallbackTag: 'dance',
  },
  {
    id: 'hu-radio1',
    label: 'Rádió 1',
    region: 'HU',
    countryCode: 'HU',
    searchName: 'radio 1',
    fallbackTag: 'dance',
  },
  {
    id: 'ro-kiss',
    label: 'Kiss FM RO',
    region: 'RO',
    countryCode: 'RO',
    searchName: 'kiss',
    fallbackTag: 'dance',
  },
  {
    id: 'us-kiis',
    label: 'KIIS / Dance US',
    region: 'US',
    countryCode: 'US',
    searchName: 'kiis',
    fallbackTag: 'dance',
  },
  {
    id: 'jp-blockfm',
    label: 'block.fm',
    region: 'JP',
    countryCode: 'JP',
    searchName: 'block.fm',
    fallbackTag: 'electronic',
  },
  {
    id: 'cn-hitfm',
    label: 'CNR Hit FM',
    region: 'CN',
    countryCode: 'CN',
    searchName: 'hit fm',
    fallbackTag: 'pop',
  },
  {
    id: 'ae-virgin',
    label: 'Virgin Dubai',
    region: 'ME',
    countryCode: 'AE',
    searchName: 'virgin',
    fallbackTag: 'pop',
  },
  {
    id: 'in-mirchi',
    label: 'Club Mirchi',
    region: 'IN',
    countryCode: 'IN',
    searchName: 'mirchi',
    fallbackTag: 'bollywood',
  },
];

interface RawRadioBrowserStation {
  stationuuid: string;
  name: string;
  countrycode?: string;
  tags?: string;
  url_resolved?: string;
  url?: string;
  codec?: string;
  bitrate?: number;
}

function mapStation(raw: RawRadioBrowserStation): RadioStation | null {
  const streamUrl = (raw.url_resolved || raw.url || '').trim();
  if (!streamUrl) return null;
  return {
    id: raw.stationuuid,
    name: raw.name.trim(),
    countryCode: (raw.countrycode || '').toUpperCase(),
    tags: raw.tags || '',
    streamUrl,
    codec: raw.codec,
    bitrate: raw.bitrate,
  };
}

/** Query `radio-browser.info` mirrors for live, working radio stations. */
export async function searchRadioStations(params: RadioSearchParams): Promise<RadioStation[]> {
  const qs = new URLSearchParams({
    hidebroken: 'true',
    order: 'clickcount',
    reverse: 'true',
    limit: String(params.limit ?? 12),
  });
  if (params.name?.trim()) qs.set('name', params.name.trim());
  if (params.countryCode?.trim()) qs.set('countrycode', params.countryCode.trim().toUpperCase());
  if (params.tag?.trim()) qs.set('tag', params.tag.trim().toLowerCase());

  let lastError: unknown;
  for (const mirror of RADIO_BROWSER_MIRRORS) {
    try {
      const res = await fetch(`${mirror}/json/stations/search?${qs.toString()}`, {
        method: 'GET',
        headers: { 'User-Agent': USER_AGENT },
      });
      if (!res.ok) {
        lastError = new Error(`Radio Browser HTTP ${res.status}`);
        continue;
      }
      const data = (await res.json()) as RawRadioBrowserStation[];
      const mapped = data.map(mapStation).filter((s): s is RadioStation => s !== null);
      // Prefer HTTPS streams first so Android cleartext restrictions don't block playback.
      mapped.sort((a, b) => {
        const aHttps = a.streamUrl.startsWith('https://') ? 1 : 0;
        const bHttps = b.streamUrl.startsWith('https://') ? 1 : 0;
        return bHttps - aHttps;
      });
      return mapped;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Radio Browser unreachable');
}

/** Resolve a regional preset to a live stream via Radio Browser API. */
export async function resolvePresetStation(preset: RadioPreset): Promise<RadioStation | null> {
  const byName = await searchRadioStations({
    name: preset.searchName,
    countryCode: preset.countryCode,
    limit: 6,
  });
  if (byName.length > 0) return byName[0];

  const byTag = await searchRadioStations({
    tag: preset.fallbackTag,
    countryCode: preset.countryCode,
    limit: 6,
  });
  return byTag[0] ?? null;
}
