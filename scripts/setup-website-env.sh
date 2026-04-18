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
  echo "mamba or conda is required to create the ${ENV_NAME} environment." >&2
  exit 1
fi

if "${CONDA_CMD}" env list | grep -Eq "(^|[[:space:]])${ENV_NAME}([[:space:]]|$)"; then
  "${CONDA_CMD}" env update -n "${ENV_NAME}" -f "${ROOT_DIR}/environment.yml" --prune
else
  "${CONDA_CMD}" env create -f "${ROOT_DIR}/environment.yml"
fi

"${CONDA_CMD}" run -n "${ENV_NAME}" bash -lc '
set -euo pipefail

cd "'"${ROOT_DIR}"'"

export HOME=/tmp/website-home
export BUNDLE_PATH=/tmp/website-bundle
export PLAYWRIGHT_BROWSERS_PATH=/tmp/website-playwright

mkdir -p "$HOME" "$BUNDLE_PATH" "$PLAYWRIGHT_BROWSERS_PATH"

if ! ruby -S gem list -i bundler -v 2.4.1 >/dev/null 2>&1; then
  ruby -S gem install bundler -v 2.4.1 --no-document
fi

npm ci
ruby -S bundle _2.4.1_ install
npx playwright install chromium
'
