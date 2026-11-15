# Boucle de travail humaine (jusqu'a CP1 et apres)

Une fois la premiere installation faite (`npm run setup -- "Prenom" "Agent"`), chaque dev suit cette boucle. L'agent execute les commandes (`task`, `verify`, `next`, `finish`); l'humain ne fait que **3 gestes par tache**.

## Chaque session
1. `git switch main && git pull --ff-only` (ou demandez a l'agent).
2. Ouvrez le depot dans l'editeur, agent en mode **Agent** (il peut lancer des commandes dans le terminal: autorisez `npm run ...` et `git`).
3. Collez UNE fois: `autopilote role X` (X = votre lettre). L'agent applique AGENTS.md section 12.

## Chaque tache (les 3 gestes humains)
1. **Valider le plan**: l'agent s'arrete apres avoir ecrit son plan dans CONTEXT.md. Lisez-le 30 secondes, repondez `go` ou corrigez.
2. **Regarder le resultat**: a la fin, ouvrez le jeu (`npm run dev`) ou la capture jointe; pour l'interface et la 3D, comparez avec `design/screens/`.
3. **Ouvrir la PR et la faire relire**: titre finissant par `[tNN]`, relecture croisee, merge en squash quand la CI est verte. Puis retour au point 1 de la session.

## Si l'agent est bloque ("bloquee: Txx attend ...")
Ne rien brancher depuis une autre branche. Faites `git pull`, relancez `npm run next -- X`. Si la PR attendue n'est pas mergee, relancez le relecteur ou passez a une tache preparatoire sur donnees factices.

## Changer d'agent
`npm run handoff`, collez le resultat dans le nouvel agent. Voir le guide (document 03, section 7.3).
