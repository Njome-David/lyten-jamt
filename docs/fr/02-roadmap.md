# Roadmap des développeurs - Plan de PR T01 à T30

Équipe LYTEN | NASA Space Apps Challenge 2026 | Version 1.1 | Remplace la roadmap précédente (section 6 du Team Plan v1)

> **Attention au temps réel.** Nous sommes **dimanche 15 novembre**. La date limite officielle de soumission indiquée par le défi est le **dimanche 15 novembre à 23 h 59, heure locale** (à reconfirmer sur la page de soumission). **T+0 = l'instant où vous lancez T01.** Si des heures se sont déjà écoulées, calculez le temps restant `H` et appliquez la **table de compression** (section 2) avant toute chose. Ne planifiez jamais au-delà de `deadline - 2 h` : c'est votre heure de soumission interne.

# 1. Règles de pilotage

- **Contrat gelé à T+1** (`types.ts`). **Plus de nouvelle fonctionnalité après T+8** sans en retirer une de même coût. **Plus de développement de fonctionnalité après T+18** (gel de la démo).
- Une tâche = une branche `tNN-slug` = une PR, **mergée dans l'ordre du plan** (section 4). Merge en squash après CI verte et une relecture croisée.
- Chaque checkpoint est un **go / no-go**, et un tag git (`cp1`, `cp2`, `v1-freeze`, `v1-release`) sert de point de retour arrière.
- Le rôle **A (intégration)** a la voix prépondérante pour couper du périmètre si le groupe est partagé. Les autres apportent des faits : tests et horloge.
- **Deux choses ne se délèguent pas aux agents** : la relecture scientifique (rôle C) et l'enregistrement de la vidéo (rôle D).

# 2. Temps restant : table de compression

| Temps restant `H` à T+0 | Niveau de périmètre visé | Ce qu'on garde | Ce qu'on retire d'emblée |
|---|---|---|---|
| ≥ 22 h | **L1 complet** | 10 missions, sites ×2, grades/séries/badges, 3D complète, son | rien |
| 16 à 22 h | **L2 réduit** | 3 missions par astre (relay, core, garden), 2 sites, cinématiques de base, grades/badges simples | missions seismic et mapper, extras de données P2, Playwright |
| 10 à 16 h | **L3 chemin minimum** | voir section 9 (2 missions : Lune et Mars) | tout le reste |
| < 10 h | **L4 d'urgence** | moteur + 2 missions + vidéo honnête de ce qui tourne | toute fonctionnalité P1 |

Les échéances ci-dessous sont données en **heures relatives pour un projet de 24 h**. Pour un `H` plus petit, comprimez **proportionnellement** les blocs de construction (T+1 à T+18) mais **gardez intacts** : le gel, le déploiement final, la répétition, la vidéo, la soumission et le tampon final (les 6 dernières heures de `H`, ou 3 h si `H` < 12).

# 3. Jalons

| T+ | Heure réelle | Jalon | Doit être vrai |
|---|---|---|---|
| 0:00 | __:__ | Lancement | Documents 01 à 03 lus, rôles A à E attribués, dépôt GitHub créé |
| 1:00 | __:__ | **CP0 : Contrat et scaffold** | T01 mergée, `types.ts` mergé (T02), staging vide en ligne, `npm run verify` vert pour tous |
| 8:00 | __:__ | **CP1 : Tranche verticale** | Sur staging : Lune, relay, Shackleton, Facile, chargement, 6 étapes **animées**, un vrai flare DONKI en événement, débrief |
| 14:00 | __:__ | **CP2 : P0 complet** | Mars jouable avec délai, alertes, débrief, mode jury, sauvegarde ; test sur téléphone ; décision Vert / Ambre / Rouge |
| 18:00 | __:__ | **GEL DE LA DÉMO** | Tag `v1-freeze` ; seuls les bugs S1 et S2 |
| 18:30 | __:__ | Déploiement production n° 1 | Depuis `v1-freeze` |
| 18:30 à 19:30 | __:__ | **Répétition 1** | Script de démo 3 fois, chronométré, sur l'URL de production, une fois sur téléphone |
| 20:00 | __:__ | **VERSION FINALE** | Tag `v1-release`, dernier déploiement prévu, liste de contrôle des liens passée |
| 20:00 à 21:00 | __:__ | Enregistrement de la vidéo | Depuis la version finale |
| 21:00 à 22:00 | __:__ | Sous-titres, mise en ligne, texte de soumission | Vidéo publique, sous-titres anglais |
| 22:00 | __:__ | **SOUMISSION** | Page de confirmation vue |
| 22:30 à 23:15 | __:__ | **Répétition 2** | Test à froid depuis les liens soumis, par quelqu'un qui n'a pas construit le parcours |
| 23:15 à 24:00 | __:__ | Tampon | Correction S1 ou nouvelle soumission, puis arrêt |

