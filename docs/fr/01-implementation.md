# Documentation technique complète - Implémentation de Junior Astronaut Mission Trainer

Équipe LYTEN | NASA Space Apps Challenge 2026 | Version 1.1 | Public : les 5 développeurs et leurs agents IA

> **À lire d'abord.** Ce document décrit **exactement ce qu'il faut construire**. Il résume et organise les contrats du dépôt : `SPEC.md` (règles moteur, en anglais), `docs/spec/PRESENTATION.md` (immersion, 3D, animations, compagnon, interface), `docs/spec/DATA-CATALOG.md` (données NASA), `docs/TECHNICAL.md` (architecture). En cas de conflit, ce sont ces fichiers du dépôt qui font foi pour les agents. Les tâches, dates et critères d'acceptation sont dans le document 02 (Roadmap), la méthode de travail dans le document 03 (Guide).

# 1. Ce que l'on construit

**Produit.** Une simulation jouable dans le navigateur (aucun téléchargement, aucun compte) pour des enfants de 7 à 12 ans. Le joueur commande un avant-poste sur la **Lune** ou sur **Mars**. Chaque décision coûte quelque chose : **énergie**, **air et eau**, **santé de l'équipage** (radiations) ou **nourriture**. Les aléas reposent sur de vraies données de la NASA.

**Règle d'or pédagogique.** Aucun choix n'est gratuit ni parfait. Ce n'est ni un quiz, ni un diaporama. Une défaite est éducative.

**Objectifs de l'équipe.**

