# Release Workflow & Field Distribution

## 1. Build Profiles

`shadowtrain` uses Expo Application Services (EAS) to build standalone Android binaries and development clients. The profiles configured in `eas.json` map directly to the release tiers:

| Build Type      | Profile       | Artifact                    | Purpose & Distribution                                                                                                                      |
| :-------------- | :------------ | :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **Development** | `development` | `.apk` (dev client)         | Install-once dev client with custom native modules. Connects to `npx expo start` for live hot reloading.                                    |
| **Preview**     | `preview`     | `.apk` (standalone)         | Standalone release APK. Direct installation on test devices without needing Metro or a dev server. Ideal for GitHub Releases / IzzyOnDroid. |
| **Production**  | `production`  | `.aab` (Android App Bundle) | Optimized, signed release bundle for Google Play Console submission.                                                                        |

---

## 2. Triggering Builds via GitHub Actions

The `EAS Build` workflow (`.github/workflows/eas-build.yml`) automates build execution:

### A. Semantic Tag Triggers (Automated)

Pushing a semantic Git tag to `main` automatically fires the corresponding build:

```bash
# 1. Preview Standalone APK (vX.Y.Z)
git tag v0.2.0
git push origin v0.2.0

# 2. Development Client APK (vX.Y.Z-dev)
git tag v0.2.0-dev
git push origin v0.2.0-dev

# 3. Production App Bundle (vX.Y.Z-prod)
git tag v0.2.0-prod
git push origin v0.2.0-prod
```

### B. Manual Dispatch

In GitHub:

1. Navigate to **Actions** → **EAS Build**.
2. Click **Run workflow**.
3. Select the branch (`main`) and choose the profile (`preview`, `development`, or `production`).

---

## 3. Required Secrets & Configuration

To enable EAS cloud builds in GitHub Actions, configure the repository secret:

- **`EXPO_TOKEN`**: Generate a Personal Access Token in your Expo Account Settings (`expo.dev` → Account Settings → Access Tokens) and add it to **GitHub Repository Settings → Secrets and variables → Actions**.

---

## 4. Local Build Commands (CLI)

With EAS CLI installed (`npm install -g eas-cli` or `npx eas-cli`):

```bash
# Build standalone preview APK locally/via cloud
eas build --platform android --profile preview

# Build development client APK
eas build --platform android --profile development
```