# 4. Rôles et plan de PR

## 4.1 Les cinq rôles (répartition égale)

| Rôle | Responsabilité | PR principales |
|---|---|---|
| **A Moteur et intégration** | moteur, bots, aperçu des coûts, lecture d'étape, intégration, déploiement, release | T01, T02, T04, T08, T13, T14, T28, T29 |
| **B Interface et UX** | écrans, HUD, dialogues et compagnon, loupe, accessibilité, décor 2D de repli | T05, T10, T12, T21, T23, T26 |
| **C Données et science** | sonde et récupération NASA, snapshots, puces REAL/GAME, passeport données, relecture scientifique, texte de soumission | T03, T09, T20, T24, T27 |
| **D Contenu et progression** | missions, dialogues, XP/grades/badges, sauvegarde, sons, vidéo | T07, T17, T18, T19, T22, T25, T30 |
| **E Scène 3D** | terrain, kit d'avant-poste, ciel, cinématiques, performance | T06, T11, T15, T16 |

## 4.2 Plan de PR dans l'ordre de merge

| PR | Branche | Rôle | Dépend de | Échéance | Livrable |
|---|---|---|---|---|---|
| T01 | `t01-scaffold` | A | - | T+1 | Scaffold du dépôt (livré dans l'archive), CI, hooks, règles d'agents |
| T02 | `t02-engine-contract` | A | T01 | T+1 | `types.ts` gelé, signatures de `previewOption` et `buildPlayback`, `CHANGELOG-CONTRACT.md` |
| T03 | `t03-data-core` | C | T01 | T+3 | Sonde des endpoints, `fetch` des vrais flares DONKI (récent + mai 2024), règles strictes de `verify-data`, squelette `facts.ts` |
| T04 | `t04-engine-core` | A | T02 | T+5 | Chargement, jauges, règles passives, radiations, options, `previewOption`, tests |
| T05 | `t05-ui-shell` | B | T01 | T+5 | Jetons de design, `GameShell`, machine à états d'écrans (données factices), squelette `Stage2D` |
| T06 | `t06-stage-foundation` | E | T01 | T+5 | `<Canvas>` persistant, `OrbitScene`, `SurfaceScene` (terrain, ciel), bruit, détection de qualité |
| T07 | `t07-content-schema` | D | T02 | T+6 | Archétypes, sites, schéma de missions avec `enabled`, textes des 2 missions relay (Lune et Mars) |
| T08 | `t08-engine-events` | A | T04 | T+7 | Événements, alertes, délai Mars, score, `buildPlayback`, tests |
| T09 | `t09-data-catalog` | C | T03 | T+7 | OSDR, avatars Image Library (téléchargés), `solar.ts`, faits de base |
| T10 | `t10-dialog-system` | B | T05 | T+7 | `DialogBox`, SVG de Nova (6 expressions), exécuteur de scripts, tour guidé avec projecteurs, enregistrement dans `seen` |
| T11 | `t11-outpost-kit` | E | T06 | T+8 | Kit d'avant-poste, cinématiques `travel`, `deploy`, `GenericAction` |
| T12 | `t12-mission-hud` | B | T05, T04 | T+8 | Jauges animées, cartes d'option avec pastilles de coût, bande de progression, calque d'alerte |
| **T13** | `t13-integration-cp1` | A | T04, T08, T09, T11, T12 | **T+8** | **Intégration : mission relay Lune jouable sur staging (CP1)** |
| T14 | `t14-bots-balance` | A | T13 | T+11 | Bots, `npm run bots`, réglage des cibles |
| T15 | `t15-cinematics-core` | E | T11 | T+11 | Cinématiques `drill`, `experiment`, `repair`, `uplink` (avec visuel du délai) |
| T16 | `t16-cinematics-events` | E | T15 | T+14 | Flare, poussière, panne, blackout, nuit lunaire, victoire, défaite |
| T17 | `t17-content-moon` | D | T07 | T+10 | 5 missions Lune (textes) |
| T18 | `t18-content-mars` | D | T17 | T+13 | 5 missions Mars (textes) |
| T19 | `t19-progression-save` | D | T07 | T+12 | XP, grades, séries, badges, `save.ts` (avec `seen`, `speed`) |
| T20 | `t20-data-lens` | C | T09, T12 | T+12 | Puces REAL/GAME, Loupe données, Passeport données, Science map |
| T21 | `t21-judge-mode` | B | T13 | T+13 | Mode jury complet |
| T22 | `t22-nova-scripts` | D | T10, T17 | T+14 | Tous les dialogues de Nova et leurs déclencheurs |
| **CP2** | tag `cp2` | tous | T14 à T22 | **T+14** | **P0 complet, Vert / Ambre / Rouge** |
| T23 | `t23-debrief-title` | B | T13, T19 | T+15 | Débrief « rapport de mission », titre et profil, étagère de badges, choix d'avatar |
| T24 | `t24-data-extras` | C | T09 | T+15 | CME, SEP, photos de sites, SDO, InSight, Trek, APOD, EPIC (seulement ce qui passe le contrat) |
| T25 | `t25-sound-haptics` | D | T19 | T+17 | Sons synthétisés, haptique |
| T26 | `t26-a11y-perf` | B (+E pour la 3D) | CP2 | T+17 | Accessibilité, performance, repli 2D vérifié |
| T27 | `t27-science-review` | C | CP2 | T+17 | Faits `verified`, `docs/SCIENCE.md` généré |
| T28 | `t28-e2e-smoke` | A | CP2 | T+17 | Test e2e (optionnel) et dernier passage des bots |
| **GEL** | tag `v1-freeze` | tous | | **T+18** | **Gel de la démo** |
| T29 | `t29-release-docs` | A | GEL | T+20 | README final, tag `v1-release`, déploiement final |
| T30 | `t30-video-submission` | D (vidéo), C (script, sous-titres, texte) | T29 | T+22 | Vidéo publique avec sous-titres anglais, soumission |

# 5. Critères d'acceptation par PR

Ces critères sont copiés dans la section 3 de `CONTEXT.md` et dans la PR. Pour toutes : `npm run verify` vert, aucun import interdit, aucune donnée NASA inventée, CONTEXT.md à jour.

| PR | Critères d'acceptation spécifiques |
|---|---|
| T01 | L'archive est extraite, `npm run setup` passe, `main` protégée, la CI tourne sur la première PR, les hooks refusent un mauvais message de commit |
| T02 | `types.ts` compile ; tous les rôles l'importent sans erreur ; `CHANGELOG-CONTRACT.md` renseigné ; `previewOption` et `buildPlayback` déclarés avec leurs types |
| T03 | `npm run data:probe` documente chaque endpoint (statut réel) dans `docs/DATA-CATALOG.generated.md` ; snapshots DONKI avec provenance committés ; mai 2024 en 2 fenêtres ; `verify-data --strict` détecte un snapshot vide |
| T04 | Tests verts : déterminisme (même graine = même résultat), bornes 0-100, budget de chargement refusé au-dessus de 10, passifs et radiations conformes au document 01 §6 ; `previewOption` testé |
| T05 | Parcours titre → débrief avec données factices au clavier et au tactile ; jetons de design en variables CSS ; `Stage2D` s'affiche sans WebGL |
| T06 | Un seul `<Canvas>` persistant ; caméra Titre → Destination → surface sans rechargement ; `quality` détecté ; aucune fuite mémoire visible après 20 changements de scène |
| T07 | Schéma validé par test (longueurs, archétypes) ; missions relay Lune et Mars complètes ; drapeaux `enabled` fonctionnels |
| T08 | Événements seedés testés (flare A/B/C, M, X, poussière, panne, blackout) ; expiration du chrono ; délai Mars ; `buildPlayback` pur et testé ; un pool de flares vide ne plante pas |
| T09 | `osdr-studies.json` avec vraies études ; avatars téléchargés avec crédit et `nasa_id` ; `solar.ts` renvoie le bon niveau ; faits en `needs-review` |
| T10 | Un dialogue complet (machine à écrire, toucher pour continuer, saut) ; tour guidé avec projecteurs ; `seen` enregistré ; **aucun dialogue pendant un chrono actif** ; reduced-motion |
| T11 | Rover qui traverse la scène en 3 styles de durées différentes ; `deploy` fonctionnel ; `GenericAction` utilisé quand une cinématique manque |
| T12 | Les jauges s'animent pendant l'action ; pastilles de coût sur les 3 cartes ; bande de progression ; alerte avec compte à rebours accessible |
| T13 | **Parcours complet sur staging** : chargement → 6 étapes animées → un vrai flare → débrief ; tests moteur verts ; `donki-flr-recent.json` committé |
| T14 | `npm run bots` imprime les taux ; cibles du document 01 §6.8 atteintes ou écart documenté |
| T15 | Cinématiques fonctionnelles aux progrès 0, 0,5 et 1 ; visuel du délai Mars ; 60 images/s visées |
| T16 | Chaque événement a sa cinématique ou le repli ; victoire et défaite bienveillantes |
| T17 / T18 | 5 missions par astre jouables par le bot sans plantage ; textes conformes (longueur, niveau de lecture) |
| T19 | XP, grades (bornes 499/500), série et joker, chaque badge testés ; sauvegarde corrompue sans plantage |
| T20 | Chaque nombre porte une puce REAL ou GAME ; la Loupe affiche les sources ; le Passeport est généré |
| T21 | « Play demo », menu d'événements, partie courte, profil de démo, rejouer mai 2024, Science map |
| T22 | Tous les déclencheurs (document 01 §8.4) ont un dialogue ; ton conforme ; longueurs respectées |
| T23 | Débrief avec étoiles, XP, historique des jauges, source ; titre avec profil et badges |
| T24 | Chaque source ajoutée remplit les 4 points du contrat d'intégration ou n'est pas ajoutée |
| T25 | Sons et vibration ; `muted` respecté ; aucun son avant le premier geste |
| T26 | Passage de la liste d'accessibilité ; mesures de performance notées dans la PR |
| T27 | `npm run verify:release` vert ; `docs/SCIENCE.md` généré ; faits non vérifiés retirés de l'interface |
| T28 | Test e2e vert (ou abandonné explicitement) ; bots relancés sur la version finale |
| T29 | README sans paramètre à remplir ; URL de production vérifiée ; tag `v1-release` |
| T30 | Vidéo publique avec sous-titres anglais ; lien testé en fenêtre privée ; soumission confirmée |

# 6. Planning par blocs (qui fait quoi)

| Bloc | A | B | C | D | E |
|---|---|---|---|---|---|
| **T+0:00 à 1:00** | T01 puis T02 | lit les specs, prépare les jetons de design | clé API NASA, `data:probe`, note les statuts réels | lit les specs, prépare le schéma de contenu | lit les specs, teste R3F (versions) |
| **CP0 T+1:00** | CP0 : si non vert, 30 min maximum pour corriger | | | | |
| **T+1:00 à 3:00** | T04 (chargement, jauges, passifs) | T05 (shell et écrans factices) | T03 (DONKI) | T07 (archétypes, sites) | T06 (Canvas, orbite) |
| **T+3:00 à 5:00** | T04 fin (options, aperçu) | T05 fin, démarre T10 | T03 fin, démarre T09 | T07 : missions relay | T06 : terrain, ciel |
| **T+5:00 à 8:00** | T08 (événements, lecture d'étape) puis T13 | T10 puis T12 | T09 fin (OSDR, avatars, `solar.ts`) | T17 : missions Lune | T11 (kit, travel, deploy) |
| **CP1 T+8:00** | tous jouent une mission Lune complète, liste de corrections, tag `cp1` | | | | |
| **T+8:30 à 11:00** | T14 (bots, réglage Lune) | T12 fin, T21 | T20 (puces, loupe) | T17 fin, T19 | T15 (drill, experiment) |
| **T+11:00 à 14:00** | T14 (Mars, cibles) | T21 fin | T24 | T18, T22 | T15 fin, T16 |
| **CP2 T+14:00** | tous jouent Lune et Mars sur téléphone, décision Vert / Ambre / Rouge, tag `cp2` | | | | |
| **T+14:30 à 17:00** | T28 | T23 puis T26 | T27 (relecture) | T25 | finition 3D, perf |
| **GEL T+18:00** | tag `v1-freeze` | | | | |
| **T+18:00 à 18:30** | bugs S1, S2 ; déploiement n° 1 à 18:30 | bugs | bugs science | bugs | bugs |
| **T+18:30 à 19:30** | **Répétition 1 (tous)** | | | | |
| **T+19:30 à 20:00** | T29 (README) | bugs | SCIENCE.md final | prépare le script vidéo | bugs |
| **T+20:00** | **VERSION FINALE** (tag `v1-release`) + liste de contrôle des liens | | | | |
| **T+20:00 à 22:00** | régression, standby | régression, standby | script et sous-titres, texte de soumission | **enregistrement vidéo** | standby |
| **T+22:00** | **SOUMISSION** | | | | |
| **T+22:00 à 24:00** | Répétition 2, tampon | | | | |

Règle d'ordre du contenu : **écrire d'abord les deux missions relay (Lune et Mars)** pour que le chemin minimum existe tôt.

# 7. Siestes (minimum, pas du repos sain)

| Qui | Sieste | Pourquoi cette fenêtre |
|---|---|---|
| E | T+8:30 à 10:00 | juste après CP1 : le kit est livré, la suite est cinématiques |
| D | T+10:30 à 13:00 | missions Lune finies, Mars en agent |
| C | T+11:30 à 14:00 | pipeline de données terminé, la relecture vient après CP2 |
| B | T+14:30 à 16:30 | interface P0 finie |
| A | T+15:00 à 17:00 | bots réglés au CP2 |

Deux personnes endormies au plus en même temps ; **tout le monde est réveillé** aux CP1, CP2 et de T+17 jusqu'à la fin. Repas de 15 minutes ensemble vers T+5, T+11, T+17 et T+21, avec un point de 10 minutes.

# 8. Checkpoints : critères go / no-go

| Checkpoint | Vert | Sinon |
|---|---|---|
| **CP0** | `types.ts` mergé, build OK, staging en ligne, `verify` vert pour tous | Stop de toute fonctionnalité ; A et E corrigent ; 30 minutes maximum |
| **CP1** | Parcours complet Lune relay animé sur staging avec un vrai flare ; tests moteur verts | Si non jouable à T+9:30 : tout le monde sur l'intégration ; à T+11 sans progrès : déclarer le chemin minimum |
| **CP2** | **Vert** : 10 missions jouables, bots proches des cibles, Mars avec délai, test téléphone. **Ambre** : au moins 3 missions par astre jouables et réglées. **Rouge** : Mars injouable, ou alertes ou débrief cassés | **Ambre** : `enabled: false` sur le reste. **Rouge** : chemin minimum immédiat |
| **Gel** | Aucun S1 ouvert ; faits `verified` ; `verify:release` vert ; mode jury OK | Un S1 ouvert = tous dessus ; sans correction à T+19:30, retour au dernier bon tag |
| **Version finale** | Liste de contrôle des liens passée en production | Retour à `v1-freeze` et redéploiement |

Gravité : **S1** bloque la démo ou plante ; **S2** chiffre ou texte scientifique faux ; **S3** cosmétique (non corrigé après le gel).

# 9. Chemin minimum de démo (si l'on prend du retard)

## 9.1 Déclencheurs

CP1 rouge à T+11, ou CP2 rouge à T+14, ou un S1 sur le parcours principal encore ouvert à T+16. Engagez-vous **tôt** : mieux vaut un petit jeu qui marche qu'un grand qui ne marche pas.

## 9.2 Niveaux

| Niveau | Périmètre | Quand |
|---|---|---|
| L1 Complet | 10 missions, grades/séries/badges, 3D, sons | CP2 vert |
| L2 Réduit | 3 missions par astre, le reste `enabled: false` | CP2 ambre |
| **L3 Chemin minimum** | liste ci-dessous | CP2 rouge ou déclencheurs |
| L4 Urgence | retour au dernier tag qui marche (`cp2` ou `cp1`), vidéo de ce qui tourne, README honnête | rien ne marche à T+18 |

## 9.3 Contenu du chemin minimum (L3)

**Doit fonctionner :**

1. Deux missions : **Moon Relay à Shackleton** et **Mars Relay à Jezero** (le reste `enabled: false`).
2. Facile et Difficile (paramètres).
3. Chargement avec budget, 4 jauges, 6 étapes, styles rapide / équilibré / prudent, **chaque étape avec une cinématique** (au minimum `GenericAction`).
4. Une alerte chronométrée avec un **vrai flare DONKI** (classe, heure, région active).
5. Le moment du **délai Mars** (Ask Mission Control répond en retard).
6. Débrief de victoire (étoiles, source) et de défaite (cause physique, bienveillante).
7. Puces REAL/GAME, Passeport données, pied de page.
8. Mode jury avec deux boutons « Play demo » (Lune et Mars).
9. Nova : présentation de première ouverture + dialogue d'alerte.
10. Sauvegarde : XP et meilleures étoiles.

**Retiré :** écrans de grade, série et badges, scène 3D complète (le `Stage2D` ou une scène de surface simple suffit), sons, missions 2 à 5, deuxièmes sites, APOD, EPIC, Trek, données en direct, e2e.

**Jamais retiré, à aucun niveau :** le moteur, la Lune et Mars, les événements issus de vrais flares DONKI, le débrief, le Passeport données, le mode jury, la sauvegarde, un README honnête.

## 9.4 Vidéo minimale (environ 90 secondes)

| Temps | Contenu |
|---|---|
| 0:00 à 0:10 | « Every button in space costs something. » |
| 0:10 à 0:30 | Moon Relay : chargement, ce que coûte chaque choix, l'action qui se déroule |
| 0:30 à 0:55 | Un vrai flare de classe X : chrono, décision, conséquence |
| 0:55 à 1:15 | Mars Relay : « Ask Mission Control » et le délai |
| 1:15 à 1:30 | Débrief, Passeport données (REAL / GAME), lien |

# 10. Règles de décision

| Si | Avant | Alors |
|---|---|---|
| un endpoint NASA ne répond pas | T+3 | on le note, on garde le sous-ensemble vérifié, le reste est GAME ; **jamais d'invention** |
| règles du moteur non mergées | T+6 | A et E avancent ; B continue sur données factices ; pas de nouvelle règle |
| relay Lune injouable | T+9:30 | tout le monde sur l'intégration |
| moins de 6 missions réglées | T+14 | Ambre : on désactive le reste |
| bots : difficile injouable ou trop facile | T+13 | on ne change que les multiplicateurs de difficulté |
| 3D trop lente sur téléphone | T+15 | `quality: 'low'` par défaut sur mobile, sinon `Stage2D` |
| faits non vérifiés | T+17 | on retire le fait de l'interface, on ne le publie pas |
| image NASA douteuse | T+17 | icône dessinée à la place |
| problème d'hébergement vidéo | T+21:30 | autre hébergeur public ; ne pas rater T+22 |
| échec du déploiement final | T+20 | retour à `v1-freeze` |

**Ordre de coupe (de haut en bas) :** 1) APOD, EPIC, Trek, données en direct, musique ; 2) e2e ; 3) sons ; 4) cinématiques secondaires (garder `GenericAction`) ; 5) « Rejouer une vraie tempête », « Today's Sun » ; 6) avatars en photos (icônes dessinées) ; 7) séries et badges (garder XP et grades) ; 8) missions au-delà de 3 par astre.

# 11. Listes de contrôle

**Gel (T+18)** : tag `v1-freeze` ; `npm run verify:release` vert ; tous les faits `verified` ; mode jury complet ; essai téléphone Lune et Mars ; bugs classés S1, S2, S3.

**Version finale (T+20)** : URL de production en fenêtre privée ; sur téléphone en données mobiles ; depuis le réseau d'un autre membre ; `?judge=1` et Play demo ; pied de page et crédits ; README mis à jour (URL, vidéo, noms, licence).

**Soumission (T+22)** : guide de soumission 2026 relu (durée maximale de la vidéo, sous-titres) ; vidéo publique avec sous-titres anglais ; aucune image ni voix de mineur ; texte nommant chaque jeu de données et la règle qu'il pilote ; liens du dépôt et du jeu ; page de confirmation enregistrée.

# 12. Communication

Un canal pour l'équipe, un pour les journaux d'agents. Point de 10 minutes à chaque checkpoint et chaque repas. Tout blocage est posté avec : ce qui est bloqué, qui peut débloquer, pour quand.
