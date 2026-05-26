#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_NAME="website"

cd "${ROOT_DIR}"

if command -v mamba >/dev/null 2>&1; then
  CONDA_CMD="mamba"
elif command -v conda >/dev/null 2>&1; then
  CONDA_CMD="conda"
else
  echo "mamba or conda is required to run tests in the ${ENV_NAME} environment." >&2
  exit 1
fi

"${CONDA_CMD}" run -n "${ENV_NAME}" bash -lc '
set -euo pipefail

cd "'"${ROOT_DIR}"'"

export HOME=/tmp/website-home
export BUNDLE_PATH=/tmp/website-bundle
export PLAYWRIGHT_BROWSERS_PATH=/tmp/website-playwright

mkdir -p "$HOME" "$BUNDLE_PATH" "$PLAYWRIGHT_BROWSERS_PATH"

npm run test:unit
ruby -S bundle _2.4.1_ exec jekyll build
npx playwright test
'
