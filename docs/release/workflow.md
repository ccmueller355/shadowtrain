# Release Workflow & Field Distribution

## 1. Build Profiles

`shadowtrain` builds standalone Android binaries directly on GitHub Actions (`ubuntu-latest`) via `npx expo prebuild --platform android` and Gradle — no Expo EAS token or cloud queue required.

| Build Type      | Profile       | Gradle Task       | Artifact                         | Purpose & Distribution                                                                            |
| :-------------- | :------------ | :---------------- | :------------------------------- | :------------------------------------------------------------------------------------------------ |
| **Preview**     | `preview`     | `assembleRelease` | `shadowtrain-vX.Y.Z-preview.apk` | Standalone release APK (no Metro needed). Attached to GitHub Releases & ideal for direct install. |
| **Development** | `development` | `assembleDebug`   | `shadowtrain-vX.Y.Z-dev.apk`     | Debug dev-client APK for connecting to `npx expo start` with live hot reloading.                  |
| **Production**  | `production`  | `bundleRelease`   | `shadowtrain-vX.Y.Z-prod.aab`    | Android App Bundle for Google Play Console submission.                                            |

Every build also generates a `.sha256` checksum and uploads both files as a GitHub Actions workflow artifact (retained for 30 days).

---

## 2. Triggering Builds via GitHub Actions

The `Android Build & Release` workflow (`.github/workflows/android-build.yml`) automates build execution and GitHub Releases:

### A. Pull Request Preview Builds (Automated)

Every non-Dependabot Pull Request targeting `main` automatically builds a standalone preview APK (`shadowtrain-vX.Y.Z-prN-preview.apk`), uploads it as a workflow artifact, and posts a download link directly in a PR comment for device testing before merge.

### B. Semantic Tag Triggers (Automated)

Pushing a semantic Git tag to `main` automatically builds the Android artifact and publishes a GitHub Release with the APK/AAB and `.sha256` attached:

```bash
# 1. Preview Standalone APK (vX.Y.Z)
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0

# 2. Development Client APK (vX.Y.Z-dev, marked as pre-release)
git tag -a v0.2.0-dev -m "Dev build v0.2.0-dev"
git push origin v0.2.0-dev

# 3. Production App Bundle (vX.Y.Z-prod)
git tag -a v0.2.0-prod -m "Production bundle v0.2.0-prod"
git push origin v0.2.0-prod
```

### C. Manual Dispatch

In GitHub:

1. Navigate to **Actions** → **Android Build & Release**.
2. Click **Run workflow**.
3. Select the branch (`main`) and choose the profile (`preview`, `development`, or `production`).
4. Download the APK/AAB from the workflow run's **Artifacts** section.

---

## 3. Local Build Commands

To build an Android APK locally (requires Android SDK & JDK 17):

```bash
# Generate native Android project
npx expo prebuild --platform android --clean --non-interactive

# Build standalone preview APK
cd android && ./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```