| Objectif | Conséquence concrète |
|---|---|
| Valider le défi (jouable, compromis réels, vraies données, attribution) | Chips REAL/GAME partout, Passeport données, README et SCIENCE.md honnêtes |
| Viser le prix **Best Use of Data** | Catalogue de données large, mais chaque source doit changer une règle ou un visuel (contrat d'intégration) |
| Que ce soit **un vrai jeu**, immersif | Scène 3D persistante, étapes animées dans le temps, compagnon en dialogues, interface épurée |
| Mars **et** Lune | 5 missions par astre, 2 sites par astre, aucun verrouillage |

**Décisions verrouillées.**

- Aucun blocage par XP, grade ou étoiles. Mars est disponible dès le début. La difficulté (Facile, Moyen, Difficile) est **uniquement un changement de paramètres**.
- Grades, séries (streaks) et badges **existent** (en petit nombre) mais n'ouvrent rien.
- Sauvegarde dans `localStorage` (progression conservée).
- Interface en **anglais** ; documentation d'équipe en **français**.
- Tout est généré **dans le code** (SVG, CSS, Three, WebAudio). Les seules photos sont celles de la NASA téléchargées par script.
- Les contenus 3D, les cinématiques et les dialogues sont des exigences, pas des options : ce sont eux qui font un jeu.

# 2. Pile technique et versions épinglées

| Élément | Version épinglée | Remarque |
|---|---|---|
| Next.js (App Router, export statique) | 15.5.29 | `output: 'export'`, pas de serveur |
| React / React DOM | 19.3.1 | |
| three | 0.170.0 | cohérent avec `@types/three` 0.170.0 |
| @react-three/fiber | 9.8.2 | R3F 9 exige React 19 |
| @react-three/drei | **10.7.9** | **drei 10 correspond à fiber 9** (drei 9.x correspond à fiber 8) |
| TypeScript | 5.9.3 | mode strict |
| Vitest | 3.2.7 | tests unitaires |
| tsx | 4.23.15 | scripts Node |
| ESLint | 9.39.5 (flat config) + typescript-eslint | règles de couches |
| Node | 22 (minimum 20) | `.nvmrc` |

Versions vérifiées sur le registre npm avant de figer le scaffold, qui a été installé et testé (typecheck, lint, tests, build). **Ne changez pas une version sans accord** : une mauvaise combinaison React/R3F/drei est la panne la plus fréquente de ce type de projet.

Aucune autre dépendance d'exécution. Pas de Tailwind, pas de librairie d'état, pas de librairie d'animation : le bruit de terrain, les tweens et les particules s'écrivent dans le code du projet.

# 3. Architecture

## 3.1 Vue d'ensemble

Application **statique**. Deux phases :

| Phase | Où | Rôle |
|---|---|---|
| Build (machine du dev) | `scripts/` | Récupérer les données NASA, les réduire, y attacher la provenance, télécharger les images, vérifier l'intégrité |
| Runtime (navigateur de l'enfant) | `src/` | Interface React, moteur pur, scène 3D, dialogues, sauvegarde `localStorage`, aucun appel réseau |

Pas de back-end : un serveur n'apporterait aucun bénéfice en 24 h et ajouterait du risque de déploiement. Hébergement : dossier statique `out/` (Vercel).

## 3.2 Couches et règles de dépendance (imposées par le lint)

| Couche | Peut importer | Interdit |
|---|---|---|
| `engine/` | `engine/` uniquement | React, DOM, `Date`, `Math.random`, `localStorage`, `performance`, toutes les autres couches |
| `content/` | `engine/types` | ui, three, audio, judge, progress, data |
| `progress/` | `engine/types`, `content/badges` | ui, three, audio, judge, data |
| `data/` | `engine/types` | ui, three, audio, judge, progress, content |
| `three/`, `audio/` | `engine/types`, `content/` | ui, judge, progress, data |
| `ui/`, `judge/` | tout le reste | scripts |

Si le lint refuse un import, **on déplace le code à la bonne place**, on ne contourne pas la règle.

## 3.3 Flux d'une étape de mission

1. L'interface envoie une action au moteur (`CHOOSE_OPTION`, `ALERT_CHOICE`, `ASK_MISSION_CONTROL`).
2. Le moteur calcule **instantanément** et de façon déterministe le nouvel état et un événement éventuel.
3. `buildPlayback(prev, next)` (fonction pure) produit un `StepPlayback`.
4. L'interface **rejoue** ce résultat dans le temps (cinématique + jauges qui bougent), puis affiche les conséquences, les alertes, les dialogues.

Principe clé : **le moteur ne connaît pas le temps réel**. Le temps (durée d'une cinématique, compte à rebours d'alerte) appartient à l'interface.

# 4. Arborescence et propriétaires

| Dossier | Contenu | Rôle |
|---|---|---|
| `src/engine/` | `types.ts`, `rng.ts`, `reducer.ts`, `scoring.ts`, `playback.ts`, `bots.ts`, `config/` | A Moteur |
| `src/content/` | missions, sites, archétypes, événements, dialogues, guide, badges | D Contenu |
| `src/progress/` | XP, grades, séries, badges, sauvegarde | D Contenu |
| `src/audio/` | sons synthétisés | D Contenu |
| `src/data/` | snapshots JSON, `facts.ts`, `solar.ts`, `provenance.ts` | C Données |
| `scripts/` | `fetch-nasa-data.ts`, `probe-apis.ts`, `verify-data.ts` | C Données (bots : A) |
| `src/ui/` | écrans, composants, dialogues, hooks de cinématique, Loupe données | B Interface |
| `src/app/` | `GameShell`, layout, styles | B Interface |
| `src/three/` | scène (`stage/`), kit d'avant-poste (`kit/`), cinématiques (`cinematics/`) | E Scène 3D |
| `src/judge/` | mode jury | B (hooks logiques : A) |
| `public/avatars`, `public/sites` | images NASA téléchargées par script | C Données |
| `docs/` | spécifications, documents FR, SCIENCE.md | tous |

# 5. Modèle d'état et de données

La source de vérité des types est `src/engine/types.ts` (gelé à T+1 par le rôle A ; tout changement passe par `CHANGELOG-CONTRACT.md`).

## 5.1 Types principaux (extrait)

| Type | Valeurs / contenu |
|---|---|
| `Body` | `moon`, `mars` |
| `Difficulty` | `easy`, `medium`, `hard` |
| `MeterId` | `power`, `air`, `health`, `food` (jauges de 0 à 100) |
| `Archetype` | `travel`, `deploy`, `drill`, `experiment`, `repair`, `uplink` |
| `OptionStyle` | `fast`, `balanced`, `careful` |
| `SolarLevel` | `calm`, `active`, `stormy` |
| `MissionTemplateId` | `relay`, `core`, `seismic`, `mapper`, `garden` |
| `SiteId` | `shackleton`, `tranquillitatis`, `jezero`, `gale` |
| `Loadout` | équipage 2/3/4, énergie `panels`/`batteries`, bouclier `standard`/`reinforced`, vivres `rations`/`hydroponics` |
| `Provenance` | `source`, `url`, `fetchedAt`, `isLive`, `credit?`, `note?` |
| `Flare` | `id`, `classType`, `peakTime`, `activeRegionNum` |
| `RunState` | graine, tour, astre, mission, site, difficulté, loadout, jauges, étape, drapeaux (nuit, poussière, blackout, dommage panneaux), compteurs d'alertes, journal, statut |
| `StepPlayback` | durée, jauges avant/après, deltas, événement éventuel (voir 8.2) |

## 5.2 Points d'entrée du moteur

- `createRun(params, solar): RunState`
- `resolveStep(state, action, solar): { state, alert? }` — déterministe : mêmes `(graine, actions, solar)` = même résultat. Le tirage utilise `mulberry32(graine + tour)`.
- `scoreRun(state): { stars, xp, incidents }`
- `previewOption(state, style)` — aperçu des coûts pour les pastilles de l'interface (pur).
- `buildPlayback(prev, next): StepPlayback` — pur.

## 5.3 État applicatif (interface)

`AppState` : écran courant (`title`, `destination`, `missions`, `sites`, `difficulty`, `loadout`, `mission`, `debrief`), sélection du joueur, `run`, dernier résultat, `save`, contexte solaire, état du mode jury, pause. Les écrans sont une machine à états ; la pause et les dialogues sont des **calques**, pas des écrans.

## 5.4 Sauvegarde (`localStorage`, clé `jamt.save.v1`)

| Champ | Contenu |
|---|---|
| `profile` | nom de code, avatar |
| `xp`, `streak` (`count`, `lastDay`, `jokerReady`), `badges` | progression |
| `best` | meilleures étoiles par astre-mission et difficulté |
| `stats` | séries de victoires, décisions chronométrées réussies, cadeau de bienvenue reçu |
| `seen` | **moments du compagnon déjà vus** |
| `settings` | `muted`, `extraTime`, `speed` (1, 2 ou 3) |

Règles : lectures/écritures dans `try/catch`, validation de forme, migration par version, données corrompues = nouveau départ sans plantage, si le stockage est bloqué = sauvegarde en mémoire avec bandeau d'information. La seule donnée personnelle est le nom de code tapé par l'enfant. Une mission en cours n'est pas reprise après rechargement (limite connue).

# 6. Règles du moteur (valeurs de conception = GAME RULE)

Toutes les valeurs numériques vivent dans `src/engine/config/` (jamais en dur). Ce sont des **valeurs de départ**, à régler avec les bots.

## 6.1 Chargement initial (budget de 10 points)

| Choix | Coût en points |
|---|---|
| Équipage 2 / 3 / 4 | 2 / 3 / 4 |
| Énergie : panneaux légers / batteries | 2 / 3 |
| Bouclier : standard / renforcé | 1 / 3 |
| Vivres : rations / hydroponie | 1 / 3 |

Le maximum possible est 13 : le joueur **doit renoncer à quelque chose**. Un chargement au-dessus du budget est refusé.

**Jauges de départ** : air 100, santé 100 ; énergie 70 (panneaux) ou 100 (batteries) ; vivres 100 (rations) ou 60 (hydroponie).

## 6.2 Changements passifs à chaque tour (`c` = consommation de la difficulté)

| Effet | Règle |
|---|---|
| Air et eau | `air -= 3 × équipage × c` |
| Vivres (rations) | `food -= 2 × équipage × c` |
| Vivres (hydroponie) | tours 1-2 : `food -= 2 × équipage × c`, `power -= 4`, `air -= 2` ; dès le tour 3 : `food += 1 × équipage` |
| Énergie (panneaux) | `power += 12 × lumière` ; lumière = 1 ; × 1,2 à Shackleton ; × 0 pendant la nuit lunaire ; × 0,5 sous tempête de poussière ; × 0,6 sur Mars |
| Énergie (batteries) | aucune production |
| Entretien du bouclier | renforcé : `power -= 3` par tour |
| Tension d'équipage | si `air < 20` ou `food < 20` : `health -= 3` |

## 6.3 Radiations

`dose = doseDeBase[niveauSolaire] × (dehors ? 1,5 : 1) × bouclier × astre × difficulté`, puis `health -= dose`.

| Paramètre | Valeurs |
|---|---|
| Dose de base | calme 1 ; actif 2,5 ; orageux 4 |
| Bouclier | standard 1,0 ; renforcé 0,4 |
| Astre | Lune 1,0 ; Mars 0,7 |
| Difficulté | facile 0,8 ; moyen 1,0 ; difficile 1,2 |

Le **niveau solaire** vient des vraies données DONKI : `orageux` si une éruption de classe X figure dans les 7 derniers jours de la fenêtre récente, `actif` pour la classe M, sinon `calme`.

## 6.4 Options d'étape

Chaque archétype propose 3 options. Vecteurs de base (avant modificateurs) :

| Style | Énergie | Air | Vivres | Risque de panne | Sens |
|---|---|---|---|---|---|
| Rapide | -14 | -1 | -1 | 25 % | vite, énergivore, risqué |
| Équilibré | -9 | -2 | -2 | 12 % | milieu |
| Prudent | -5 | -4 | -3 | 5 % | sûr mais long : consomme plus d'air et de vivres |

Multiplicateurs d'énergie par archétype : travel ×1,2 ; drill ×1,4 ; deploy ×1,0 ; experiment ×1,0 ; repair ×0,8 ; uplink ×0,6. **Dehors** : travel, deploy, drill ; **dedans** : experiment, repair, uplink. Chaque membre d'équipage au-delà de 2 réduit de 10 % le coût d'énergie (travel, deploy, drill, repair).

**Sites** : Shackleton : coût d'énergie extérieur ×1,15 ; Tranquillitatis : tours 4 à 6 = nuit lunaire ; Jezero et Gale : coût d'énergie des expériences ×0,8 ; Gale : travel ×1,1.

## 6.5 Événements (tirés après chaque étape)

Probabilité d'événement par tour : facile 50 %, moyen 65 %, difficile 80 %. Pas d'événement au tour 1 ; au plus **2 alertes chronométrées** par mission.

| Type | Poids |
|---|---|
| Flare | calme 0,15 ; actif 0,30 ; orageux 0,45 |
| Tempête de poussière | 0,25 sur Mars, 0 sur la Lune |
| Blackout radio | 0,15 sur Mars, 0 sur la Lune |
| Panne | 0,25 (et forcée par le risque de l'option choisie) |

**Flare** : le moteur tire un **vrai enregistrement DONKI** (classe, heure de pic, région active) dont la classe respecte le plafond de la difficulté (facile : M ; moyen et difficile : X).

| Classe | Effet |
|---|---|
| A, B, C | mineur : bruit radio (coût d'`uplink` × 1,15 ce tour), pas de décision |
| M | « Alerte tempête solaire » : dose × 1,4 ce tour, choix A/B/C sans chrono |
| X | **alerte chronométrée** (facile 15 s ; moyen 12 s ; difficile 10 s), mêmes choix |

| Choix | Effet |
|---|---|
| A Bouclier activé | énergie -15, dose × 0,2 |
| B Mettre l'équipage à l'abri | énergie -3, dose × 0,4, l'étape **n'avance pas** |
| C Continuer à travailler | dose × 1,0, l'étape avance |

Expiration du chrono = choix C et `pressureFails += 1`. Choisir A ou B à temps = `pressureWins += 1`.

**Tempête de poussière (Mars, chronométrée)** : A Rentrer les panneaux (production × 0 pendant 2 tours, pas de dégât) ; B Les laisser dehors (production × 0,5 pendant 2 tours, 20 % de dommage permanent de 25 %) ; C Passer sur la réserve (énergie -10 maintenant). **Panne** : A Réparer (énergie -8, l'étape n'avance pas) ; B Rafistoler (énergie -3, risque +0,1) ; C Ignorer (santé -4). **Blackout (Mars)** : « Ask Mission Control » indisponible pendant 2 tours.

## 6.6 Délai de communication

| Astre | Mécanisme |
|---|---|
| Lune | La réponse est immédiate ; étiquette « Signal delay: about 1.2 seconds » (donnée **REAL** citée) |
| Mars | `arrivesOnTurn = tour + délai` (facile 1, moyen 2, difficile 3 tours, valeur **GAME**) ; étiquette de plage réelle : facile « 3 min », moyen « about 12.5 min », difficile « 22 min » (min, moyenne, max du délai NASA 3 à 22 min) |
| Alerte chronométrée | la réponse de la Terre arrive **toujours après** la fin du chrono : le joueur décide seul ; le compagnon l'explique |

## 6.7 Fin de mission, étoiles, difficulté

- **Défaite** : air ≤ 0, vivres ≤ 0, santé ≤ 0, ou énergie à 0 pendant 2 tours consécutifs.
- **Victoire** : 6 étapes accomplies sans défaite.
- **Étoiles** : 1 = gagné ; 2 = gagné et santé ≥ 60 ; 3 = gagné, santé jamais sous 40, aucun échec chronométré, énergie ≥ 25 et air ≥ 25 à la fin.

| Paramètre | Facile | Moyen | Difficile |
|---|---|---|---|
| Consommation | 0,8 | 1,0 | 1,2 |
| Dose de radiations | 0,8 | 1,0 | 1,2 |
| Fréquence d'événements | 0,50 | 0,65 | 0,80 |
| Plafond de flare | M | X | X |
| Chrono d'alerte | 15 s | 12 s | 10 s |
| Délai Mars (tours) | 1 | 2 | 3 |
| Aides | oui | oui | non |

## 6.8 Équilibrage par les bots (`npm run bots`)

1000 parties seedées par combinaison (astre × mission × site × difficulté), avec 3 bots : `random`, `greedy-power`, `balanced`. Cibles : bot `balanced` : facile 70-90 % de victoires, moyen 45-70 %, difficile 20-45 % ; bot `random` : moins de 25 % en moyen et difficile ; au moins 20 % des défaites causées par la santé (les radiations comptent) et au moins 20 % par l'énergie ou l'air ; jamais plus de 6 étapes ; jauges toujours dans 0..100.

# 7. Contenu

## 7.1 Missions : 5 gabarits × 2 astres = 10 missions

| Gabarit | Étapes (archétypes, dans l'ordre) | Lune | Mars |
|---|---|---|---|
| relay | travel, deploy, deploy, repair, uplink, uplink | Moon Relay | Mars Relay |
| core | travel, drill, drill, experiment, repair, uplink | Deep Core Samples | Mars Core Samples |
| seismic | travel, deploy, repair, experiment, experiment, uplink | Moonquake Station | Marsquake Station |
| mapper | deploy, travel, experiment, travel, experiment, uplink | Moon Ice Mapper | Mars Water Mapper |
| garden | deploy, repair, experiment, experiment, repair, uplink | Moon Garden | Mars Garden |

Pour chaque couple gabarit × astre : titre, objectif (20 mots max), 6 textes d'étape (25 mots max, niveau classe 3-6), une ligne « pourquoi c'est important ». **Chaque mission a un drapeau `enabled`** : couper une mission inachevée = changer une ligne ; le sélecteur n'affiche que les missions actives. Les sites ont le même drapeau. Les missions `garden` s'appuient sur une **vraie étude OSDR** choisie par le script.

**Sites** : Lune : Shackleton (lumière quasi continue, relief dur), Mer de la Tranquillité (terrain plat, nuit de 14 jours). Mars : Jezero, Gale. Chaque site a 3 faits courts : soit cités dans `facts.ts`, soit marqués GAME.

## 7.2 Progression (cosmétique, ne verrouille rien)

| XP | Valeur |
|---|---|
| Cadeau de bienvenue (une fois) | +50 |
| Objectif atteint | +100 |
| Équipage en bonne santé (santé ≥ 60) | +80 |
| Chaque décision chronométrée réussie | +50 |
| Trois étoiles | +60 |
| Défaite ou arrêt anticipé (« leçon apprise ») | +25 |
| Série ≥ 3 jours | × 1,2 sur les XP de mission |

**Grades** : Cadet Spatial 0-499 ; Spécialiste de Mission 500-1 499 ; Pilote d'Expédition 1 500-3 499 ; Commandant de Base 3 500-6 999 ; Directeur de Vol NASA 7 000 et plus. **Série** : jours consécutifs (date locale AAAA-MM-JJ), un joker automatique qui se recharge après une série de 7 jours.

| Badge | Condition | Avatar NASA (requête du script) |
|---|---|---|
| Steady Observer | série de 5 jours | astronaute en sortie extravéhiculaire (ISS) |
| Flawless Pilot | 3 victoires d'affilée sans défaite | équipage Orion / Artemis |
| Space Veteran | 7 victoires d'affilée (palier 2 : 15) | rover Perseverance sur Mars |
| Ice Cold | 10 décisions chronométrées réussies sans échec critique | salle de contrôle de Houston |
| Complete Constellation | 3 étoiles en facile, moyen et difficile d'une même mission | écusson du programme Artemis |

# 8. Présentation : un vrai jeu immersif

Cette partie est la plus importante pour le ressenti. Détails dans `docs/spec/PRESENTATION.md`.

## 8.1 Principes de game design

1. Boucle claire : choisir, **voir l'action se dérouler**, subir ou savourer la conséquence. Jamais « clic, clic, clic ».
2. Anticipation (0,4 s), action (2,5 à 5 s), réaction (0,8 s) à chaque étape.
3. **Le compromis se voit** : le choix « prudent » dure plus longtemps à l'écran (le soleil bouge, l'air et les vivres baissent) mais use moins d'énergie.
4. Tension et soulagement en alternance ; pas d'alerte avant le tour 2.
5. Interface **diégétique** : jauges et choix ressemblent à une console de commandement. Les transitions sont des **mouvements de caméra**.
6. Identité : nom de code, écusson de mission, grade, avatars NASA ; une fin de mission ressemble à un débrief de la NASA.
7. « Jus » : léger tremblement à l'alerte, poussière, lumière, sons synthétisés, vibration mobile, pulsation sous 25 %, gerbe d'étoiles à la victoire. Tout est réduit avec `prefers-reduced-motion`.
8. Tout est sautable (toucher = vitesse × 3), pause toujours disponible, jamais plus de 6 s d'attente passive.

## 8.2 Scène 3D persistante

Un seul `<Canvas>` (React Three Fiber) monté dans `GameShell` ; l'interface HTML est **superposée**. Tout est procédural.

| Écran | Scène et caméra |
|---|---|
| Titre | orbite : Terre, Lune, Mars, étoiles |
| Destination | la caméra glisse de la Lune à Mars |
| Missions / Sites | la caméra descend vers l'astre ; deux sites en aperçu |
| Chargement | `SurfaceScene` à l'échelle de l'avant-poste : **les choix apparaissent dans la scène** (2 à 4 astronautes, panneaux ou batteries, plaques de blindage, dôme hydroponique ou caisses de rations) |
| Mission | `SurfaceScene` : terrain, avant-poste, ciel, cycle jour/nuit, cinématiques |
| Débrief | « heure dorée », écusson de mission |

**SurfaceScene** : terrain = plan déplacé par bruit de valeur seedé (`noise.ts`), cratères estampés avec le même RNG, rochers en `InstancedMesh` ; palette et lumière par site (Shackleton : soleil très bas, ombres longues ; Tranquillitatis : gris clair ; Jezero et Gale : ciel orange et brume) ; ciel avec étoiles, soleil, Terre visible depuis la Lune, particules de poussière sur Mars ; **kit d'avant-poste** en primitives (habitat, panneaux, antenne, rover, foreuse, dôme de serre, astronautes). La scène reflète l'état du jeu (panneaux rentrés ou déployés, lumières allumées si énergie > 0, serre qui verdit, dommage visible).

**Niveaux de qualité** : `high` (ombres, dpr 1,5), `low` (sans ombres, moins de particules), `fallback2d` (pas de WebGL ou appareil faible : `Stage2D` en **parallaxe SVG/CSS** par site, mêmes HUD et dialogues). Le jeu reste un jeu.

## 8.3 Cinématiques et lecture d'une étape

Cycle : `choix → anticipation 0,4 s → action (rapide 2,5 s / équilibré 3,5 s / prudent 5 s) → [interlude d'événement 2-3 s → alerte éventuelle] → conséquence 0,8 s`.

- Le moteur calcule tout d'un coup ; l'interface **rejoue** le résultat via `buildPlayback`. Les jauges **s'interpolent pendant l'action**, des deltas flottants (« -9 power ») apparaissent à la conséquence.
- **Bande de progression** : 6 nœuds (icônes d'archétype) avec compteur de « sol » ou « jour ».
- **Aperçu des coûts** sur les cartes d'option : pastilles (1 à 4) par jauge touchée, via `previewOption` ; le détail chiffré est derrière « i » avec chip GAME RULE.

| Archétype | Ce que l'on voit |
|---|---|
| travel | le rover traverse le terrain, poussière, caméra qui suit ; rapide = vitesse, secousses ; prudent = arrêts de reconnaissance |
| deploy | antenne, relais ou panneaux qui se déplient ; rapide = oscillation ; prudent = ancrages et vérification |
| drill | foreuse qui descend, carotte qui remonte ; rapide = étincelles, rougeoiement ; prudent = pauses de refroidissement |
| experiment | module de labo ou serre qui s'allume, anneau de progression ; garden : plantes en accéléré ; mapper : cône de balayage |
| repair | astronaute avec outil, étincelles ; rapide = rafistolage ; prudent = test final |
| uplink | antenne vers la Terre ; Lune : l'impulsion arrive en 1,2 s ; Mars : un paquet traverse lentement l'écran, étiquette « about N min (compressed) » |

**Événements** : flare (flash, teinte du ciel, flux de particules, alarme, équipage qui s'abrite, bulle de bouclier ; le **vrai** flare est affiché : classe, heure, région), tempête de poussière (mur de poussière), panne, blackout radio (parasites), nuit lunaire (coucher de soleil, projecteurs), victoire (lever de soleil, équipage qui fête, écusson), défaite (l'avant-poste s'éteint doucement ; le compagnon intervient avec bienveillance). **Toute cinématique manquante utilise `GenericAction`** (icône, anneau de progression, mouvement de caméra). Version `reduced-motion` : image fixe de 1 s.

## 8.4 Le compagnon : Nova (nom provisoire à valider)

- Petite astronaute dessinée en code (SVG) ; expressions : `neutral`, `happy`, `worried`, `alert`, `thinking`, `proud`.
- Elle apparaît **uniquement dans des boîtes de dialogue** « toucher pour continuer » (portrait, nom, texte en machine à écrire), puis **s'en va**. Toucher une fois = finir la phrase ; encore = suivante ; Entrée/Espace aussi ; appui long = tout passer.
- Ton d'un ami de 12 ans : direct, chaleureux, un peu drôle, jamais condescendant, **jamais de reproche**. 14 mots maximum par boîte, 1 à 4 boîtes par moment, un seul terme technique expliqué à la fois.
- Le jeu est en **pause** pendant un dialogue ; **avant une alerte chronométrée**, le dialogue passe d'abord, puis le compte à rebours démarre.
- Les moments déjà vus sont mémorisés dans `save.seen`.
- **Première ouverture** (8 boîtes, avec projecteurs sur les jauges, la jauge Power et les cartes d'option) : présentation, règle « rien n'est gratuit », les 4 jauges, les éruptions solaires, les 3 styles, elle s'en va. Texte complet dans `docs/spec/PRESENTATION.md` section 4.1.
- **Déclencheurs** : première charge, premier démarrage de mission, premier flare, première alerte chronométrée, premier délai Mars, tempête de poussière, panne, blackout, nuit lunaire, hydroponie ou bouclier renforcé choisis, jauge basse (une fois par mission), première victoire, première défaite (avec la cause), premier badge, premier changement de grade.

## 8.5 Règles d'interface (anti-surcharge, 7 à 12 ans)

1. Un seul élément focal par écran ; **3 choix maximum** visibles.
2. La scène occupe **au moins 60 %** de l'écran en mission ; le HUD vit sur les bords.
3. Icône + **3 mots maximum** par bouton ; les détails sont derrière « i » ou la Loupe données.
4. **4 jauges** en haut au centre : capsule icône + barre + nombre. Couleurs : énergie jaune, air cyan, santé rose, vivres vert, **jamais la couleur seule**.
5. Une famille de police (pile système), 18 px minimum, contraste AA, pas de paragraphe de plus de 25 mots.
6. Mouvements ease-out de 200 à 400 ms ; un seul élément animé pour attirer l'attention.
7. Cibles tactiles 48 px, zones de sécurité, clavier complet (1/2/3, Espace, M).
8. Langage couleur et son cohérent : alerte = orange-rouge + alarme ; succès = vert/cyan + carillon.
9. Mise en page mission : haut gauche = bande de progression ; haut centre = 4 jauges ; haut droite = pause, Loupe, son ; bas = 3 cartes d'option ; compagnon = boîte centrée en bas, seulement quand elle parle.

## 8.6 Loupe données et Passeport données (différenciateur « Best Use of Data »)

- **Loupe données** (icône œil) : calque qui étiquette dans la scène et le HUD tout ce qui vient de la NASA (« REAL : flare M2.5, AR 13664, DONKI, bundled 2026-11-14 ») et ce qui est une règle de jeu (GAME RULE). Désactivée par défaut : l'interface reste propre.
- **Passeport données** : tableau de toutes les sources (utilisée pour quoi, date, LIVE ou BUNDLED, lien), **généré** depuis les snapshots et `facts.ts`.

## 8.7 Son et haptique

Tout est synthétisé (WebAudio) : ambiance grave, clics de console, confirmation d'étape, alarme, tic de compte à rebours, carillon de victoire, extinction de défaite, battement sous 25 %. `unlockAudio()` au premier geste, respect de `muted`. Vibration courte sur alerte si `navigator.vibrate` existe.

## 8.8 Mode jury (judge mode)

Activé par `?judge=1` ou le bouton du titre. Il change l'entrée et la visibilité, **jamais le scoring** : « Play demo » en un clic (Lune, Shackleton, relay, Facile, graine fixe), menu pour forcer un événement (X, M, poussière, panne, blackout), partie courte de 4 étapes, profil de démonstration en mémoire (ne remplace pas la vraie sauvegarde), « Rejouer une vraie tempête » (mai 2024), vitesse réglable, panneau « Science map ».

# 9. Données NASA (objectif Best Use of Data)

## 9.1 Stratégie et contrat d'intégration

On **ne restreint pas** les sources : on embarque toutes celles qui sont utiles et vérifiables. Les données sont récupérées par script, commitées avec leur provenance, et le jeu fonctionne **sans réseau**. Une source ne compte que si :

1. elle est **récupérée et embarquée** avec une `Provenance` complète ;
2. elle a un **crochet de jeu** (elle change une règle ou un visuel visible) ;
3. elle a une **surface** (Loupe données, Passeport, chip REAL) ;
4. elle a un **test** (schéma + crochet).

Un endpoint qui ne répond pas est **rapporté tel quel** ; on n'invente jamais de remplaçant.

## 9.2 Catalogue

| Source | Snapshot | Crochet de jeu | Priorité |
|---|---|---|---|
| DONKI FLR (éruptions) | `donki-flr-recent.json`, `donki-flr-may2024-a/b.json` | vrais flares dans les événements ; niveau du jour ; « rejouer une vraie tempête » | P0 |
| OSDR (études réelles) | `osdr-studies.json` | missions garden, cadre du modèle de santé | P0 |
| Constantes de délai (Lune ~1,2 s, Mars 3 à 22 min) | `facts.ts` | délai Mars | P0 |
| Image Library | `images-avatars.json` + `public/avatars/*` | avatars des badges, légendes | P0 |
| DONKI CME | `donki-cme-recent.json` | alerte d'arrivée un tour avant une tempête | P1 |
| DONKI SEP | `donki-sep-recent.json` | pic de dose de radiation | P1 |
| Images de sites (Image Library) | `images-sites.json` + `public/sites/*` | photo réelle sur la carte de site et le débrief | P1 |
| Image du Soleil (SDO) | `sdo-sun.json` + image | « Today's Sun » daté | P1 |
| InSight (archive) | `insight-archive.json` | température et vent de référence (étiquette « archived ») | P1 |
| Moon Trek / Mars Trek (tuiles) | `trek-tiles.json` | vignette cartographique du site | P2 |
| APOD | `apod-recent.json` | ciel de l'écran titre | P2 |
| EPIC | `epic-earth.json` | Terre dans l'animation de liaison | P2 |
| DONKI GST, IPS, HSS, RBE | `donki-*-recent.json` | « journal météo spatiale » (cartes pédagogiques) | P2 |

**À confirmer par la sonde `npm run data:probe`** (signalements de sources tierces, non vérifiés ici) : DONKI aurait migré vers `ccmc.gsfc.nasa.gov/DONKI-API/get` (sans clé, 30 jours maximum par requête) ; l'ancien APOD serait coupé le 2026-12-01 ; l'API InSight serait figée (sols 675 à 681) ; `DEMO_KEY` serait limitée (~30 requêtes par heure). Mai 2024 doit être récupéré en **2 fenêtres** (limite de 30 jours).

## 9.3 Format, provenance, faits vérifiés

- Chaque snapshot : `{ meta: Provenance, data }`, nommé `<source>-<portée>.json` dans `src/data/snapshots/`. On ne garde que les champs utiles. Budget : 300 Ko de JSON cumulés ; images ≤ 200 Ko chacune, chargées à la demande.
- Les faits cités (délais, durée de la nuit lunaire, etc.) sont dans `src/data/facts.ts` avec `status: 'needs-review'` puis `'verified'` après lecture humaine de la page NASA (rôle C). Le build de release échoue si un fait utilisé est encore `needs-review`.
- `npm run data:verify` (dev) et `npm run data:verify:strict` (release : fichiers P0 présents, faits vérifiés, avatars avec crédit et `nasa_id`, snapshots DONKI non vides).
- Chaque chiffre affiché est **REAL** (source cliquable, date, BUNDLED ou LIVE) ou **GAME RULE**.
- Vérifier les droits d'usage de chaque image NASA (logos et écussons : règles supplémentaires ; en cas de doute, remplacer par une icône dessinée).

## 9.4 Histoires de démonstration (pour la vidéo et le jury)

1. « Rejouer une vraie tempête » (mai 2024). 2. Une alerte avec un vrai flare (classe, région active) et la photo du Soleil datée. 3. Une mission garden avec l'étude OSDR réelle dans le débrief. 4. La carte d'un site avec une photo réelle. 5. Le Passeport données qui liste tout.

# 10. Qualité, tests, performance

## 10.1 Tests automatiques

| Couche | Quoi | Outil |
|---|---|---|
| Architecture | imports et API interdits dans `engine/` | Vitest |
| Moteur | déterminisme, bornes, chaque règle, budget, plafonds d'événements | Vitest |
| Équilibrage | simulation par bots (6.8) | `npm run bots` |
| Progression | XP, bornes de grade (499/500), série et joker, chaque badge | Vitest |
| Sauvegarde | JSON corrompu, ancienne version, stockage qui échoue (mock Map) | Vitest |
| Données | provenance, faits vérifiés, avatars crédités, snapshots non vides | `data:verify` |
| Smoke e2e (P1) | mode jury « Play demo » jusqu'au débrief | Playwright (installation à anticiper) |

## 10.2 Recette manuelle

Android Chrome (tactile seul), Chrome et Firefox de bureau, iOS Safari si possible, clavier seul, `reduced-motion`, WebGL désactivé, hors ligne, CPU ralenti × 4, réseau lent, fenêtre privée, rechargement en pleine mission, un test avec un lecteur de niveau 9-12 ans.

## 10.3 Gravité des bugs

S1 = bloque le parcours de démo ou plante ; S2 = chiffre ou texte scientifique faux ; S3 = cosmétique. Après le gel (T+18), seuls S1 et S2 sont corrigés.

## 10.4 Budgets de performance (cibles, à mesurer aux checkpoints)

JS initial hors chunk Three ≤ 250 Ko gzip ; images ≤ 200 Ko chacune ; 60 images/s visées sur machine moyenne et 30 minimum sur téléphone ; résolution d'une étape moteur < 5 ms ; simulation de 1000 parties par combinaison < 60 s.

## 10.5 Accessibilité

Niveau de lecture classes 3-6 ; glossaire (sol, dose de radiation, latence, microgravité, éruption solaire, régolithe) ; clavier complet ; cibles 48 px ; jauges jamais par la couleur seule ; `aria-live` poli sur le journal et assertif sur les alertes ; option temps supplémentaire (chronos × 2) ; `prefers-reduced-motion` ; contraste AA ; repli 2D.

# 11. Déploiement, vie privée, attribution

- **Hébergement** : Vercel (export statique, sortie `out/`). Repli : Netlify (dossier `out`) ou GitHub Pages (`basePath` et `assetPrefix` = `/<repo>`, fichier `.nojekyll`).
- **Pas de variables d'environnement au runtime.** `NASA_API_KEY` sert uniquement aux scripts locaux (`.env`, jamais commité).
- **Environnements** : staging (chaque push sur `main`), production (tag de release). Retour arrière = redéployer le dernier tag valide.
- **Vie privée** : aucun compte, analytics, cookie, script ou police tiers ; seule donnée stockée : le nom de code, sur l'appareil.
- **Attribution** : pied de page « Educational project built for NASA Space Apps 2026. Not affiliated with or endorsed by NASA. » ; lien « Image credits » ; crédits DONKI/CCMC, OSDR, Image Library. Pas d'image, de voix ou de nom d'un mineur dans la vidéo de démo.

# 12. Erreurs et replis

| Panne | Comportement |
|---|---|
| Snapshot absent ou invalide au build | `data:verify` fait échouer le build |
| Snapshot invalide au runtime | pool vide, niveau `calm`, puce « data unavailable », le jeu continue |
| `localStorage` indisponible | sauvegarde en mémoire + bandeau |
| Sauvegarde corrompue | nouveau départ, copie brute sous `jamt.save.corrupt` |
| WebGL indisponible ou appareil faible | `Stage2D` + `GenericAction` |
| Audio bloqué | silence jusqu'au premier geste |
| Onglet masqué pendant une alerte | pause automatique |
| Exception dans un écran | `ErrorBoundary` « Something went wrong. Restart mission », la sauvegarde n'est jamais effacée |
| Cinématique manquante | `GenericAction` |
| Direct en ligne (P2) en échec | on garde BUNDLED |

# 13. Limites connues et suite

**Limites** : missions de 6 étapes comprimées ; pourcentages et coûts = valeurs de conception ; météo martienne d'archive uniquement ; 2 sites par astre ; mission en cours non reprise après rechargement ; progression dans un seul navigateur ; équilibrage réglé par bots et quelques tests, pas par une étude avec des enfants.

**Après le hackathon** : étude d'utilisabilité avec des enfants et enseignants ; plus de sites et de missions, mode campagne ; code d'export de progression et mode classe ; sources martiennes plus récentes ; traductions (français en premier) ; reprise de mission ; backend léger seulement si classements ou rapports de classe.

# Annexe A. Glossaire

| Terme | Sens |
|---|---|
| Archétype | Type d'étape (trajet, déploiement, forage, expérience, réparation, liaison) |
| Cinématique | Animation de 2 à 5 s qui montre l'étape en train de se dérouler |
| GAME RULE / REAL | Valeur de conception / donnée NASA avec source |
| Snapshot | Fichier JSON de données NASA embarqué avec sa provenance |
| Provenance | Source, URL, date de récupération, direct ou embarqué, crédit |
| Judge mode | Mode d'entrée rapide et de démonstration pour le jury |
| Loupe données | Calque qui montre ce qui vient de la NASA |
| Sol | Jour martien (environ 24 h 40) |
| Latence | Délai d'un signal entre la Terre et l'avant-poste |
| Dose de radiation | Quantité de rayonnement reçue par l'équipage |
