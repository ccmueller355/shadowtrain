#!/usr/bin/env bash
# ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
# Local CI pipeline for ShadowTrain
# Usage:
#   bash scripts/ci-local.sh           # Full CI (secrets, lint, format, tsc, expo config, expo-doctor, jest coverage, vitepress build)
#   bash scripts/ci-local.sh --quick   # Fast loop (secrets, lint, format, tsc, jest coverage)

set -euo pipefail

QUICK=false
if [[ "${1:-}" == "--quick" ]]; then
  QUICK=true
fi

export PATH="$HOME/.local/share/mise/shims:$HOME/.local/bin:$PATH"

echo "═══════════════════════════════════════════════════════════════"
echo "  SHADOWTRAIN // NEURAL DECK v5.1 — LOCAL CI PIPELINE"
echo "═══════════════════════════════════════════════════════════════"

# 1. Gitleaks secrets scan
echo ""
echo "▶ [1/8] Scanning for secrets (gitleaks)..."
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks detect --source . --verbose --config .gitleaks.toml
else
  echo "  ⚠ gitleaks binary not found in PATH — installing v8.21.2 to ~/.local/bin..."
  mkdir -p "$HOME/.local/bin"
  curl -sL "https://github.com/gitleaks/gitleaks/releases/download/v8.21.2/gitleaks_8.21.2_linux_x64.tar.gz" \
    | tar -xz -C "$HOME/.local/bin" gitleaks
  "$HOME/.local/bin/gitleaks" detect --source . --verbose --config .gitleaks.toml
fi

# 2. ESLint check
echo ""
echo "▶ [2/8] Running ESLint (npm run lint)..."
npm run lint

# 3. Prettier format check
echo ""
echo "▶ [3/8] Checking code formatting (npm run format:check)..."
npm run format:check

# 4. TypeScript strict check
echo ""
echo "▶ [4/8] Running TypeScript strict check (tsc --noEmit)..."
npx tsc --noEmit

if [[ "$QUICK" == "true" ]]; then
  echo ""
  echo "▶ [5/5] Running Unit & Component Tests with Coverage (npm run test:coverage)..."
  npm run test:coverage
  echo ""
  echo "✅ [CLEAN RUN] Quick local CI green across the board."
  exit 0
fi

# 5. Expo config verification
echo ""
echo "▶ [5/8] Verifying Expo configuration..."
npx expo config --type introspect >/dev/null
echo "  ✔ Expo config valid."

# 6. Expo Doctor
echo ""
echo "▶ [6/8] Running Expo Doctor..."
npx --yes expo-doctor

# 7. Jest unit + component tests with coverage
echo ""
echo "▶ [7/8] Running Unit & Component Tests (CT) with coverage..."
npm run test:coverage

# 8. VitePress documentation build (with coverage report)
echo ""
echo "▶ [8/8] Building VitePress documentation..."
rm -rf docs/public/coverage
mkdir -p docs/public/coverage
cp -r coverage/lcov-report/* docs/public/coverage/
npx vitepress build docs

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ [CLEAN RUN] All 8 ShadowTrain CI gates green!"
echo "═══════════════════════════════════════════════════════════════"
