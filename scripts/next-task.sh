#!/usr/bin/env bash
# Affiche la prochaine tache EXECUTABLE d'un role, d'apres TASKS.md et l'historique git de main.
# Une tache est "faite" quand un commit de main contient son [tNN] dans le titre (titre de PR squashe).
# Usage: npm run next -- A   (A|B|C|D|E)
set -euo pipefail
cd "$(dirname "$0")/.."
role="${1:-}"
[[ "$role" =~ ^[A-E]$ ]] || { echo "Usage: npm run next -- A|B|C|D|E"; exit 1; }
git fetch origin --tags --quiet 2>/dev/null || true
ref=origin/main; git rev-parse --verify -q "$ref" >/dev/null || ref=main

done_task() { git log "$ref" --format=%s | grep -iE "\[$1\]" >/dev/null; }
dep_ok() {
  case "$1" in
    CP1) git tag -l | grep -qx cp1 ;;
    CP2) git tag -l | grep -qx cp2 ;;
    GEL) git tag -l | grep -qx v1-freeze ;;
    T[0-9][0-9]) done_task "${1,,}" ;;
    *) return 0 ;;
  esac
}

pending=0
while IFS='|' read -r _ id r deps branch due title _; do
  id=$(echo $id); r=$(echo $r); deps=$(echo $deps); branch=$(echo $branch); due=$(echo $due); title=$(echo $title)
  [ "$r" = "$role" ] || continue
  if done_task "${id,,}"; then continue; fi
  pending=$((pending+1))
  missing=""
  for d in $(echo "$deps" | tr ',' ' '); do dep_ok "$d" || missing="$missing $d"; done
  if [ -z "$missing" ]; then
    echo "PROCHAINE TACHE (role $role): $id - $title"
    echo "  branche : $branch   echeance : $due"
    echo "  demarrer: npm run task -- start ${id,,} ${branch#${id,,}-}"
    echo "  criteres: voir la section '### $id' de TASKS.md"
    exit 0
  else
    echo "bloquee: $id ($title) attend:$missing"
  fi
done < <(grep -E '^\| T[0-9]{2} \|' TASKS.md)

if [ "$pending" -eq 0 ]; then echo "Aucune tache restante pour le role $role."; else echo "Aucune tache executable pour l'instant: attendre les merges ci-dessus (git pull), ou prevenir le dev."; fi
