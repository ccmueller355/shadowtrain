// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
/* global process, Buffer, console */
import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 22050;
const OUT_DIR = path.resolve(process.cwd(), 'assets/audio');

function writeWav(filename, samples) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  fs.writeFileSync(path.join(OUT_DIR, filename), buffer);
}

function synthNotes(segments) {
  const out = [];
  for (const seg of segments) {
    const count = Math.floor(SAMPLE_RATE * seg.dur);
    for (let i = 0; i < count; i++) {
      const t = i / SAMPLE_RATE;
      const env = Math.min(1, i / (SAMPLE_RATE * 0.008)) * Math.exp(-t * (seg.decay ?? 8));
      const freq = seg.freqEnd
        ? seg.freq + ((seg.freqEnd - seg.freq) * i) / count
        : seg.freq;
      const wave =
        Math.sin(2 * Math.PI * freq * t) +
        (seg.harmonic ? 0.35 * Math.sin(2 * Math.PI * freq * 2 * t) : 0);
      out.push(wave * env * (seg.gain ?? 0.5));
    }
  }
  return out;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

writeWav('countdown_pip.wav', synthNotes([{ freq: 880, dur: 0.09, decay: 18, gain: 0.55 }]));
writeWav(
  'set_complete.wav',
  synthNotes([{ freq: 987.77, freqEnd: 1318.5, dur: 0.12, decay: 14, gain: 0.5 }])
);
writeWav(
  'rest_complete.wav',
  synthNotes([
    { freq: 659.25, dur: 0.11, decay: 10, harmonic: true, gain: 0.5 },
    { freq: 987.77, dur: 0.22, decay: 8, harmonic: true, gain: 0.55 },
  ])
);
writeWav(
  'interval_work.wav',
  synthNotes([
    { freq: 523.25, dur: 0.08, decay: 12, gain: 0.45 },
    { freq: 659.25, dur: 0.08, decay: 12, gain: 0.5 },
    { freq: 1046.5, dur: 0.22, decay: 7, harmonic: true, gain: 0.6 },
  ])
);
writeWav(
  'interval_rest.wav',
  synthNotes([
    { freq: 659.25, dur: 0.1, decay: 10, gain: 0.45 },
    { freq: 440, dur: 0.2, decay: 8, gain: 0.45 },
  ])
);

console.log('Generated 5 cyber-audio WAV cues in assets/audio/');
