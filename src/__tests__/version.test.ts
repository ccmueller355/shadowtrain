// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../..');

describe('Version Consistency Gate — VERSION, package.json, app.json, CHANGELOG.md & README.md', () => {
  const versionFile = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
  const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'));
  const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');

  it('VERSION file contains a valid semantic version string', () => {
    expect(versionFile).toMatch(/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/);
  });

  it('package.json version matches VERSION', () => {
    expect(packageJson.version).toBe(versionFile);
  });

  it('app.json expo.version matches VERSION', () => {
    expect(appJson.expo.version).toBe(versionFile);
  });

  it('CHANGELOG.md latest release heading matches VERSION', () => {
    const match = changelog.match(/^##\s+\[?v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?)\]?/m);
    expect(match).not.toBeNull();
    expect(match?.[1]).toBe(versionFile);
  });

  it('README.md version badge matches VERSION', () => {
    expect(readme).toContain(`https://img.shields.io/badge/version-${versionFile}-blue`);
  });
});
