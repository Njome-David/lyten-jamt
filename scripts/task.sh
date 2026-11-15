#!/usr/bin/env bash
# Usage:
#   bash scripts/task.sh start t04 engine-core    -> cree la branche t04-engine-core depuis main a jour
#   bash scripts/task.sh finish                   -> verify + push + aide pour ouvrir la PR
set -euo pipefail
cd "$(dirname "$0")/.."
cmd="${1:-}"

case "$cmd" in
  start)
    id="${2:-}"; slug="${3:-}"
    [[ "$id" =~ ^t[0-9]{2}$ ]] || { echo "Identifiant attendu: tNN (ex: t04)"; exit 1; }
    [[ "$slug" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || { echo "Slug attendu: kebab-case (ex: engine-core)"; exit 1; }
    git diff --quiet && git diff --cached --quiet || { echo "Arbre de travail non propre. Commitez ou stashez d'abord."; exit 1; }
    git fetch origin --quiet || true
    git switch main
    git pull --ff-only origin main || true
    branch="${id}-${slug}"
    git switch -c "$branch"
    if [ -f CONTEXT.md ]; then
      sed -i "s/^- Branche: .*/- Branche: ${branch}/" CONTEXT.md
      sed -i "s/^- Tache: .*/- Tache: ${id} (${slug})/" CONTEXT.md
    fi
    echo "Branche ${branch} creee. Mettez a jour CONTEXT.md (objectif, plan) avant de coder."
    ;;
  finish)
    branch=$(git branch --show-current)
    [ "$branch" != "main" ] || { echo "Vous etes sur main."; exit 1; }
    npm run verify
    git push -u origin "$branch"
    echo
    echo "Branche poussee. Titre de PR: type(scope): message [${branch%%-*}]  (le [tNN] final est obligatoire)."
    if command -v gh >/dev/null; then echo "Astuce: gh pr create --fill --base main"; fi
    ;;
  *)
    echo "Usage: bash scripts/task.sh start tNN slug | finish"; exit 1 ;;
esac
