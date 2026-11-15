#!/usr/bin/env bash
# Premiere installation locale. Usage: bash scripts/setup.sh "Prenom" "Agent utilise"
set -euo pipefail
cd "$(dirname "$0")/.."
DEV="${1:-$(git config user.name || echo dev)}"
AGENT="${2:-non precise}"

command -v node >/dev/null || { echo "Node.js manquant (installer nvm puis 'nvm install 22')"; exit 1; }
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
[ "$NODE_MAJOR" -ge 20 ] || { echo "Node >= 20 requis (actuel: $(node -v))"; exit 1; }

if [ -f package-lock.json ]; then npm ci; else npm install; fi

git config core.hooksPath .githooks
chmod +x .githooks/* scripts/*.sh 2>/dev/null || true

if [ ! -f CONTEXT.md ]; then
  sed -e "s/{{DEV}}/${DEV}/" -e "s/{{AGENT}}/${AGENT}/" -e "s/{{DATE}}/$(date '+%Y-%m-%d %H:%M')/" CONTEXT.template.md > CONTEXT.md
  echo "CONTEXT.md cree (local, non suivi par git)."
else
  echo "CONTEXT.md existe deja: conserve."
fi

echo
echo "Setup termine. Verification:"
npm run verify
echo
echo "Suite: lisez AGENTS.md puis SKILLS.md, puis lancez: npm run task -- start tNN slug"
