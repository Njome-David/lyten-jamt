# CHANGELOG-CONTRACT.md

Toute modification d'un contrat (`src/engine/types.ts`, `SPEC.md`, `docs/spec/*`) est notee ici, dans la meme PR, avec la date, l'auteur, la raison et les roles impactes.

| Date | Auteur | Changement | Raison | Roles impactes |
|---|---|---|---|---|
| (T01) | equipe | Creation du contrat v1.1 | Ajout presentation, catalogue de donnees, regles agents | A B C D E |
| (T02) | Dave (role A) | Gel du contrat moteur `src/engine/types.ts` (v1.2, perimetre L2) : types fondamentaux, modeles NASA (Flare, Provenance), etat de mission (RunState), boucle diegetique (OptionPreview, StepPlayback, signatures previewOption et buildPlayback) et sauvegarde SaveV1 etendue (seen, speed). | Cadrage officiel du contrat moteur pour tous les roles | A B C D E |
| 2026-11-15 (T04) | Dave (role A) | Ajout des types et enums PassiveId, Passive, RadiationLevel, Radiation, Option, OptionId et raffinement d'OptionPreview (champs optionnels de design + champs de contrat) | Support des chargeurs, jauges et options de mission T04 | A B |
