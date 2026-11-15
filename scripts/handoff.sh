#!/usr/bin/env bash
# Genere le prompt de reprise a coller dans un NOUVEL agent. Usage: npm run handoff
set -euo pipefail
cd "$(dirname "$0")/.."
branch=$(git branch --show-current)
out=$(mktemp)
{
  echo "# Reprise de session (changement d'agent)"
  echo
  echo "Tu reprends le travail d'un autre agent sur ce depot. Avant toute action:"
  echo "1. Lis AGENTS.md, SKILLS.md, SPEC.md et docs/spec/*.md."
  echo "2. Lis le CONTEXT.md ci-dessous, verifie-le contre l'etat reel de git, puis ecris dans CONTEXT.md ton plan en 5 lignes."
  echo "3. Ne refais pas ce qui est marque fait. Pose-moi une question si quelque chose est ambigu."
  echo
  echo "## Etat git reel"
  echo "- Branche: ${branch}"
  echo
  echo '### Derniers commits (depuis main)'
  git log --oneline -n 15 main..HEAD 2>/dev/null || git log --oneline -n 15
  echo
  echo '### Fichiers modifies (non commits)'
  git status --short || true
  echo
  echo '### Diff depuis main (stat)'
  git diff --stat main...HEAD 2>/dev/null || true
  echo
  echo "## CONTEXT.md"
  if [ -f CONTEXT.md ]; then cat CONTEXT.md; else echo "(CONTEXT.md absent: lance 'npm run setup')"; fi
} > "$out"
cat "$out"
if command -v wl-copy >/dev/null; then wl-copy < "$out" && echo "(copie dans le presse-papiers)" >&2
elif command -v xclip >/dev/null; then xclip -selection clipboard < "$out" && echo "(copie dans le presse-papiers)" >&2; fi
rm -f "$out"
