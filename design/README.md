# design/ - Reference visuelle (Figma Make). INERTE: ne fait pas partie de l'application.

- `figma-make/`  : code exporte de Figma Make, SANS node_modules ni dist. **Lecture seule.** Exclu de tsc, eslint, vitest et du build. Aucun fichier de `src/` ne doit l'importer (un test le verifie).
- `screens/`     : captures PNG de chaque ecran et etat (`NN-nom-etat.png`). **Source de verite visuelle** pour les agents.
- `audio/`       : sons du prototype (si fichiers). Voir la decision "audio" dans `docs/spec/DESIGN.md`.

Regle: on **reimplemente** dans notre pile (Next, React, CSS variables, R3F). On ne copie pas le code du prototype tel quel.
Mode d'emploi: `docs/spec/DESIGN.md` (tokens, correspondance ecrans/composants, decisions) et SKILLS S18.
