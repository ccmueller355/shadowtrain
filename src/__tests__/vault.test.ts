// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { createHmac } from 'crypto';
import {
  computeBackupChecksum,
  parseAndValidateBackupJson,
  serializeBackupJson,
} from '../engine/portability';
import {
  constantTimeEqual,
  hmacSha256Hex,
  reconcileProfileWithLedger,
  replayCredLedger,
  resolveRewardAmount,
  SESSION_COMPLETION_CREDS,
} from '../engine/vault';
import { DEFAULT_PROFILE, useProfileStore } from '../stores/profileStore';
import { Profile, Session } from '../types';

function makeFinishedSession(id: string, finishedAt: number): Session {
  return {
    id,
    startedAt: finishedAt - 1800_000,
    finishedAt,
    entries: [],
  };
}

describe('M15 Cryptographic Vault & Ledger Integrity', () => {
  beforeEach(() => {
    useProfileStore.setState({ profile: DEFAULT_PROFILE, theme: 'fixer' });
  });

  describe('Pure-TS HMAC-SHA256', () => {
    it('matches Node crypto HMAC-SHA256 across short and multi-block keys', () => {
      const pairs = [
        { key: 'key', msg: 'The quick brown fox jumps over the lazy dog' },
        { key: 'shadowtrain::vault', msg: '{"creds":250,"sessions":[]}' },
        { key: 'k'.repeat(80), msg: 'long key exceeding 64-byte SHA-256 block size' },
      ];

      for (const { key, msg } of pairs) {
        const expected = createHmac('sha256', key).update(msg).digest('hex');
        expect(hmacSha256Hex(msg, key)).toBe(expected);
      }

      expect(constantTimeEqual('abc123', 'abc123')).toBe(true);
      expect(constantTimeEqual('abc123', 'abc124')).toBe(false);
      expect(constantTimeEqual('abc', 'abcd')).toBe(false);
    });
  });

  describe('Deterministic Cred Ledger Replay & Reconciliation', () => {
    it('reconstructs Creds from finished sessions, claimed rewards, and trainer unlocks', () => {
      const sessions: Session[] = [
        makeFinishedSession('s1', 1000),
        makeFinishedSession('s2', 2000),
        { id: 's-open', startedAt: 3000, entries: [] }, // unfinished -> 0 Creds
      ];

      // 2 finished * 25 = 50; daily-session (15) + first-jack-in (100) = 115; orc-merc (-150)
      // Total expected = 50 + 115 - 150 = 15
      const consistentProfile: Profile = {
        ...DEFAULT_PROFILE,
        creds: 15,
        claimedRewardIds: ['daily-session:2026-11-14', 'first-jack-in'],
        unlockedTrainerIds: ['drone-unit-0', 'orc-merc'],
      };

      const report = replayCredLedger(sessions, consistentProfile);
      expect(report.finishedSessionsCount).toBe(2);
      expect(report.sessionCreds).toBe(2 * SESSION_COMPLETION_CREDS);
      expect(report.rewardCreds).toBe(115);
      expect(report.spentCreds).toBe(150);
      expect(report.expectedCreds).toBe(15);
      expect(report.drift).toBe(0);
      expect(report.isConsistent).toBe(true);
      expect(resolveRewardAmount('unknown-reward')).toBe(0);
    });

    it('detects tampered Cred balance and reconciles profile via store action', () => {
      const sessions = [makeFinishedSession('s1', 1000)];
      useProfileStore.setState({
        profile: {
          ...DEFAULT_PROFILE,
          creds: 9999,
          claimedRewardIds: ['first-jack-in'],
          unlockedTrainerIds: ['drone-unit-0'],
        },
      });

      const { profile: reconciled, report } = reconcileProfileWithLedger(
        sessions,
        useProfileStore.getState().profile,
      );
      expect(report.isConsistent).toBe(false);
      expect(report.expectedCreds).toBe(125); // 25 + 100
      expect(report.drift).toBe(9999 - 125);
      expect(reconciled.creds).toBe(125);

      const storeReport = useProfileStore.getState().reconcileCredsFromLedger(sessions);
      expect(storeReport.isConsistent).toBe(false);
      expect(useProfileStore.getState().profile.creds).toBe(125);

      // Reconciling again is a consistent no-op
      const secondReport = useProfileStore.getState().reconcileCredsFromLedger(sessions);
      expect(secondReport.isConsistent).toBe(true);
    });
  });

  describe('HMAC-SHA256 Anti-Tamper Backup Validation', () => {
    it('signs exported JSON backups and rejects tampered or unsigned payloads', () => {
      const json = serializeBackupJson({
        profile: { ...DEFAULT_PROFILE, creds: 250 },
        theme: 'decker',
        sessions: [makeFinishedSession('s1', 1000)],
        exportedAt: '2026-11-14T14:00:00.000Z',
      });

      const parsed = parseAndValidateBackupJson(json);
      expect(parsed.meta.checksum).toMatch(/^[0-9a-f]{64}$/);
      expect(parsed.meta.checksum).toBe(computeBackupChecksum(parsed));

      // Tamper with Creds
      const tamperedCreds = JSON.parse(json);
      tamperedCreds.profile.creds = 999999;
      expect(() => parseAndValidateBackupJson(JSON.stringify(tamperedCreds))).toThrow(
        'Backup integrity check failed: invalid or missing checksum',
      );

      // Tamper with sessions
      const tamperedSessions = JSON.parse(json);
      tamperedSessions.sessions.push(makeFinishedSession('s-forged', 2000));
      expect(() => parseAndValidateBackupJson(JSON.stringify(tamperedSessions))).toThrow(
        'Backup integrity check failed: invalid or missing checksum',
      );

      // Strip checksum
      const unsigned = JSON.parse(json);
      delete unsigned.meta.checksum;
      expect(() => parseAndValidateBackupJson(JSON.stringify(unsigned))).toThrow(
        'Backup integrity check failed: invalid or missing checksum',
      );
    });
  });
});
